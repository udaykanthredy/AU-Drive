"""
Embedding service — handles text chunking and vector generation.
Phase 2: Implement real embedding logic here.
"""
from app.config import settings


class EmbeddingService:
    """
    Wraps the embedding model (local or API-based).

    TODO Phase 2:
    - Local: use sentence-transformers `SentenceTransformer(settings.EMBEDDING_MODEL)`
    - OpenAI: use `openai.embeddings.create(model='text-embedding-3-small', input=text)`
    """

    def __init__(self):
        self.model = None
        # TODO Phase 2: Load model on init
        # if settings.EMBEDDING_PROVIDER == 'local':
        #     from sentence_transformers import SentenceTransformer
        #     self.model = SentenceTransformer(settings.EMBEDDING_MODEL)

    def chunk_text(self, text: str, chunk_size: int = None, overlap: int = None) -> list[str]:
        """
        Split text into overlapping chunks.
        TODO Phase 2: Use LangChain RecursiveCharacterTextSplitter
        """
        size = chunk_size or settings.CHUNK_SIZE
        ovlp = overlap or settings.CHUNK_OVERLAP
        # Naive chunking placeholder — replace with LangChain splitter
        chunks = []
        for i in range(0, len(text), size - ovlp):
            chunks.append(text[i : i + size])
        return chunks

    async def embed_text(self, text: str) -> list[float]:
        """
        Generate embedding vector for a single text string.
        TODO Phase 2: Return actual embedding from model/API
        """
        # PLACEHOLDER: return zero vector
        return [0.0] * 768

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Batch embed for efficiency"""
        return [await self.embed_text(t) for t in texts]


# Singleton
embedding_service = EmbeddingService()
