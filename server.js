/**
 * Tamil Nadu Scheme Eligibility Checker – Server
 * Real authentication: MongoDB + bcrypt + JWT + Google OAuth 2.0
 */

require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const schemeRoutes = require("./routes/schemes");

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * CLIENT_URL = where the React frontend lives.
 *   Dev  → http://localhost:5173  (Vite HMR)
 *   Prod → http://localhost:3000  (Express serves the build)
 *
 * GOOGLE_CALLBACK_URL = the URI registered in Google Cloud Console.
 *   MUST be http://localhost:3000/api/auth/google/callback
 *   (Google always calls back the backend, never the Vite port)
 */
const CLIENT_URL = process.env.CLIENT_URL || `http://localhost:${PORT}`;
const GOOGLE_CALLBACK_URL =
    process.env.GOOGLE_CALLBACK_URL ||
    `http://localhost:${PORT}/api/auth/google/callback`;

// ── Database ──────────────────────────────────────────────────────────────
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅  MongoDB connected"))
    .catch((err) => {
        console.error("❌  MongoDB connection failed:", err.message);
        console.warn("⚠️   Server will start but auth features won't work until MongoDB is running.");
    });

// ── CORS ──────────────────────────────────────────────────────────────────
// Allow the Express server itself, Vite dev server, and CLIENT_URL
const allowedOrigins = Array.from(new Set([
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    CLIENT_URL,
]));

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, mobile apps)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.warn(`⚠️  CORS blocked request from: ${origin}`);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session ───────────────────────────────────────────────────────────────
// Session is required by Passport during the OAuth handshake.
app.use(
    session({
        secret: process.env.SESSION_SECRET || "fallback_secret_change_me",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,          // true only if using HTTPS
            httpOnly: true,
            maxAge: 10 * 60 * 1000, // 10 min – only needed for the OAuth dance
            sameSite: "lax",        // "lax" allows the OAuth redirect cookies to be sent
        },
    })
);

// ── Passport – Google OAuth ───────────────────────────────────────────────
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: GOOGLE_CALLBACK_URL,   // ← From .env, matches Google Console
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const name = profile.displayName;
                const avatar = profile.photos?.[0]?.value || null;

                if (!email) {
                    return done(new Error("No email returned from Google profile"), null);
                }

                // Upsert: find by googleId OR email (handles account linking)
                let user = await User.findOne({
                    $or: [{ googleId: profile.id }, { email }],
                });

                if (user) {
                    // Link googleId if they previously registered with email/password
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.avatar = avatar;
                        await user.save();
                    }
                } else {
                    user = await User.create({
                        name,
                        email,
                        googleId: profile.id,
                        avatar,
                    });
                }

                return done(null, user);
            } catch (err) {
                console.error("Google OAuth strategy error:", err);
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (e) {
        done(e, null);
    }
});

app.use(passport.initialize());
app.use(passport.session());

// ── Static files ──────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ── API Routes ────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/schemes", schemeRoutes);

// ── Health check ──────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        uptime: Math.floor(process.uptime()),
        mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        clientUrl: CLIENT_URL,
        callbackUrl: GOOGLE_CALLBACK_URL,
        timestamp: new Date().toISOString(),
    });
});

// ── SPA Fallback (React Router catch-all) ────────────────────────────────
app.get("*", (req, res) => {
    const indexPath = path.join(__dirname, "public", "index.html");
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({
            error: "Frontend not built yet. Run: npm run build",
        });
    }
});

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🏛️  TN Scheme Bot running at http://localhost:${PORT}`);
    console.log(`   React client at:  ${CLIENT_URL}`);
    console.log(`   OAuth callback:   ${GOOGLE_CALLBACK_URL}\n`);
});
