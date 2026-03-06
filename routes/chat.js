const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { verifyToken } = require("../middleware/authMiddleware");
const Category = require("../models/Category");
const Scheme = require("../models/Scheme");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

router.post("/message", verifyToken, async (req, res) => {
    const { message, lang } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }



    try {
        // Normalize message for greeting and keyword check
        const cleanMsg = message.toLowerCase().trim().replace(/[^\w\s\u0B80-\u0BFF]/g, "").trim();
        const greetingsTa = ["வணக்கம்", "தொடங்கு", "ஹாய்"];

        // Intent detection for categories
        const isShowCategories = cleanMsg.includes("categories") ||
            cleanMsg.includes("category") ||
            cleanMsg.includes("பிரிவுகள்") ||
            cleanMsg.includes("பிரிவு");

        // 1. Check for Greetings or Category List Request
        const isGreetingEn = /^(hi+|hello+|hey+|hai+|start)(?:\s|$)/i.test(cleanMsg);
        const isGreetingTa = greetingsTa.some(g => cleanMsg === g || cleanMsg.startsWith(g + " "));
        const isGreeting = isGreetingEn || isGreetingTa || isShowCategories;

        if (isGreeting) {
            const categories = await Category.find({ isMain: true }).sort({ id: 1 });
            const catList = categories.map(c => `• ${c[`name_${lang}`]}`).join("\n");

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


        // 2. Keyword / Category Detection with Synonyms
        const allCategories = await Category.find();
        let matchedCategory = null;

        // Enhanced category synonyms
        const categorySynonyms = {
            "education": ["student", "school", "college", "pg", "ug", "university", "scholarship", "laptop", "study", "degree", "graduate", "education"],
            "health": ["hospital", "doctor", "medicine", "medical", "pregnancy", "insurance", "health", "treatment", "birth", "delivery"],
            "farmers": ["agriculture", "farm", "land", "crop", "tractor", "seed", "fertilizer", "irrigation", "farmers", "farming"],
            "women": ["lady", "girl", "marriage", "pregnant", "female", "widow", "sewing machine", "women", "girl child"],
            "employment": ["job", "work", "skill", "training", "business", "loan", "startup", "company", "unemployed", "employment", "money"],
            "pension": ["old age", "senior", "disability", "widow", "pension", "monthly amount", "pensioners"],
            "handloom": ["handloom", "weaver", "sari", "cloth", "textile", "thread", "electricity", "loom", "கைத்தறி"],
            "rural": ["rural", "village", "development", "panchayat", "green house", "house", "project", "ஊரக"]
        };

        // Check cleanMsg against names AND synonyms
        for (const cat of allCategories) {
            const nameEn = cat.name_en.toLowerCase();
            const nameTa = cat.name_ta;
            const synonyms = categorySynonyms[cat.id] || [];

            if (cleanMsg.includes(nameEn) || cleanMsg.includes(nameTa) || synonyms.some(s => cleanMsg.includes(s))) {
                matchedCategory = cat;
                break;
            }
        }

        // 3. Database Search (Keywords or List All)
        let schemesQuery = {};
        const isListAll = /list all|show all|all scheme|available scheme|everything|give me all/i.test(cleanMsg);

        if (matchedCategory) {
            schemesQuery = { categoryId: matchedCategory.id };
        } else if (isListAll) {
            schemesQuery = {}; // Get any
        } else {
            const words = cleanMsg.split(/\s+/).filter(w => w.length > 2);
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

        const schemesFromDb = await Scheme.find(schemesQuery); // Do not limit, show all schemes as per requirements

        // 4. AISupport (Gemini) with Fallback
        let aiText = "";
        try {
            if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
                throw new Error("Invalid API Key");
            }

            let contextPrompt = "";
            if (schemesFromDb.length > 0) {
                contextPrompt = "Here is exactly the data from our database to help you:\n" +
                    schemesFromDb.map(s => {
                        const name = lang === "ta" ? s.scheme_name_ta : s.scheme_name_en;
                        const desc = lang === "ta" ? s.description_ta : s.description_en;
                        const eligArray = lang === "ta" ? s.eligibility_ta : s.eligibility_en;
                        const elig = Array.isArray(eligArray) ? eligArray.join(", ") : (eligArray || "Not specified");
                        const docs = Array.isArray(s.documents) ? s.documents.join(", ") : (s.documents || "Not specified");
                        return `Scheme Name: ${name}\n` +
                            `Short Description: ${desc}\n` +
                            `Required Documents: ${docs}\n` +
                            `Eligibility: ${elig}\n` +
                            `Apply Link: ${s.apply_link || "Not specified"}\n`;
                    }).join("\n---\n");
            }

            const systemPrompt = `
You are an AI assistant integrated using Gemini API for a project called "Tamil Nadu Scheme Bot".

STRICT DOMAIN RULE:
You must only provide information related to Tamil Nadu Government welfare schemes.
If the query is outside this domain, reply EXACTLY with:
"I can only provide information about Tamil Nadu Government schemes."

INTELLIGENCE REQUIREMENTS:
1. When the user asks to "list all" or "show all schemes" or asks for exploring schemes generally, you MUST output EVERY SINGLE scheme name that is provided in the Context below. Do NOT pick just the top 5 or top 10. There are exactly ${schemesFromDb.length} schemes provided in the Context below, you MUST list ALL ${schemesFromDb.length} of them in a numbered list.
2. Return ONLY the scheme names for generic list questions unless the user asks for more details about a specific one.
3. For details about a specific scheme, provide EXACTLY:
   - Scheme Name
   - Short Description
   - Required Documents (bullet points)
   - Eligibility (bullet points)
   - Apply Link
4. Never hallucinate new schemes. Give priority to database context.

RESPONSE STYLE:
- Clear, Structured
- Numbered list when showing all schemes
- Bullet format for details
- No unnecessary text
- No emojis

Language: ${lang === 'ta' ? 'Tamil' : 'English'}.

Context (from Database):
${contextPrompt ? contextPrompt : "No specific schemes found."}

User Message: ${message}
`;
            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            aiText = response.text() || "";
        } catch (aiErr) {
            console.error("AI Assistant Error:", aiErr.message);
            // Fallback Text
            if (isListAll) {
                aiText = lang === "ta"
                    ? "நிச்சயமாக, இங்கிருக்கும் சில முக்கியமான திட்டங்கள் இதோ:"
                    : "Certainly! Here are some of the available schemes you can explore:";
            } else if (schemesFromDb.length > 0) {
                aiText = lang === "ta"
                    ? `உங்களுக்காக சில தொடர்புடைய திட்டங்களைக் கண்டறிந்துள்ளேன்:`
                    : `I found these relevant schemes based on your request:`;
            } else {
                aiText = lang === "ta"
                    ? `மன்னிக்கவும், நீங்கள் கேட்ட தகவல் என்னிடம் இல்லை. 'வணக்கம்' என்று தட்டச்சு செய்து அனைத்துப் பிரிவுகளையும் பாருங்கள்.`
                    : `I couldn't find any specific schemes for that. Please try searching for keywords like 'Education' or 'Health', or type 'Hi' to see categories.`;
            }
        }

        res.json({ text: aiText, schemes: schemesFromDb });

    } catch (err) {
        console.error("General Chat Error:", err);
        res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
});

module.exports = router;
