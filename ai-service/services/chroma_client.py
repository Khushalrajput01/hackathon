import chromadb
from chromadb.config import Settings
import os

CHROMA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_data")

_client = None


def get_chroma_client() -> chromadb.PersistentClient:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path=CHROMA_PATH,
            settings=Settings(anonymized_telemetry=False),
        )
    return _client


def get_or_create_collection(collection_name: str):
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
    )


def get_collection(collection_name: str):
    client = get_chroma_client()
    try:
        return client.get_collection(name=collection_name)
    except Exception:
        return None


def delete_collection(collection_name: str):
    client = get_chroma_client()
    try:
        client.delete_collection(name=collection_name)
        return True
    except Exception:
        return False


def list_collections():
    client = get_chroma_client()
    return client.list_collections()
