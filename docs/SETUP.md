# MediGuide-AI — Setup Guide

## Prerequisites

| Tool | Version | Installation |
|------|---------|-------------|
| Python | 3.11+ | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Docker | Latest | [docker.com](https://docker.com) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

## API Keys Required

### 1. Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to your `.env` file as `GEMINI_API_KEY`

### 2. Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings → API** to get your project URL and anon key
4. Go to **Storage** and create a bucket named `prescriptions`
5. Set the bucket to **public** (for image viewing) or configure RLS policies
6. Copy URL and key to your `.env` file

## Step-by-Step Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/mediguide-ai.git
cd mediguide-ai
```

### 2. Start PostgreSQL
```bash
docker-compose up -d
```
Verify it's running:
```bash
docker-compose ps
```

### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux

# Edit .env with your API keys
# At minimum, set: SECRET_KEY, GEMINI_API_KEY, SUPABASE_URL, SUPABASE_KEY

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 5. Verify Setup
- **Frontend**: http://localhost:5173
- **Backend API docs**: http://localhost:8000/docs
- **Health check**: http://localhost:8000/api/v1/health

## Troubleshooting

### Database Connection Error
```
Make sure Docker is running and the PostgreSQL container is up:
docker-compose up -d
docker-compose logs db
```

### Alembic Migration Error
```
Make sure DATABASE_URL in .env matches docker-compose.yml credentials.
Default: postgresql+asyncpg://mediguide:mediguide@localhost:5432/mediguide
```

### CORS Error in Browser
```
Ensure CORS_ORIGINS in backend .env includes your frontend URL:
CORS_ORIGINS=["http://localhost:5173"]
```
