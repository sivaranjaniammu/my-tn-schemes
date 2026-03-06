const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyToken } = require("../middleware/authMiddleware");
const Document = require("../models/Document");

// Setup Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Get all documents for a user
router.get("/", verifyToken, async (req, res) => {
    try {
        const documents = await Document.find({ userId: req.user.id });
        res.json(documents);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch documents" });
    }
});

// Upload a document
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const { displayName } = req.body;

        const newDoc = new Document({
            userId: req.user.id,
            name: displayName || req.file.originalname,
            fileName: req.file.filename,
            filePath: `/uploads/${req.file.filename}`,
            fileType: req.file.mimetype,
            size: req.file.size
        });

        await newDoc.save();
        res.json(newDoc);
    } catch (err) {
        res.status(500).json({ error: "Failed to upload document" });
    }
});

// Update an existing document metadata (like renaming) or potentially uploading a new file in its place
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const { displayName } = req.body;
        const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });

        if (!doc) {
            return res.status(404).json({ error: "Document not found" });
        }

        doc.name = displayName;
        await doc.save();

        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: "Failed to update document" });
    }
});

// Delete a document
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!doc) {
            return res.status(404).json({ error: "Document not found" });
        }

        const filePath = path.join(__dirname, "..", "uploads", doc.fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Document.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: "Document deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete document" });
    }
});

module.exports = router;
