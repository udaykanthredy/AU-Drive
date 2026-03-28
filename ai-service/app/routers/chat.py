"""RAG Chat router"""

from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat_with_file(request: ChatRequest):
    """
    Answer questions about a file or folder using RAG (Retrieval-Augmented Generation).

    TODO Phase 3:
    1. Determine context scope: single file_id or all files in folder_id
    2. Embed the latest user message
    3. Retrieve top-K relevant chunks from embeddings collection
    4. Build prompt: system context + retrieved chunks + chat history
    5. Call LLM with the prompt
    6. Return answer + source file_ids
    """
    if not request.file_id and not request.folder_id:
        return ChatResponse(
            answer="Please specify a file_id or folder_id to chat with.",
            sources=[],
        )
    # PLACEHOLDER
    return ChatResponse(
        answer="RAG chat not implemented yet (Phase 3).",
        sources=[],
    )
