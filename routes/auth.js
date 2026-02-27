const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");

// ── Helper: sign a JWT ──────────────────────────────────────────────────────
function signToken(user) {
    return jwt.sign(
        { id: user._id, name: user.name, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// ── POST /api/auth/register ─────────────────────────────────────────────────
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email address." });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
        }

        // Duplicate check
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ success: false, message: "An account with this email already exists." });
        }

        // Hash & save
        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email: email.toLowerCase(), password: hashed });

        const token = signToken(user);
        return res.status(201).json({ success: true, token, name: user.name, email: user.email });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
});

// ── POST /api/auth/login ────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        // Google-only accounts have no password
        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: "This account uses Google Sign-In. Please use the Google button.",
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        const token = signToken(user);
        return res.json({ success: true, token, name: user.name, email: user.email });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
});

// ── GET /api/auth/google ────────────────────────────────────────────────────
// Initiate Google OAuth – pass scope and a custom state param
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account",   // Always show account picker
    })
);

// ── GET /api/auth/google/callback ───────────────────────────────────────────
// Google redirects here after account selection.
// We generate a JWT and redirect the BROWSER to the React app with the token
// in the URL so the React Login component can pick it up regardless of port.
router.get(
    "/google/callback",
    // On failure: redirect to React app login page with error flag
    (req, res, next) => {
        passport.authenticate("google", { session: false }, (err, user, info) => {
            const clientUrl = process.env.CLIENT_URL || `http://localhost:${process.env.PORT || 3000}`;

            if (err || !user) {
                const msg = err?.message || "google_auth_failed";
                console.error("Google OAuth error:", msg);
                // Redirect back to the React login page with an error flag
                return res.redirect(`${clientUrl}/?error=${encodeURIComponent(msg)}`);
            }

            try {
                const token = signToken(user);
                // ─── KEY FIX ───────────────────────────────────────────────
                // Redirect to the React app (CLIENT_URL) with token=... in the
                // query string. React's Login component reads this and calls
                // login(), then navigates to /dashboard.
                // This works whether React is on :5173 (dev) or :3000 (prod).
                return res.redirect(`${clientUrl}/?token=${token}`);
            } catch (tokenErr) {
                console.error("Token signing error:", tokenErr);
                return res.redirect(`${clientUrl}/?error=token_error`);
            }
        })(req, res, next);
    }
);

module.exports = router;
