# 🚀 Lansy.ai

**AI-Powered CV Generator for the Tunisian Job Market**

Lansy.ai helps job seekers create tailored, ATS-optimized CVs in seconds. Paste a job offer, fill in your profile, and get a professionally generated CV with an ATS compatibility score.

## ✨ Features

- 🤖 **AI-Powered Generation** — Google Gemini 1.5 Flash analyzes job offers and generates tailored CVs
- 📊 **ATS Scoring** — Real-time ATS compatibility score (0-100) with keyword matching
- 📄 **3 CV Templates** — Modern, Classic, and Minimal designs
- 🌍 **Multilingual** — French, English, and Arabic support
- 🪙 **Token System** — Pay-per-use with affordable packages in Tunisian Dinar
- 💾 **Profile Saving** — Save your info once, generate unlimited tailored CVs
- 📱 **Mobile Responsive** — Works on all devices

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, Python 3.11+, SQLAlchemy 2.0 |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| AI | Google Gemini 1.5 Flash, LangChain, ChromaDB |
| Auth | Supabase |
| Payments | Konnect (Tunisian gateway) |
| PDF | @react-pdf/renderer (client), WeasyPrint (server) |

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### 1. Clone & Configure

```bash
git clone <repo-url> lansy-ai
cd lansy-ai
cp .env.example .env
# Edit .env with your API keys
```

### 2. Start with Docker Compose

```bash
docker-compose up --build
```

This starts:
- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:8000
- **PostgreSQL** → localhost:5432
- **Redis** → localhost:6379
- **ChromaDB** → localhost:8001

### 3. Local Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📡 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/sync-user` | Sync Supabase user |
| POST | `/api/v1/cv/analyze-offer` | Analyze job offer (free) |
| POST | `/api/v1/cv/generate` | Generate CV (1 token) |
| GET | `/api/v1/cv/history` | Past CV sessions |
| GET | `/api/v1/tokens/balance` | Token balance |
| POST | `/api/v1/tokens/purchase` | Buy tokens via Konnect |

## 🪙 Token Packages

| Package | Tokens | Price (DT) |
|---------|--------|-----------|
| Starter | 10 | 5 DT |
| Pro ⭐ | 35 | 15 DT |
| Premium | ∞/month | 35 DT/m |
| Étudiant 🎓 | 20 | 8 DT |

New users receive **3 free tokens** on signup.

## 📁 Project Structure

```
lansy-ai/
├── frontend/          # Next.js 14 App
├── backend/           # FastAPI Python
├── docker-compose.yml
├── .env.example
└── README.md
```

## 📄 License

Proprietary — All rights reserved.
