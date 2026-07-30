"""
Text extraction service — extracts raw text from uploaded file bytes.

Supports:
  - text/plain        → UTF-8 decode
  - application/pdf   → pypdf
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document → python-docx
  - application/msword → python-docx (best-effort)
  - All other types   → returns empty string (images, video, audio, etc.)
"""

import base64
import io
import logging

logger = logging.getLogger(__name__)


class TextExtractor:
    """
    Extracts plain text from a base64-encoded file buffer.
    All methods are synchronous — they are fast CPU-bound ops
    and do not benefit from async.
    """

    def extract(self, file_bytes: bytes, mime_type: str) -> str:
        """
        Main entry point. Dispatches to the correct extractor based on MIME type.

        Args:
            file_bytes: Raw bytes of the file.
            mime_type:  MIME type string (e.g. 'application/pdf').

        Returns:
            Extracted text string, or empty string if unsupported.
        """
        try:
            if mime_type == "text/plain":
                return self._extract_plain_text(file_bytes)
            elif mime_type == "application/pdf":
                return self._extract_pdf(file_bytes)
            elif mime_type in (
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/msword",
            ):
                return self._extract_docx(file_bytes)
            else:
                logger.info(f"Unsupported MIME type for extraction: {mime_type}. Returning empty string.")
                return ""
        except Exception as e:
            logger.error(f"Text extraction failed for mime_type={mime_type}: {e}")
            return ""

    # ── Private extractors ────────────────────────────────────────────────────

    def _extract_plain_text(self, file_bytes: bytes) -> str:
        """Decode raw bytes as UTF-8 text. Falls back to latin-1 on decode error."""
        try:
            return file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            return file_bytes.decode("latin-1", errors="replace")

    def _extract_pdf(self, file_bytes: bytes) -> str:
        """Extract text from all pages of a PDF using pypdf."""
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(file_bytes))
        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text.strip())
        return "\n\n".join(pages_text)

    def _extract_docx(self, file_bytes: bytes) -> str:
        """Extract text from a DOCX file using python-docx."""
        from docx import Document

        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        return "\n".join(paragraphs)

    @staticmethod
    def from_base64(b64_string: str) -> bytes:
        """Helper: decode a base64 string to raw bytes."""
        return base64.b64decode(b64_string)


# Singleton instance
text_extractor = TextExtractor()
