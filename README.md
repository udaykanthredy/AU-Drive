# AI Knowledge Drive 🚀

An AI-powered cloud file distribution and management platform — Google Drive meets AI.

Built with **MERN stack** + **Cloudflare R2** + **FastAPI AI microservice**.

---

## 🏗️ Architecture

```
AU-Drive/
├── client/          # Next.js 14 (App Router) frontend
├── server/          # Express.js REST API
├── ai-service/      # FastAPI AI microservice (Python)
└── infra/           # Docker configs
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- Python >= 3.11
- Docker & Docker Compose

### 1. Clone & Install
```bash
git clone <repo-url>
cd AU-Drive
cp .env.example .env   # Fill in your values
npm install
```

### 2. Start with Docker (recommended)
```bash
docker compose up --build
```

### 3. Start manually
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev

# Terminal 3 — AI Service
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 🌐 Service URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| AI Service | http://localhost:8000 |
| BullMQ Dashboard | http://localhost:5000/admin/queues |

## 🔑 Environment Variables

Copy `.env.example` → `.env` and fill in values. See `.env.example` for documentation on each variable.

## 📋 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, Zustand, TanStack Query |
| Backend | Node.js, Express.js, Mongoose, BullMQ |
| AI Service | FastAPI, LangChain, sentence-transformers |
| Storage | Cloudflare R2 (S3-compatible) |
| Database | MongoDB Atlas |
| Cache/Queue | Redis |
| Infra | Docker, Docker Compose |

## 📂 Roadmap

- [x] Phase 1: Project scaffold
- [ ] Phase 2: Core Drive (upload, folders, preview)
- [ ] Phase 3: Sharing & polish
- [ ] Phase 4: AI pipeline (search, summaries)
- [ ] Phase 5: AI workspace (chat, duplicates, PII)
