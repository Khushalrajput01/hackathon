import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.chroma_client import get_collection
from services.embedder import embed_query
from services.llm import get_llm_response

router = APIRouter()
logger = logging.getLogger(__name__)

TOP_K = 5


class QueryRequest(BaseModel):
    question: str
    subject_id: str
    subject_name: str = "General"
    chat_history: list[dict] = []


class SourceChunk(BaseModel):
    text: str
    source: str
    relevance: float


class QueryResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]
    subject_id: str


@router.post("/ask", response_model=QueryResponse)
async def ask_question(req: QueryRequest):
    """RAG pipeline: retrieve relevant chunks, then generate answer"""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    logger.info(f"❓ Query for subject {req.subject_id}: {req.question[:80]}...")

    collection_name = f"subject_{req.subject_id}"
    collection = get_collection(collection_name)

    sources = []
    context_chunks = []

    if collection:
        try:
            # Embed the question
            query_embedding = embed_query(req.question)

            # Retrieve top-K similar chunks
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(TOP_K, collection.count()),
                include=["documents", "metadatas", "distances"],
            )

            if results["documents"] and results["documents"][0]:
                for doc, meta, dist in zip(
                    results["documents"][0],
                    results["metadatas"][0],
                    results["distances"][0],
                ):
                    relevance = round(1 - dist, 4)  # cosine similarity
                    if relevance > 0.1:  # filter low-relevance chunks
                        chunk = {
                            "text": doc,
                            "source": meta.get("source", "Unknown"),
                            "relevance": relevance,
                        }
                        context_chunks.append(chunk)
                        sources.append(SourceChunk(**chunk))

            logger.info(f"📚 Retrieved {len(sources)} relevant chunks")
        except Exception as e:
            logger.warning(f"ChromaDB retrieval error: {e}")
    else:
        logger.info(f"No collection found for subject {req.subject_id}, using LLM only")

    answer = get_llm_response(
        question=req.question,
        context_chunks=context_chunks,
        chat_history=req.chat_history,
        subject=req.subject_name,
    )

    return QueryResponse(
        answer=answer,
        sources=sources,
        subject_id=req.subject_id,
    )


@router.get("/collections")
async def list_subject_collections():
    """List all available subject collections in ChromaDB"""
    from services.chroma_client import list_collections
    collections = list_collections()
    return {"collections": [c.name for c in collections]}
