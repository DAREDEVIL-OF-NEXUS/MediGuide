# MediGuide AI 🏥🤖

MediGuide AI is a next-generation Hackathon MVP that automates prescription management, sets up dynamic medication reminders, and provides a verified, AI-driven Medical Assistant using true **Retrieval-Augmented Generation (RAG)** over the OpenFDA database.

## 🚀 Features
- **Prescription Upload:** Extracts medicines and schedules from images using Gemini 2.5 Flash and a mock YOLO pipeline.
- **Human-in-the-Loop Verification:** Review and edit extracted medicines before saving.
- **Smart Reminders:** Automated background scheduler that manages dosages.
- **True RAG Medical Assistant:** AI chatbot that answers questions based on a real OpenFDA vector database rather than hallucinating.
- **Medicine Library:** View comprehensive drug details, warnings, pregnancy categories, and contraindications verified by OpenFDA.

## 🏗️ Architecture
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** FastAPI + SQLAlchemy (PostgreSQL with graceful SQLite fallback)
- **AI/LLM:** Google Gemini 2.5 Flash
- **RAG & Vector DB:** ChromaDB + Sentence Transformers (`all-MiniLM-L6-v2`)
- **Knowledge Base:** OpenFDA Drug Labeling API

## 🐳 Running in Production (Docker)

To run the entire stack (Frontend, Backend, PostgreSQL) with one command:

1. Copy the environment variables template:
   ```bash
   cd backend
   cp .env.example .env
   # Add your GEMINI_API_KEY to the .env file!
   ```

2. Run Docker Compose:
   ```bash
   docker-compose up --build -d
   ```

3. Access the app:
   - Frontend: `http://localhost:5173`
   - Backend API Docs: `http://localhost:8000/docs`

## 🛠️ Running Locally (Development)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GEMINI_API_KEY

# Optional: Generate DB migrations if needed
# python -m alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Environment Variables
Check `backend/.env.example` for all configurable variables. Key ones include:
- `GEMINI_API_KEY`: Required for prescription extraction and Assistant reasoning.
- `OPENFDA_API_KEY`: Optional but recommended for higher rate limits on the drug knowledge base.
- `DATABASE_URL`: Connection string to PostgreSQL. If unreachable, falls back to `FALLBACK_SQLITE_URL`.
- `USE_RAG=true`: Enables ChromaDB vector embedding.
- `USE_REAL_MEDICINE_DATABASE=true`: Enables fetching real facts from OpenFDA.

## 📚 API Documentation
Once running, visit `http://localhost:8000/docs` for interactive Swagger documentation covering:
- `/auth`: Login/Register JWT authentication
- `/prescriptions`: Upload and verify images
- `/assistant`: Chatbot endpoints
- `/medicines`: Medical knowledge base endpoints
- `/dashboard`: Overall metrics
