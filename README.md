<p align="center">
  <h1 align="center">🏥 MediGuide AI 🤖</h1>
  <p align="center"><strong>Intelligent Medication Management & Medical Intelligence Platform</strong></p>
  <p align="center">
    <em>Upload prescriptions → AI extracts → You verify → Stay healthy</em>
  </p>
</p>

---

## 🌟 Overview

MediGuide AI is a production-grade healthcare platform that automates prescription management, generates smart medication schedules, and provides a verified AI Medical Assistant. Built with a **Hybrid AI pipeline** combining custom-trained YOLOv8 layout detection with Google Gemini 2.5 Flash OCR, grounded by true **Retrieval-Augmented Generation (RAG)** over the OpenFDA drug database.

> **Philosophy:** *"AI suggests, humans verify. Never allow AI to silently make medical decisions."*

---

## 🚀 Key Features

### 🧠 Hybrid AI Prescription Extraction
- **Custom YOLOv8 Model** trained on medical prescription layouts via Roboflow
- **Gemini 2.5 Flash** multimodal OCR with structured JSON output
- Image preprocessing pipeline (grayscale, denoise, CLAHE enhancement)
- Automatic bounding box detection for doctor info, patient info, and medicine blocks

### 🔍 Explainable AI
- Visual bounding box overlays on prescription images
- Per-medicine confidence scores (0–100%)
- Interactive highlight: click a medicine → see where it was found on the image
- Toggle overlay visibility on/off

### ✅ Human-in-the-Loop Verification
- AI extraction halts at "waiting_for_user" state
- Editable form with all extracted fields
- Rule engine warnings displayed before confirmation
- Color-coded confidence indicators (green/amber/red)

### 💊 RAG Medical Assistant
- **ChromaDB** vector database with persistent embeddings
- **Sentence Transformers** (`all-MiniLM-L6-v2`) for semantic search
- Context-grounded responses using verified OpenFDA drug data
- Source citations distinguish "Verified" vs "AI-Generated" information
- Safety disclaimers on every medical response

### **Phase 4: Medical Management (Complete) ✅**
- [x] Improve medical history presentation with a chronological timeline.
- [x] Organize records by doctor and hospital.
- [x] Collect guardian/emergency contact details.
- [x] Implement escalating missed-dose notifications to guardians.

### **Phase 2: MediTrial Integration (Complete) ✅**
- [x] Integrate the MediTrial disease prediction module.
- [x] Allow users to select symptoms and receive AI predictions.
- [x] Display prediction confidence, ML model accuracy, and Explainable AI output (Gemini Fallback).
- [x] Add severity classification: Home Care, Consult Doctor, or Visit Hospital.
- [x] Add hospital appointment links (ORS Portal, eSanjeevani, Practo).

### **Phase 5: Medication Safety (Complete) ✅**
- [x] Implement allergy checking.
- [x] Detect duplicate medications.
- [x] Integrate medication adherence analytics.

### **Phase 6: Offline AI (Complete) ✅**
- [x] Integrate Ollama with Llama 3.3 for text generation.
- [x] Integrate Ollama with LLaVA for vision extraction.
- [x] Design an offline toggle in Settings for environments without internet.

### 📚 Medicine Library
- Comprehensive drug details: descriptions, side effects, interactions, contraindications
- Pregnancy categories and storage instructions
- Green "Verified" badges for OpenFDA-sourced data
- Lazy-loaded and cached in PostgreSQL for efficiency

### ⏰ Smart Medication Reminders
- Automatic schedule generation from verified prescriptions
- APScheduler background cron jobs
- **Local desktop alarm** notifications (Windows `winsound`)
- **Email reminders** via Gmail SMTP with HTML templates and retry logic

### 📋 Prescription Management
- Drag-and-drop image upload (JPEG/PNG/WebP, max 10MB)
- Full prescription history with status tracking
- Detailed prescription view with extracted data
- Reprocess capability for failed extractions

### 🏗️ Production-Ready Deployment
- **Docker Compose** orchestration (Frontend + Backend + PostgreSQL)
- Multi-stage frontend build (Node → Nginx)
- Health checks and graceful service dependencies
- Environment-based feature flags for flexible configuration

---

## 🏛️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   React +   │────▶│   FastAPI    │────▶│   PostgreSQL    │
│   Vite UI   │◀────│   Backend    │────▶│   ChromaDB      │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  YOLOv8  │ │  Gemini  │ │  OpenFDA │
        │  Layout  │ │  2.5     │ │  Drug    │
        │ Detector │ │  Flash   │ │  API     │
        └──────────┘ └──────────┘ └──────────┘
```

### Tech Stack
| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Backend** | FastAPI, SQLAlchemy (async), Pydantic v2 |
| **Database** | PostgreSQL 16 (primary), SQLite (fallback) |
| **AI/LLM** | Google Gemini 2.5 Flash |
| **Object Detection** | Ultralytics YOLOv8 (custom-trained) |
| **RAG** | ChromaDB + Sentence Transformers |
| **Knowledge Base** | OpenFDA Drug Labeling API |
| **Scheduling** | APScheduler |
| **Email** | smtplib + Gmail SMTP |
| **Deployment** | Docker, Docker Compose, Nginx |

---

## 🐳 Quick Start (Docker)

```bash
# 1. Clone the repository
git clone https://github.com/DAREDEVIL-OF-NEXUS/MediGuide.git
cd MediGuide

# 2. Configure environment
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 3. Launch everything
cd ..
docker-compose up --build -d

# 4. Access the app
# Frontend:  http://localhost:5173
# API Docs:  http://localhost:8000/docs
```

## 🛠️ Local Development

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
cp .env.example .env           # Edit with your API keys
python reset_db.py             # Initialize database
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | **Yes** | Google AI Studio API key for OCR and chatbot |
| `OPENFDA_API_KEY` | No | OpenFDA API key (optional, increases rate limits) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SECRET_KEY` | Yes | Session signing key |
| `JWT_SECRET_KEY` | Yes | JWT token signing key |
| `SMTP_USERNAME` | No | Gmail address for email reminders |
| `SMTP_PASSWORD` | No | Gmail App Password for SMTP |
| `USE_RAG` | Yes | Enable ChromaDB vector search (`true`/`false`) |
| `USE_YOLO` | Yes | Enable YOLOv8 detection (`true`/`false`) |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PHASES.md](./PHASES.md) | All 8 development phases with architecture diagrams |
| [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md) | Major architectural decisions and rationale |
| [FINAL_SETUP.md](./FINAL_SETUP.md) | Complete setup guide for new developers |
| [backend/.env.example](./backend/.env.example) | Environment variable template |

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Create a new user account |
| `/auth/login` | POST | Authenticate and receive JWT tokens |
| `/prescriptions/upload` | POST | Upload a prescription image |
| `/prescriptions/{id}/verify` | POST | Submit human-verified extraction |
| `/prescriptions/{id}` | GET | Get prescription details |
| `/prescriptions` | GET | List user's prescriptions |
| `/assistant/chat` | POST | Chat with the RAG Medical Assistant |
| `/medicines` | GET | Browse the medicine library |
| `/medicines/{id}` | GET | Get detailed drug information |
| `/dashboard/stats` | GET | Dashboard statistics |

---

## 👨‍💻 Author

**Lakshay Bharti**
B.Tech Computer Science, Delhi Technological University (DTU)

---

## 📄 License

This project is built for educational and hackathon purposes.
