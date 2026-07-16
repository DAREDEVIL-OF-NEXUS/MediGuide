# MediGuide AI — Complete Setup Guide

> Everything a new developer needs to clone, configure, and run the full MediGuide AI stack.

---

## 1. Prerequisites

| Tool | Version | Purpose | Download |
|------|---------|---------|----------|
| **Python** | 3.11+ | Backend runtime | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18+ | Frontend build | [nodejs.org](https://nodejs.org/) |
| **PostgreSQL** | 15+ or 16+ | Primary database | [postgresql.org](https://www.postgresql.org/download/) |
| **Docker Desktop** | 24+ | Production deployment | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com/) |

---

## 2. API Keys

| Service | Purpose | Required? | Free Tier | How to Obtain | .env Variable |
|---------|---------|-----------|-----------|---------------|---------------|
| **Google Gemini** | Prescription OCR + Chatbot | **Yes** | ✅ 15 RPM | [Google AI Studio](https://aistudio.google.com/app/apikey) → Create API Key | `GEMINI_API_KEY` |
| **OpenFDA** | Drug database queries | No | ✅ 120k/day | [OpenFDA](https://open.fda.gov/apis/authentication/) → Request key via email | `OPENFDA_API_KEY` |
| **Gmail SMTP** | Email reminders | No | ✅ 500/day | Google Account → 2FA → [App Passwords](https://myaccount.google.com/apppasswords) | `SMTP_PASSWORD` |

---

## 3. Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```env
# Database
DATABASE_URL=postgresql+asyncpg://mediguide:mediguide@localhost:5432/mediguide
FALLBACK_SQLITE_URL=sqlite+aiosqlite:///./mediguide.db

# Security
SECRET_KEY=generate-a-random-string-here
JWT_SECRET_KEY=generate-a-random-string-here

# API Keys
GEMINI_API_KEY=your_gemini_key_here
OPENFDA_API_KEY=your_openfda_key_here

# Feature Flags
USE_GEMINI=true
USE_RAG=true
USE_YOLO=true
USE_REAL_MEDICINE_DATABASE=true
USE_EMAIL_REMINDERS=false

# SMTP (only if USE_EMAIL_REMINDERS=true)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_gmail@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_gmail@gmail.com
```

---

## 4. Directory Structure

```
MediGuide-AI/
├── backend/
│   ├── app/
│   │   ├── ai/                  # AI pipelines
│   │   │   ├── extraction.py    # Gemini OCR
│   │   │   ├── preprocessing.py # Image enhancement
│   │   │   ├── prompts.py       # LLM prompt templates
│   │   │   ├── validation.py    # Rule engine
│   │   │   └── yolo/
│   │   │       ├── yolo.py      # YOLO detector class
│   │   │       └── models/
│   │   │           └── best.pt  # Custom-trained weights
│   │   ├── core/                # Auth, exceptions, dependencies
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── routers/             # FastAPI route handlers
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── services/            # Business logic layer
│   │   ├── config.py            # Settings (loads .env)
│   │   ├── database.py          # DB engine + session
│   │   └── main.py              # FastAPI app entry point
│   ├── chroma_db/               # ChromaDB vector storage
│   ├── requirements.txt
│   ├── reset_db.py              # DB schema reset utility
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route pages
│   │   ├── services/            # API client (axios)
│   │   └── App.jsx              # Router + layout
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── docker-compose.yml
├── README.md
├── PHASES.md
├── ARCHITECTURE_DECISIONS.md
└── FINAL_SETUP.md (this file)
```

---

## 5. Running Locally

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows
pip install -r requirements.txt
cp .env.example .env             # Fill in your API keys
python reset_db.py               # Create database tables
uvicorn app.main:app --reload    # Starts on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                      # Starts on http://localhost:5173
```

---

## 6. Running with Docker

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Access
# Frontend:  http://localhost:5173
# Backend:   http://localhost:8000/docs
```

---

## 7. YOLO Model Setup

The custom YOLOv8 model was trained on a [Roboflow medical prescription dataset](https://universe.roboflow.com/medicalprescription/medical-prescription-hkxmd-5pkrh).

- **Expected file:** `backend/app/ai/yolo/models/best.pt`
- **Ultralytics version:** `>=8.0.0`
- **Image size:** 640×640
- **Fallback:** If `best.pt` is absent, the system sends the full image to Gemini directly

To retrain:
1. Open [Google Colab](https://colab.research.google.com/)
2. Enable GPU runtime (Runtime → Change runtime type → T4 GPU)
3. Download dataset from Roboflow and train with `ultralytics`
4. Copy `runs/detect/train/weights/best.pt` to the location above

---

## 8. Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: aiosqlite` | Run `pip install aiosqlite` |
| PostgreSQL connection refused | Ensure PostgreSQL is running; or set `USE_SQLITE_FALLBACK=true` |
| Gemini API errors | Check `GEMINI_API_KEY` is valid; check rate limits (15 RPM free tier) |
| YOLO not loading | Verify `best.pt` exists at `backend/app/ai/yolo/models/best.pt` |
| Email not sending | Enable 2FA on Google Account; generate App Password |
| Docker build fails | Ensure Docker Desktop is running; check `.dockerignore` files |
