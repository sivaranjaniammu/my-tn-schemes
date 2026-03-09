
const mongoose = require('mongoose');
require('dotenv').config();

async function fixBrokenLinks() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Scheme = require('../models/Scheme');

        console.log("Updating broken links...");

        // 1. Scholarship for SC/ST Students
        await Scheme.updateOne(
            { scheme_name_en: "Scholarship for SC/ST Students" },
            { apply_link: "https://tnadtwscholarship.tn.gov.in/" }
        );

        // 2. Post Matric Scholarship for SC/ST
        await Scheme.updateOne(
            { scheme_name_en: "Post Matric Scholarship for SC/ST" },
            { apply_link: "https://tnadtwscholarship.tn.gov.in/postmatric" }
        );

        // 3. Adi Dravidar Housing Scheme
        await Scheme.updateOne(
            { scheme_name_en: "Adi Dravidar Housing Scheme" },
            { apply_link: "https://www.tn.gov.in/department/1" }
        );

        // 4. Special Component Plan for SC Development
        await Scheme.updateOne(
            { scheme_name_en: "Special Component Plan for SC Development" },
            { apply_link: "https://adw.tn.gov.in/" }
        );

        console.log("Links updated successfully.");

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

fixBrokenLinks();
