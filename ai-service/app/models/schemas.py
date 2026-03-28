"""Pydantic request/response models for the AI service"""

from pydantic import BaseModel, Field
from typing import Optional


# ── Embedding ─────────────────────────────────────────────────────────────────
class EmbedRequest(BaseModel):
    file_id: str = Field(..., description="MongoDB File document ID")
    text: str = Field(..., description="Extracted text content to embed")
    model: Optional[str] = Field(None, description="Override embedding model")


class EmbedResponse(BaseModel):
    file_id: str
    chunks_stored: int
    status: str


# ── Summarization ─────────────────────────────────────────────────────────────
class SummarizeRequest(BaseModel):
    file_id: str
    text: str = Field(..., max_length=100_000)


class SummarizeResponse(BaseModel):
    file_id: str
    summary: str
    tags: list[str]


# ── Search ────────────────────────────────────────────────────────────────────
class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    user_id: str
    top_k: Optional[int] = Field(5, ge=1, le=20)


class SearchResult(BaseModel):
    file_id: str
    file_name: str
    score: float
    snippet: str


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]


# ── Chat ──────────────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    file_id: Optional[str] = None
    folder_id: Optional[str] = None
    messages: list[ChatMessage]
    user_id: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []  # List of file_ids used as context
