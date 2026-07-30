"""
Embedding service — handles text chunking and vector generation.
Uses sentence-transformers (all-MiniLM-L6-v2) for local, free, CPU-based embeddings.
Produces 384-dimensional vectors.
"""

import logging
from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Wraps the sentence-transformers embedding model.
    Model is loaded lazily on first use to keep container startup fast.

    Model: all-MiniLM-L6-v2
      - Dimensions: 384
      - Size: ~80 MB
      - Free, runs on CPU, no API key required
    """

    def __init__(self):
        self._model = None  # Lazy-loaded on first embed call

    @property
    def model(self):
        """Lazy-load the sentence-transformer model on first access."""
        if self._model is None:
            logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL} ...")
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
            logger.info("Embedding model loaded successfully.")
        return self._model

    def chunk_text(
        self,
        text: str,
        chunk_size: int = None,
        overlap: int = None,
    ) -> list[str]:
        """
        Split text into overlapping chunks using LangChain's
        RecursiveCharacterTextSplitter, which tries to split on natural
        boundaries (paragraphs → sentences → words → chars).
        """
        from langchain.text_splitter import RecursiveCharacterTextSplitter

        size = chunk_size or settings.CHUNK_SIZE
        ovlp = overlap or settings.CHUNK_OVERLAP

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=size,
            chunk_overlap=ovlp,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        chunks = splitter.split_text(text)
        logger.debug(f"Chunked text into {len(chunks)} chunks (size={size}, overlap={ovlp})")
        return chunks

    async def embed_text(self, text: str) -> list[float]:
        """
        Generate a 384-dim embedding vector for a single text string.
        Runs synchronously inside the async context (fast enough for CPU inference).
        """
        vector = self.model.encode(text, normalize_embeddings=True)
        return vector.tolist()

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """
        Batch-embed multiple texts for efficiency.
        sentence-transformers handles batching internally.
        """
        if not texts:
            return []
        vectors = self.model.encode(texts, normalize_embeddings=True, batch_size=32)
        return [v.tolist() for v in vectors]

    @property
    def vector_dimensions(self) -> int:
        """Returns the dimension of vectors produced by the current model."""
        return 384  # all-MiniLM-L6-v2 produces 384-dim vectors


# Singleton — model is loaded once and reused across requests
embedding_service = EmbeddingService()
