const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema({
    categoryId: { type: String, required: true },
    scheme_name_en: { type: String, required: true },
    scheme_name_ta: { type: String, required: true },
    description_en: { type: String, required: true },
    description_ta: { type: String, required: true },
    documents: [{ type: String }], // Array of documents needed
    eligibility_en: [{ type: String }],
    eligibility_ta: [{ type: String }],
    apply_link: { type: String }
});

module.exports = mongoose.model("Scheme", schemeSchema);
