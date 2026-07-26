import os
import uuid
import logging
import io
from pypdf import PdfReader
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from langchain_text_splitters import RecursiveCharacterTextSplitter
from services.chroma_client import get_or_create_collection
from services.embedder import embed_texts

router = APIRouter()
logger = logging.getLogger(__name__)

CHUNK_SIZE = 512
CHUNK_OVERLAP = 50


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes using pypdf"""
    reader = PdfReader(io.BytesIO(file_bytes))
    full_text = ""
    for page_num, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():
            full_text += f"\n--- Page {page_num + 1} ---\n{text}"
    return full_text


def chunk_text(text: str, filename: str) -> list[dict]:
    """Split text into overlapping chunks"""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ".", "!", "?", " "],
    )
    chunks = splitter.split_text(text)
    return [
        {
            "id": str(uuid.uuid4()),
            "text": chunk,
            "source": filename,
        }
        for chunk in chunks
        if chunk.strip()
    ]


@router.post("/pdf")
async def ingest_pdf(
    file: UploadFile = File(...),
    subject_id: str = Form(...),
    subject_name: str = Form("General"),
):
    """Ingest a PDF file into ChromaDB for a given subject"""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    logger.info(f"📄 Ingesting PDF: {file.filename} for subject {subject_id}")

    try:
        # Read PDF bytes
        file_bytes = await file.read()

        # Extract text
        text = extract_text_from_pdf(file_bytes)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        # Chunk text
        chunks = chunk_text(text, file.filename)
        logger.info(f"📦 Created {len(chunks)} chunks from {file.filename}")

        # Get or create ChromaDB collection for this subject
        collection_name = f"subject_{subject_id}"
        collection = get_or_create_collection(collection_name)

        # Embed chunks
        texts = [c["text"] for c in chunks]
        embeddings = embed_texts(texts)

        # Upsert into ChromaDB
        collection.upsert(
            ids=[c["id"] for c in chunks],
            embeddings=embeddings,
            documents=texts,
            metadatas=[
                {
                    "source": c["source"],
                    "subject_id": subject_id,
                    "subject_name": subject_name,
                }
                for c in chunks
            ],
        )

        logger.info(f"✅ Successfully ingested {len(chunks)} chunks into {collection_name}")

        return {
            "success": True,
            "filename": file.filename,
            "chunk_count": len(chunks),
            "collection": collection_name,
            "subject_id": subject_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ingestion error: {e}")
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")


@router.delete("/pdf")
async def delete_document(collection_name: str, filename: str):
    """Remove all chunks from a specific file in ChromaDB"""
    try:
        collection = get_or_create_collection(collection_name)
        results = collection.get(where={"source": filename})
        if results["ids"]:
            collection.delete(ids=results["ids"])
            return {"success": True, "deleted_chunks": len(results["ids"])}
        return {"success": True, "deleted_chunks": 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
