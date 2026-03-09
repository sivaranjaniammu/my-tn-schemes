const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { verifyToken } = require("../middleware/authMiddleware");
const Category = require("../models/Category");
const Scheme = require("../models/Scheme");

// ── Initialize Gemini AI ────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use the correct, stable model name
const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction:
        `You are an expert assistant for Tamil Nadu Government Schemes (TNSchemes).
Your job is to answer user questions clearly and accurately.

Rules:
- Focus only on Tamil Nadu government schemes.
- If the question is not related to TN schemes, politely say that the chatbot only provides TN scheme information.
- Give answers in a clear, structured format using markdown.

Answer format (use these bold headers when applicable):
**Scheme Name**
**Description:** ...
**Eligibility:** (bullet list)
**Benefits:** ...
**Required Documents:** (bullet list)
**How to Apply:** ...
**Official Website:** ... (if available)

Keep the explanation simple so that common people can understand.
Do NOT hallucinate or invent schemes. Only provide information from the database context given or your verified knowledge of Tamil Nadu government schemes.`
});

// ── POST /api/chat/message ──────────────────────────────────────────────────
router.post("/message", verifyToken, async (req, res) => {
    const { message, lang } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        // Normalize message for intent checks
        const cleanMsg = message.toLowerCase().trim().replace(/[^\w\s\u0B80-\u0BFF]/g, "").trim();
        const greetingsTa = ["வணக்கம்", "தொடங்கு", "ஹாய்"];

        // Detect "show categories" intent
        const isShowCategories =
            cleanMsg.includes("categories") ||
            cleanMsg.includes("category") ||
            cleanMsg.includes("பிரிவுகள்") ||
            cleanMsg.includes("பிரிவு");

        // ── STEP 1: Greeting → Show Categories (EXISTING FEATURE – UNCHANGED) ──
        const isGreetingEn = /^(hi+|hello+|hey+|hai+|start)(?:\s|$)/i.test(cleanMsg);
        const isGreetingTa = greetingsTa.some(
            (g) => cleanMsg === g || cleanMsg.startsWith(g + " ")
        );
        const isGreeting = isGreetingEn || isGreetingTa || isShowCategories;

        if (isGreeting) {
            const categories = await Category.find({ isMain: true }).sort({ id: 1 });
            const catList = categories.map((c) => `• ${c[`name_${lang}`]}`).join("\n");

            let responseText = "";
            if (lang === "ta") {
                responseText = isShowCategories
                    ? `நிச்சயமாக! இதோ கிடைக்கக்கூடிய திட்டங்களின் பிரிவுகள்:\n\n${catList}`
                    : `வணக்கம்! நான் தமிழ்நாடு அரசுத் திட்டங்கள் குறித்த தகவல்களை வழங்குகிறேன். நீங்கள் கீழ்க்கண்ட பிரிவுகளில் ஒன்றைத் தேர்ந்தெடுக்கலாம்:\n\n${catList}`;
            } else {
                responseText = isShowCategories
                    ? `Certainly! Here are the available scheme categories:\n\n${catList}`
                    : `Hello! I can provide information about Tamil Nadu Government schemes. You can explore the following categories:\n\n${catList}`;
            }

            return res.json({ text: responseText, showCategories: true, categories });
        }

        // ── STEP 2: Category / Keyword Detection (EXISTING FEATURE – UNCHANGED) ─
        const allCategories = await Category.find();
        let matchedCategory = null;

        const categorySynonyms = {
            education: ["student", "school", "college", "pg", "ug", "university", "scholarship", "laptop", "study", "degree", "graduate", "education"],
            health: ["hospital", "doctor", "medicine", "medical", "pregnancy", "insurance", "health", "treatment", "birth", "delivery"],
            farmers: ["agriculture", "farm", "land", "crop", "tractor", "seed", "fertilizer", "irrigation", "farmers", "farming"],
            women: ["lady", "girl", "marriage", "pregnant", "female", "widow", "sewing machine", "women", "girl child"],
            employment: ["job", "work", "skill", "training", "business", "loan", "startup", "company", "unemployed", "employment", "money"],
            pension: ["old age", "senior", "disability", "widow", "pension", "monthly amount", "pensioners"],
            handloom: ["handloom", "weaver", "sari", "cloth", "textile", "thread", "electricity", "loom", "கைத்தறி"],
            rural: ["rural", "village", "development", "panchayat", "green house", "house", "project", "ஊரக"]
        };

        for (const cat of allCategories) {
            const nameEn = cat.name_en.toLowerCase();
            const nameTa = cat.name_ta;
            const synonyms = categorySynonyms[cat.id] || [];

            if (
                cleanMsg.includes(nameEn) ||
                cleanMsg.includes(nameTa) ||
                synonyms.some((s) => cleanMsg.includes(s))
            ) {
                matchedCategory = cat;
                break;
            }
        }

        // ── STEP 3: Database Search (EXISTING FEATURE – UNCHANGED) ────────────
        let schemesQuery = {};
        const isListAll =
            /list all|show all|all scheme|available scheme|everything|give me all/i.test(cleanMsg);

        if (matchedCategory) {
            schemesQuery = { categoryId: matchedCategory.id };
        } else if (isListAll) {
            schemesQuery = {};
        } else {
            const words = cleanMsg.split(/\s+/).filter((w) => w.length > 2);
            if (words.length > 0) {
                const searchRegex = new RegExp(words.join("|"), "i");
                schemesQuery = {
                    $or: [
                        { scheme_name_en: searchRegex },
                        { scheme_name_ta: searchRegex },
                        { description_en: searchRegex },
                        { description_ta: searchRegex },
                        { eligibility_en: searchRegex },
                        { eligibility_ta: searchRegex }
                    ]
                };
            } else {
                schemesQuery = {
                    $or: [
                        { scheme_name_en: { $regex: message, $options: "i" } },
                        { scheme_name_ta: { $regex: message, $options: "i" } }
                    ]
                };
            }
        }

        const schemesFromDb = await Scheme.find(schemesQuery);

        // ── STEP 4: Gemini AI – Handle any scheme-related question ────────────
        let aiText = "";
        try {
            if (
                !process.env.GEMINI_API_KEY ||
                process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY"
            ) {
                throw new Error("Invalid or missing Gemini API Key");
            }

            // Build database context so Gemini can give accurate, grounded answers
            let dbContext = "";
            if (schemesFromDb.length > 0) {
                dbContext =
                    "Use the following database records to answer accurately:\n\n" +
                    schemesFromDb
                        .map((s) => {
                            const name =
                                lang === "ta" ? s.scheme_name_ta : s.scheme_name_en;
                            const desc =
                                lang === "ta" ? s.description_ta : s.description_en;
                            const eligArray =
                                lang === "ta" ? s.eligibility_ta : s.eligibility_en;
                            const elig = Array.isArray(eligArray)
                                ? eligArray.join(", ")
                                : eligArray || "Not specified";
                            const docs = Array.isArray(s.documents)
                                ? s.documents.join(", ")
                                : s.documents || "Not specified";
                            return (
                                `Scheme Name: ${name}\n` +
                                `Description: ${desc}\n` +
                                `Documents Required: ${docs}\n` +
                                `Eligibility: ${elig}\n` +
                                `Apply Link: ${s.apply_link || "Not specified"}`
                            );
                        })
                        .join("\n---\n");
            }

            // Build the user-facing prompt sent to Gemini
            const userPrompt = `User asked the following question about Tamil Nadu government schemes.

Question: "${message}"

${dbContext ? dbContext : "No specific database match found. Use your knowledge of Tamil Nadu government schemes to answer. Do not invent schemes."}

${isListAll
                    ? `IMPORTANT: The user wants ALL schemes listed. There are exactly ${schemesFromDb.length} schemes in the database above. List ALL ${schemesFromDb.length} in a numbered list.`
                    : ""
                }

Respond in ${lang === "ta" ? "Tamil" : "English"}.
Provide a structured, clear answer using the format specified in your instructions.`;

            const result = await model.generateContent(userPrompt);
            const response = await result.response;
            aiText = response.text() || "";

        } catch (aiErr) {
            console.error("Gemini AI Error:", aiErr.message);

            // Fallback messages as specified in requirements
            if (isListAll) {
                aiText =
                    lang === "ta"
                        ? "நிச்சயமாக, இங்கிருக்கும் சில முக்கியமான திட்டங்கள் இதோ:"
                        : "Certainly! Here are some of the available schemes you can explore:";
            } else if (schemesFromDb.length > 0) {
                aiText =
                    lang === "ta"
                        ? "உங்களுக்காக சில தொடர்புடைய திட்டங்களைக் கண்டறிந்துள்ளேன்:"
                        : "I found these relevant schemes based on your request:";
            } else {
                aiText =
                    lang === "ta"
                        ? "மன்னிக்கவும் நண்பா 🙏\nதற்போது திட்டங்கள் தகவல்களை பெற முடியவில்லை.\nதயவுசெய்து சற்று நேரம் கழித்து மீண்டும் முயற்சிக்கவும்."
                        : "Sorry nanba 🙏\nCurrently I cannot fetch scheme information.\nPlease try again later.";
            }
        }

        res.json({ text: aiText, schemes: schemesFromDb });

    } catch (err) {
        console.error("General Chat Error:", err);
        res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
});

module.exports = router;
