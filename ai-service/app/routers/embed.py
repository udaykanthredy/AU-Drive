"""
Embedding router — accepts text, generates vector chunks, stores in MongoDB.
"""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from app.models.schemas import EmbedRequest, EmbedResponse
from app.services.embedding_service import embedding_service
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


def get_db():
    """Get a Motor async MongoDB client and database."""
    client = AsyncIOMotorClient(settings.MONGO_URI)
    return client["au-drive"]


@router.post("/", response_model=EmbedResponse)
async def generate_embeddings(request: EmbedRequest) -> EmbedResponse:
    """
    Generate and store vector embeddings for a file's text content.

    Pipeline:
      1. Chunk the text using LangChain RecursiveCharacterTextSplitter
      2. Batch-embed all chunks with sentence-transformers (all-MiniLM-L6-v2)
      3. Upsert each chunk+vector into the `embeddings` collection
      4. Update File.processingStatus in the `files` collection

    - **file_id**: MongoDB `_id` of the file to process.
    - **text**: Extracted plain text content of the file.
    """
    if not request.text.strip():
        logger.info(f"Empty text for file_id={request.file_id}. Skipping embedding.")
        return EmbedResponse(file_id=request.file_id, chunks_stored=0, status="skipped_empty")

    logger.info(f"Starting embedding for file_id={request.file_id} ({len(request.text)} chars)")

    db = get_db()

    # ── Step 1: Chunk ─────────────────────────────────────────────────────────
    chunks = embedding_service.chunk_text(request.text)
    logger.info(f"Split into {len(chunks)} chunks for file_id={request.file_id}")

    # ── Step 2: Batch embed ───────────────────────────────────────────────────
    vectors = await embedding_service.embed_batch(chunks)

    # ── Step 3: Upsert embeddings into MongoDB ────────────────────────────────
    # Delete any existing embeddings for this file (re-processing case)
    try:
        file_object_id = ObjectId(request.file_id)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid file_id: {request.file_id}")

    await db.embeddings.delete_many({"fileId": file_object_id})

    now = datetime.now(timezone.utc)
    embedding_docs = [
        {
            "fileId": file_object_id,
            "chunkIndex": i,
            "text": chunk,
            "vector": vector,
            "model": settings.EMBEDDING_MODEL,
            "createdAt": now,
            "updatedAt": now,
        }
        for i, (chunk, vector) in enumerate(zip(chunks, vectors))
    ]

    if embedding_docs:
        await db.embeddings.insert_many(embedding_docs)

    # ── Step 4: Update File.processingStatus ─────────────────────────────────
    await db.files.update_one(
        {"_id": file_object_id},
        {"$set": {"processingStatus": "processing", "updatedAt": now}},
    )

    logger.info(
        f"Stored {len(embedding_docs)} embedding chunks for file_id={request.file_id}"
    )

    return EmbedResponse(
        file_id=request.file_id,
        chunks_stored=len(embedding_docs),
        status="done",
    )
