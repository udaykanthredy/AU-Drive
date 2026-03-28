"""Semantic search router"""

from fastapi import APIRouter
from app.models.schemas import SearchRequest, SearchResponse

router = APIRouter()


@router.post("/", response_model=SearchResponse)
async def semantic_search(request: SearchRequest):
    """
    Perform semantic search over a user's files using vector similarity.

    TODO Phase 2:
    1. Embed the query text using the same model as file embeddings
    2. Run MongoDB Atlas Vector Search:
       db.embeddings.aggregate([{ $vectorSearch: { queryVector: [...], path: 'vector', ... } }])
    3. Filter results to user's files only (ownerId check)
    4. Return top-K results with snippet + score
    """
    # PLACEHOLDER
    return SearchResponse(query=request.query, results=[])
