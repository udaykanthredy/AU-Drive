"""
Application configuration — loaded from environment variables
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Server ────────────────────────────────────────────────────────────────
    SERVER_URL: str = "http://localhost:5000"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENV: str = "development"

    # ── MongoDB ───────────────────────────────────────────────────────────────
    MONGO_URI: str = "mongodb://localhost:27017/au-drive"

    # ── Redis ─────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379"

    # ── AI Model Config ───────────────────────────────────────────────────────
    # Phase 2: Set to 'local' to use sentence-transformers (free, slower)
    # or 'openai' to use OpenAI embeddings (fast, paid)
    EMBEDDING_PROVIDER: str = "local"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # ── LLM Config ────────────────────────────────────────────────────────────
    LLM_PROVIDER: str = "openai"  # 'openai' | 'gemini'
    LLM_MODEL: str = "gpt-4o-mini"
    MAX_TOKENS: int = 1024
    TEMPERATURE: float = 0.1

    # ── RAG Config ────────────────────────────────────────────────────────────
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50
    TOP_K_RESULTS: int = 5

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
