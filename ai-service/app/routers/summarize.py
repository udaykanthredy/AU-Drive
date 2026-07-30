"""
Summarization router — generates AI summaries and auto-tags for files.
Uses the LLM service (Gemini or OpenAI) to process file text content.
"""

import json
import logging
import re
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient

from app.models.schemas import SummarizeRequest, SummarizeResponse
from app.services.llm_service import llm_service, LLMConfigurationError
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Max characters to send to the LLM — keeps us within context window limits
MAX_INPUT_CHARS = 12_000


def get_db():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    return client["au-drive"]


def _build_prompt(text: str) -> str:
    """Build the summarization prompt."""
    return f"""You are a document analysis assistant. Analyze the following document and provide:
1. A concise summary in exactly 2-3 sentences.
2. A list of 3-5 topic tags (single words or short phrases).
3. A boolean indicating if the document contains PII (Personally Identifiable Information like SSN, credit cards, emails, phone numbers).

Respond ONLY with valid JSON in this exact format:
{{
  "summary": "Your 2-3 sentence summary here.",
  "tags": ["tag1", "tag2", "tag3"],
  "contains_pii": false
}}

Document:
\"\"\"
{text}
\"\"\"
"""


def _parse_llm_response(raw: str) -> tuple[str, list[str]]:
    """
    Parse the LLM response into (summary, tags, contains_pii).
    Tries strict JSON parsing first, then falls back to regex extraction.
    """
    # Strip markdown code fences if present (```json ... ```)
    cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", raw.strip())

    try:
        data = json.loads(cleaned)
        summary = str(data.get("summary", "")).strip()
        tags = [str(t).strip().lower() for t in data.get("tags", []) if t]
        contains_pii = bool(data.get("contains_pii", False))
        return summary, tags[:5], contains_pii  # Cap at 5 tags
    except (json.JSONDecodeError, AttributeError):
        pass

    # Fallback: regex extraction
    logger.warning("JSON parse failed, falling back to regex extraction.")
    summary_match = re.search(r'"summary"\s*:\s*"([^"]+)"', cleaned)
    tags_match = re.search(r'"tags"\s*:\s*\[([^\]]+)\]', cleaned)
    pii_match = re.search(r'"contains_pii"\s*:\s*(true|false)', cleaned, re.IGNORECASE)

    summary = summary_match.group(1).strip() if summary_match else cleaned[:300]
    contains_pii = True if pii_match and pii_match.group(1).lower() == 'true' else False
    tags = []
    if tags_match:
        tags = [
            t.strip().strip('"').lower()
            for t in tags_match.group(1).split(",")
            if t.strip()
        ]

    return summary, tags[:5], contains_pii


@router.post("/", response_model=SummarizeResponse)
async def summarize_file(request: SummarizeRequest) -> SummarizeResponse:
    """
    Generate an AI summary and topic tags for a file.

    Pipeline:
      1. Truncate text to MAX_INPUT_CHARS to fit LLM context window
      2. Prompt LLM: "Summarize in 2-3 sentences + list 3-5 tags + detect PII as JSON"
      3. Parse JSON response into summary (str), tags (list[str]), contains_pii (bool)
      4. Persist summary + tags + containsPII to File document in MongoDB
      5. Set File.processingStatus = 'done'

    - **file_id**: MongoDB `_id` of the file.
    - **text**: Extracted plain text of the file.
    """
    if not llm_service.is_configured:
        raise HTTPException(
            status_code=503,
            detail=(
                "No LLM API key configured. "
                "Add GEMINI_API_KEY or OPENAI_API_KEY to your .env and restart the server."
            ),
        )

    if not request.text.strip():
        logger.info(f"Empty text for file_id={request.file_id}. Skipping summarization.")
        return SummarizeResponse(
            file_id=request.file_id,
            summary="",
            tags=[],
        )

    logger.info(
        f"Summarizing file_id={request.file_id} "
        f"({len(request.text)} chars, provider={llm_service.provider_name or 'auto'})"
    )

    # ── Step 1: Truncate text ────────────────────────────────────────────────
    text = request.text[:MAX_INPUT_CHARS]
    if len(request.text) > MAX_INPUT_CHARS:
        logger.debug(f"Text truncated from {len(request.text)} to {MAX_INPUT_CHARS} chars.")

    # ── Step 2: Call LLM ─────────────────────────────────────────────────────
    try:
        prompt = _build_prompt(text)
        raw_response = await llm_service.generate(prompt)
    except LLMConfigurationError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"LLM call failed for file_id={request.file_id}: {e}")
        raise HTTPException(status_code=502, detail=f"LLM API error: {str(e)}")

    # ── Step 3: Parse response ───────────────────────────────────────────────
    summary, tags, contains_pii = _parse_llm_response(raw_response)
    logger.info(f"Parsed summary ({len(summary)} chars), {len(tags)} tags, PII={contains_pii} for file_id={request.file_id}")

    # ── Step 4 & 5: Persist to MongoDB ──────────────────────────────────────
    try:
        file_object_id = ObjectId(request.file_id)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid file_id: {request.file_id}")

    db = get_db()
    now = datetime.now(timezone.utc)

    await db.files.update_one(
        {"_id": file_object_id},
        {
            "$set": {
                "summary": summary,
                "tags": tags,
                "containsPII": contains_pii,
                "processingStatus": "done",
                "updatedAt": now,
            }
        },
    )

    logger.info(f"Summarization complete for file_id={request.file_id}")

    return SummarizeResponse(
        file_id=request.file_id,
        summary=summary,
        tags=tags,
        contains_pii=contains_pii,
    )

