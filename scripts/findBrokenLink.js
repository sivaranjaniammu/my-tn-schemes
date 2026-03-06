
const mongoose = require('mongoose');
require('dotenv').config();

async function findBrokenLink() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Scheme = require('../models/Scheme');

        console.log("Searching for schemes with broken link 'adi-dravidar'...");
        const schemes = await Scheme.find({
            apply_link: /adi-dravidar/i
        });

        console.log(`Found ${schemes.length} schemes.`);
        schemes.forEach(s => {
            console.log(`- ID: ${s._id} | Name: ${s.scheme_name_en} | Link: ${s.apply_link}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

findBrokenLink();
