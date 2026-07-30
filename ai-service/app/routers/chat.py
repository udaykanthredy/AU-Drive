"""RAG Chat router"""

from fastapi import APIRouter, HTTPException
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from app.models.schemas import ChatRequest, ChatResponse
from app.services.embedding_service import embedding_service
from app.services.llm_service import llm_service
from app.config import settings
from app.routers.search import cosine_similarity

router = APIRouter()
logger = logging.getLogger(__name__)


def get_db():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    return client["au-drive"]


def _build_rag_prompt(messages: list, context_chunks: list[dict]) -> str:
    """Build a prompt containing the conversation history and the retrieved context."""
    context_text = "\n\n---\n\n".join([
        f"File: {chunk['file_name']}\nContent:\n{chunk['text']}" 
        for chunk in context_chunks
    ])
    
    # We only pass the latest few messages to save tokens if history is long
    history_text = ""
    for msg in messages[-5:-1]:  # Exclude the very last one
        role = "User" if msg.role == "user" else "Assistant"
        history_text += f"{role}: {msg.content}\n"
        
    latest_query = messages[-1].content
    
    prompt = f"""You are a helpful AI assistant integrated into a cloud storage drive.
Answer the user's question based ONLY on the provided document context.
If the answer is not in the context, say "I cannot answer this based on the provided documents."
Do not make up information.

DOCUMENT CONTEXT:
{context_text}

CONVERSATION HISTORY:
{history_text}

USER QUESTION: {latest_query}

ANSWER:"""
    return prompt


@router.post("/", response_model=ChatResponse)
async def chat_with_file(request: ChatRequest) -> ChatResponse:
    """
    Answer questions about a file or folder using RAG (Retrieval-Augmented Generation).
    """
    if not llm_service.is_configured:
        raise HTTPException(
            status_code=503,
            detail="No LLM API key configured. Add GEMINI_API_KEY or OPENAI_API_KEY to your .env."
        )

    # file_id and folder_id are optional; if neither is provided, it searches all user files.
        
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages array cannot be empty.")

    db = get_db()
    user_id = ObjectId(request.user_id)
    
    # 1. Determine scope and get file IDs
    file_ids_obj = []
    file_map = {} # obj_id -> file_name
    
    if request.file_id:
        try:
            fid = ObjectId(request.file_id)
            file_doc = await db.files.find_one({"_id": fid, "ownerId": user_id, "isDeleted": False})
            if not file_doc:
                raise HTTPException(status_code=404, detail="File not found or unauthorized.")
            file_ids_obj = [fid]
            file_map[fid] = file_doc["name"]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid file_id")
    elif request.file_name:
        try:
            file_doc = await db.files.find_one({"name": request.file_name, "ownerId": user_id, "isDeleted": False})
            if not file_doc:
                raise HTTPException(status_code=404, detail=f"File '{request.file_name}' not found.")
            file_ids_obj = [file_doc["_id"]]
            file_map[file_doc["_id"]] = file_doc["name"]
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error finding file by name: {e}")
            raise HTTPException(status_code=400, detail="Error looking up file by name")
    elif request.folder_id:
        try:
            folder_id_val = None if request.folder_id in ("root", None) else ObjectId(request.folder_id)
            cursor = db.files.find({"folderId": folder_id_val, "ownerId": user_id, "isDeleted": False})
            for doc in await cursor.to_list(length=None):
                file_ids_obj.append(doc["_id"])
                file_map[doc["_id"]] = doc["name"]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid folder_id")
    else:
        # No scope specified — search across ALL user files
        cursor = db.files.find({"ownerId": user_id, "isDeleted": False})
        for doc in await cursor.to_list(length=None):
            file_ids_obj.append(doc["_id"])
            file_map[doc["_id"]] = doc["name"]

    if not file_ids_obj:
        return ChatResponse(
            answer="You don't have any files yet. Upload some files and I can answer questions about them!",
            sources=[]
        )


    # 2. Embed the latest user query
    latest_query = request.messages[-1].content
    query_vector = await embedding_service.embed_text(latest_query)

    # 3. Retrieve and score chunks (In-memory cosine similarity for dev)
    embeddings_cursor = db.embeddings.find({"fileId": {"$in": file_ids_obj}})
    scored_chunks = []
    
    for doc in await embeddings_cursor.to_list(length=None):
        similarity = cosine_similarity(query_vector, doc["vector"])
        if similarity > 0.15:  # Lower threshold for RAG to get more context
            scored_chunks.append({
                "file_id": str(doc["fileId"]),
                "file_name": file_map[doc["fileId"]],
                "score": similarity,
                "text": doc["text"]
            })
            
    # Sort and take top 10 chunks to fit in context window
    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    top_chunks = scored_chunks[:10]
    
    if not top_chunks:
        return ChatResponse(
            answer="I couldn't find any relevant information in the selected document(s) to answer your question.",
            sources=[]
        )

    # 4. Build prompt and call LLM
    prompt = _build_rag_prompt(request.messages, top_chunks)
    logger.info(f"Generated RAG prompt (length {len(prompt)}). Calling LLM...")
    
    try:
        answer = await llm_service.generate(prompt)
    except Exception as e:
        logger.error(f"LLM generation failed for RAG chat: {e}")
        raise HTTPException(status_code=502, detail="Failed to generate answer from LLM.")

    # 5. Extract unique source file IDs
    source_files = list(set([chunk["file_id"] for chunk in top_chunks]))

    return ChatResponse(
        answer=answer,
        sources=source_files
    )
