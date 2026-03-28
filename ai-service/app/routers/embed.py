"""
Embedding router — accepts text and stores vector chunks in MongoDB.
Phase 2: Replace placeholder with real embedding pipeline.
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import EmbedRequest, EmbedResponse

router = APIRouter()


@router.post("/", response_model=EmbedResponse)
async def generate_embeddings(request: EmbedRequest):
    """
    Generate and store vector embeddings for a file's text content.

    TODO Phase 2:
    1. Chunk the text using RecursiveCharacterTextSplitter (LangChain)
    2. Generate embeddings via sentence-transformers or OpenAI API
    3. Store each chunk+vector in MongoDB `embeddings` collection
    4. Update File.processingStatus = 'done'
    """
    # PLACEHOLDER — returns mock response
    return EmbedResponse(
        file_id=request.file_id,
        chunks_stored=0,
        status="placeholder — not implemented yet",
    )
