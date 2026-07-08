# 🏥 MediGuide-AI

> AI-powered medication adherence platform that transforms prescriptions into personalized, understandable, and actionable medication plans.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-Vision-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

## 🎯 Problem

Medication non-adherence is a **$300B+ global healthcare problem**. Patients struggle with:
- Unreadable handwritten prescriptions
- Complex dosage schedules they forget
- No understanding of *why* they take each medicine
- No tracking of adherence over time

## 💡 Solution

MediGuide-AI uses a **hybrid AI pipeline** to:
1. **Understand** prescriptions using YOLO layout detection + Gemini Vision
2. **Explain** medications in plain language with side effects and interactions
3. **Schedule** dosages and send smart reminders
4. **Track** adherence with analytics and insights
5. **Assist** with an AI chatbot that knows your medication history

## 🏗️ Architecture

```
Prescription Image
  → OpenCV Preprocessing
  → YOLO Layout Detection (Phase 2)
  → Gemini Vision Extraction
  → Structured JSON
  → Validation Layer
  → Medication Intelligence Engine
  → PostgreSQL
  → Dashboard & Reminder System
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, PostgreSQL |
| AI/ML | Gemini Vision, OpenCV, YOLO (Phase 2) |
| Storage | Supabase Storage |
| Notifications | Firebase Cloud Messaging (Phase 3) |
| Deployment | Vercel (FE) + Railway (BE) |

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (for PostgreSQL)

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/mediguide-ai.git
cd mediguide-ai
```

### 2. Start Database

```bash
docker-compose up -d
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

# Configure environment
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux
# Edit .env with your API keys

# Run migrations

alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup

```bash
cd frontend
npm install

# Start dev server
npm run dev
```

### 5. Open the App

Navigate to `http://localhost:5173`

## 📁 Project Structure

```
MediGuide/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── ai/        # AI pipeline (OpenCV, Gemini)
│   │   ├── core/      # Security, logging, exceptions
│   │   ├── models/    # SQLAlchemy models
│   │   ├── routers/   # API endpoints
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/  # Business logic
│   │   └── utils/     # Helpers (storage, etc.)
│   └── alembic/       # Database migrations
├── frontend/          # React frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
├── ai/                # AI model training (Phase 2)
├── docs/              # Documentation
└── docker-compose.yml # PostgreSQL
```

## 🔑 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing key |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase anon key |

## 📊 Development Phases

- [x] **Phase 1**: Foundation — Auth, Upload, Basic AI Extraction
- [x] **Phase 2**: Intelligence — YOLO Layout Model, Drug Knowledge, Schedules
- [x] **Phase 3**: Adherence — Reminders, Tracking, Analytics
- [x] **Phase 4**: Polish — AI Assistant Chat, Dynamic Dashboard, Production-ready Builds

---

## 🧠 Machine Learning & Model Training

### 1. YOLOv8 Layout Detection Model
We train a custom **YOLOv8n** model to segment prescriptions into 5 critical layout regions: `clinic_header` (0), `doctor_info` (1), `patient_info` (2), `medicine_block` (3), and `signature` (4).

To prepare the dataset and train the model:
```bash
# 1. Generate bounding box coordinates from dataset and structure files
python ai/yolo/prepare_data.py

# 2. Train the YOLOv8 model for 5 epochs
python ai/yolo/train.py
```
This copies the trained weights to `ai/yolo/models/best.pt`.

### 2. Gemini Vision Benchmarking
To benchmark extraction accuracy against the dataset's ground truth annotations (test split):
```bash
python ai/benchmark_gemini.py --limit 10
```
This runs the test images through the pipeline, performs fuzzy and strict validations, and exports statistics to `ai/gemini_benchmark_results.json`.

---

## 🧪 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 👨‍💻 Author

Built by **Rishabh Goyal** — B.Tech CSE, DTU

## 📄 License

This project is licensed under the MIT License.
