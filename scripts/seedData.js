require('dotenv').config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Category = require("../models/Category");
const Scheme = require("../models/Scheme");

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected for seeding");

        // Clear existing data
        await Category.deleteMany({});
        await Scheme.deleteMany({});
        console.log("🗑️  Cleared existing categories and schemes");

        const dataPath = path.join(__dirname, "..", "data", "schemes.json");
        const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

        let totalCategories = 0;
        let totalSchemes = 0;

        for (const cat of data.categories) {
            // Save category with isMain from JSON
            await Category.create({
                id: cat.id,
                name_en: cat.name_en,
                name_ta: cat.name_ta,
                icon: cat.icon,
                isMain: cat.isMain !== undefined ? cat.isMain : true
            });
            totalCategories++;

            // Save schemes for this category
            for (const s of cat.schemes) {
                await Scheme.create({
                    categoryId: cat.id,
                    scheme_name_en: s.name_en,
                    scheme_name_ta: s.name_ta,
                    description_en: s.description_en,
                    description_ta: s.description_ta,
                    documents: s.documents || ["Aadhaar Card", "Ration Card", "Income Certificate"],
                    eligibility_en: s.eligibility_en || [],
                    eligibility_ta: s.eligibility_ta || [],
                    apply_link: s.link
                });
                totalSchemes++;
            }
            console.log(`  ✅ Seeded category: ${cat.name_en} (${cat.schemes.length} schemes)`);
        }

        console.log(`\n🚀 Data seeded successfully!`);
        console.log(`   📁 Categories: ${totalCategories}`);
        console.log(`   📋 Schemes: ${totalSchemes}`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedData();
