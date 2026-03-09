const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name_en: { type: String, required: true },
    name_ta: { type: String, required: true },
    icon: { type: String },
    isMain: { type: Boolean, default: true } // used to separate main vs others
});

module.exports = mongoose.model("Category", categorySchema);
