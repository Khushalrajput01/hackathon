import os
import logging
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
_model = None


def get_embedder() -> SentenceTransformer:
    global _model
    if _model is None:
        logger.info(f"📦 Loading embedding model: {MODEL_NAME}")
        _model = SentenceTransformer(MODEL_NAME)
        logger.info("✅ Embedding model loaded")
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    model = get_embedder()
    embeddings = model.encode(texts, normalize_embeddings=True)
    return embeddings.tolist()


def embed_query(query: str) -> list[float]:
    model = get_embedder()
    embedding = model.encode([query], normalize_embeddings=True)
    return embedding[0].tolist()
