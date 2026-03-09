# 🏛️ TN Scheme Bot

**Tamil Nadu Government Scheme Assistant** — A bilingual (Tamil + English) chatbot that helps citizens discover, check eligibility, view required documents, and apply for Tamil Nadu government schemes.

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 💬 Chatbot UI | Interactive chat interface, quick-chips, typing indicator |
| 🎓 9 Categories | Education, Health, Women, Farmers, Employment, Housing, Pension + more |
| 📋 35+ Schemes | Full documents, eligibility & apply links for each |
| 🌐 Bilingual | Full Tamil + English with one-click toggle |
| 🔐 Auth | Email/Password + Google OAuth 2.0 + JWT |
| 🎨 Dark Theme | Premium UI with glassmorphism & animations |
| 🔍 Search | Real-time scheme search across all categories |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Node.js + Express 4 |
| Database | MongoDB 7 + Mongoose |
| Auth | JWT + Passport.js + Google OAuth 2.0 |
| i18n | i18next + react-i18next |
| Container | Docker + Docker Compose |

---

## 🐳 Docker Setup (Recommended)

### Prerequisites
- [Docker Desktop](https://docs.docker.com/get-docker/) (includes Compose v2)
- Git

### Quick Start

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd tn-scheme-bot

# 2. Create your environment file
cp .env.docker .env
#    ↳ Edit .env with your secrets (JWT_SECRET, MONGO_ROOT_PASS, etc.)

# 3. Build images and start all services
docker compose up -d --build

# 4. Open the app
open http://localhost:3000
```

> The **seeder** container runs automatically on first start and populates MongoDB with all 9 categories and 35 schemes before the app starts.

---

### Docker Services

```
┌─────────────────────────────────────────────────────┐
│  docker compose up -d                               │
│                                                     │
│  ┌─────────────────┐    ┌──────────────────────┐   │
│  │  mongo           │    │  seeder (one-shot)   │   │
│  │  MongoDB 7.0     │◄───│  node seedData.js    │   │
│  │  :27017          │    └──────────────────────┘   │
│  └────────┬─────────┘              │ completes       │
│           │                        ▼                 │
│           │           ┌──────────────────────────┐  │
│           └──────────►│  app                     │  │
│                       │  Express + React build   │  │
│                       │  http://localhost:3000   │  │
│                       └──────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### All Docker Commands

```bash
# ── Production ──────────────────────────────────────────
docker compose up -d              # Start all services (detached)
docker compose up -d --build      # Rebuild images then start
docker compose down               # Stop containers
docker compose down -v            # Stop + delete volumes (fresh DB)
docker compose ps                 # Show container status
docker compose logs -f app        # Stream app logs

# ── Database ────────────────────────────────────────────
docker compose run --rm seeder    # Re-seed the database

# ── Debug ───────────────────────────────────────────────
docker compose exec app sh        # Shell into the app container
docker compose exec mongo mongosh # Connect to MongoDB

# ── Using Makefile (Linux/Mac/WSL) ──────────────────────
make help         # Show all targets
make setup        # Create .env from template
make up           # Start production
make dev          # Start dev stack (Vite HMR on :5173)
make seed         # Re-seed database
make logs         # Tail all logs
make clean        # Remove everything (images + volumes)
make rebuild      # Force full rebuild without cache
```

### Development Stack (Hot Reload)

```bash
# Starts backend in --watch mode + Vite HMR frontend
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Then visit:
#   Backend API: http://localhost:3000
#   Frontend HMR: http://localhost:5173
```

---

## 💻 Local Setup (Without Docker)

### Prerequisites
- Node.js 20+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..

# Configure environment
cp .env.docker .env
# Edit .env: set MONGO_URI=mongodb://localhost:27017/tn-scheme-bot

# Seed database
npm run seed

# Build React frontend
npm run build

# Start Express server (serves React build)
npm start

# OR: Run backend + Vite dev server separately
node server.js &          # Backend on :3000
cd client && npm run dev  # Frontend HMR on :5173
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWTs (min 32 chars) |
| `SESSION_SECRET` | ✅ | Express session secret |
| `MONGO_ROOT_USER` | Docker | MongoDB root username |
| `MONGO_ROOT_PASS` | Docker | MongoDB root password |
| `APP_PORT` | Docker | Host port for the app (default: 3000) |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT |
| `GET` | `/api/auth/google` | ❌ | Initiate Google OAuth |
| `GET` | `/api/schemes/categories` | ✅ JWT | All categories |
| `GET` | `/api/schemes/category/:id` | ✅ JWT | Schemes by category |
| `GET` | `/api/schemes/search?q=...` | ✅ JWT | Full-text search |

---

## 📁 Project Structure

```
tn-scheme-bot/
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── pages/            # Login, Register, Dashboard
│   │   ├── components/       # LanguageToggle
│   │   ├── context/          # AuthContext (JWT decode)
│   │   ├── i18n.js           # Tamil + English translations
│   │   ├── index.css         # Premium dark theme CSS
│   │   └── App.jsx           # Router + AuthProvider
│   └── vite.config.js        # API proxy + build → ../public
├── routes/
│   ├── auth.js               # Register, Login, Google OAuth
│   └── schemes.js            # Categories, schemes, search
├── models/
│   ├── User.js
│   ├── Category.js
│   └── Scheme.js
├── middleware/
│   └── authMiddleware.js     # JWT verifier
├── scripts/
│   └── seedData.js           # DB seeder
├── data/
│   └── schemes.json          # 9 categories, 35 schemes
├── docker/
│   └── mongo-init.js         # MongoDB init (indexes + user)
├── Dockerfile                # Multi-stage build
├── docker-compose.yml        # Production stack
├── docker-compose.dev.yml    # Dev override (Vite HMR)
├── .env.docker               # Environment template
├── .dockerignore
├── Makefile                  # Convenience targets
└── server.js                 # Express app entry point
```

---

## 🌐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services → Credentials → Create OAuth 2.0 Client**
3. Set **Authorized redirect URIs**:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`
4. Copy Client ID & Secret into `.env`

---

## 📦 npm Scripts

```bash
npm start          # Start Express server
npm run seed       # Seed MongoDB with categories & schemes
npm run build      # Build React app → public/
npm run build:start  # Build + start (useful after pulling changes)
```

---

*Built with ❤️ for Tamil Nadu citizens*
