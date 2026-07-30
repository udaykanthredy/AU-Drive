"""Semantic search router"""

from fastapi import APIRouter
import numpy as np
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from app.models.schemas import SearchRequest, SearchResponse, SearchResult
from app.services.embedding_service import embedding_service
from app.config import settings

router = APIRouter()


def get_db():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    return client["au-drive"]


def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    a = np.array(v1)
    b = np.array(v2)
    # Vectors from sentence-transformers are already normalized, so dot product is sufficient.
    # But just in case, compute full cosine similarity:
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


@router.post("/", response_model=SearchResponse)
async def semantic_search(request: SearchRequest) -> SearchResponse:
    """
    Perform semantic search over a user's files using vector similarity.
    Since we are using local MongoDB without Atlas Vector Search, 
    we fetch all chunks for the user's files and compute cosine similarity in-memory.
    """
    db = get_db()
    
    # 1. Embed the search query
    query_vector = await embedding_service.embed_text(request.query)

    # 2. Get all file IDs owned by the user
    user_id = ObjectId(request.user_id)
    files_cursor = db.files.find({"ownerId": user_id, "isDeleted": False}, {"name": 1})
    user_files = {str(f["_id"]): f["name"] for f in await files_cursor.to_list(length=None)}
    
    if not user_files:
        return SearchResponse(query=request.query, results=[])

    # 3. Fetch all embedding chunks for these files
    # Note: In production with millions of chunks, this would be terribly slow 
    # and require a real vector DB (like Atlas or Qdrant). Fine for dev.
    file_ids_obj = [ObjectId(fid) for fid in user_files.keys()]
    embeddings_cursor = db.embeddings.find({"fileId": {"$in": file_ids_obj}})
    
    scored_chunks = []
    
    for doc in await embeddings_cursor.to_list(length=None):
        similarity = cosine_similarity(query_vector, doc["vector"])
        scored_chunks.append({
            "file_id": str(doc["fileId"]),
            "file_name": user_files[str(doc["fileId"])],
            "score": similarity,
            "snippet": doc["text"][:200] + "..." if len(doc["text"]) > 200 else doc["text"]
        })
        
    # 4. Sort by highest score
    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    
    # 5. Deduplicate (only show the best matching chunk per file)
    seen_files = set()
    final_results = []
    
    for chunk in scored_chunks:
        if chunk["file_id"] not in seen_files:
            # Only include results with a reasonable match score (> 0.2)
            if chunk["score"] > 0.2:
                seen_files.add(chunk["file_id"])
                final_results.append(
                    SearchResult(
                        file_id=chunk["file_id"],
                        file_name=chunk["file_name"],
                        score=round(chunk["score"], 3),
                        snippet=chunk["snippet"]
                    )
                )
        
        if len(final_results) >= request.top_k:
            break

    return SearchResponse(query=request.query, results=final_results)
