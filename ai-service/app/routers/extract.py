"""
Text extraction router.

POST /extract/
  Accepts a base64-encoded file and its MIME type, extracts the raw text,
  and returns it along with a character count.

This endpoint is called internally by the Express file processor worker
immediately after a file is uploaded to R2.
"""

from fastapi import APIRouter, HTTPException
import logging

from app.models.schemas import ExtractRequest, ExtractResponse
from app.services.text_extractor import text_extractor

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=ExtractResponse)
async def extract_text(request: ExtractRequest) -> ExtractResponse:
    """
    Extract plain text from a base64-encoded file.

    - **file_id**: The MongoDB `_id` of the file document.
    - **file_bytes**: Base64-encoded raw file content.
    - **mime_type**: MIME type (e.g. `application/pdf`, `text/plain`).

    Returns the extracted text and a character count.
    Unsupported file types return an empty string without raising an error.
    """
    logger.info(f"Extracting text for file_id={request.file_id}, mime_type={request.mime_type}")

    try:
        # Decode base64 → raw bytes
        file_bytes = text_extractor.from_base64(request.file_bytes)
    except Exception as e:
        logger.error(f"Failed to decode base64 for file_id={request.file_id}: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid base64 encoding: {e}")

    # Extract text based on MIME type
    extracted_text = text_extractor.extract(file_bytes, request.mime_type)

    char_count = len(extracted_text)
    logger.info(
        f"Extraction complete for file_id={request.file_id}: "
        f"{char_count} chars extracted from {request.mime_type}"
    )

    return ExtractResponse(
        file_id=request.file_id,
        text=extracted_text,
        char_count=char_count,
        mime_type=request.mime_type,
    )
