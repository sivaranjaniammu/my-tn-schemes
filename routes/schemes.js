const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Scheme = require("../models/Scheme");
const { verifyToken } = require("../middleware/authMiddleware");

// Get all categories
router.get("/categories", verifyToken, async (req, res) => {
    try {
        // Sort by main categories first
        const categories = await Category.find({}).sort({ isMain: -1, id: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

// Get schemes by category
router.get("/category/:categoryId", verifyToken, async (req, res) => {
    try {
        const schemes = await Scheme.find({ categoryId: req.params.categoryId });
        res.json(schemes);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch schemes" });
    }
});

// Search schemes
router.get("/search", verifyToken, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
        const schemes = await Scheme.find({
            $or: [
                { scheme_name_en: { $regex: q, $options: "i" } },
                { scheme_name_ta: { $regex: q, $options: "i" } },
                { description_en: { $regex: q, $options: "i" } },
                { description_ta: { $regex: q, $options: "i" } }
            ]
        });
        res.json(schemes);
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
});

module.exports = router;
