"""Summarization router"""

from fastapi import APIRouter
from app.models.schemas import SummarizeRequest, SummarizeResponse

router = APIRouter()


@router.post("/", response_model=SummarizeResponse)
async def summarize_file(request: SummarizeRequest):
    """
    Generate a summary and auto-tags for a file's text content.

    TODO Phase 2:
    1. Truncate text to token limit (model context window)
    2. Prompt LLM: "Summarize this document in 2-3 sentences. Also list 3-5 topic tags."
    3. Parse response into summary string + tags list
    4. Update File.summary and File.tags in MongoDB
    """
    # PLACEHOLDER
    return SummarizeResponse(
        file_id=request.file_id,
        summary="Placeholder summary — not implemented yet.",
        tags=[],
    )
