"""
AI Knowledge Drive — FastAPI AI Microservice
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.routers import embed, summarize, search, chat
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events"""
    # TODO Phase 2: Initialize embedding model on startup
    # from app.services.embedding_service import load_model
    # await load_model()
    print("🚀 AI Service starting up...")
    yield
    # Cleanup on shutdown
    print("🛑 AI Service shutting down...")


app = FastAPI(
    title="AU-Drive AI Service",
    description="AI microservice for semantic search, summarization, and RAG chat",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    # Internal service — only allow requests from the Express backend
    allow_origins=[settings.SERVER_URL, "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(embed.router, prefix="/embed", tags=["Embeddings"])
app.include_router(summarize.router, prefix="/summarize", tags=["Summarization"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "au-drive-ai",
        "version": "1.0.0",
        # TODO Phase 2: Add model status, MongoDB connection status
    }


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {"message": "AU-Drive AI Service", "docs": "/docs"}
