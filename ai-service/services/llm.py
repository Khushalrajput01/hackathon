import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

SYSTEM_PROMPT = """You are an expert AI tutor and doubt solver. Your role is to help students understand concepts clearly.

Guidelines:
- Answer questions based on the provided context from study materials (past papers, notes, textbooks)
- Be clear, structured, and educational in your responses
- Use examples where helpful
- If the context doesn't fully answer the question, use your knowledge but mention it
- Format responses with proper markdown: use **bold**, bullet points, numbered lists, and code blocks where relevant
- Always encourage understanding, not just memorization
- Keep answers concise yet comprehensive
"""


def get_llm_response(
    question: str,
    context_chunks: list[dict],
    chat_history: list[dict] = None,
    subject: str = "General",
) -> str:
    if not GEMINI_API_KEY:
        return _fallback_response(question, context_chunks)

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=SYSTEM_PROMPT,
        )

        # Build context string from retrieved chunks
        context_text = ""
        if context_chunks:
            context_text = "\n\n**Relevant Study Material:**\n"
            for i, chunk in enumerate(context_chunks, 1):
                source = chunk.get("source", "Unknown")
                text = chunk.get("text", "")
                context_text += f"\n[Source {i} - {source}]:\n{text}\n"

        # Build history for multi-turn
        history = []
        if chat_history:
            for msg in chat_history[-6:]:  # Last 3 exchanges
                role = "user" if msg["role"] == "user" else "model"
                history.append({"role": role, "parts": [msg["content"]]})

        if context_chunks:
            instruction = "Please provide a clear, educational answer based strictly on the study material above."
        else:
            instruction = "Please provide a clear, educational, and comprehensive answer using your general knowledge."

        prompt = f"""Subject: {subject}
{context_text}

Student Question: {question}

{instruction}"""

        chat = model.start_chat(history=history)
        response = chat.send_message(prompt)
        return response.text

    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return _fallback_response(question, context_chunks)


def _fallback_response(question: str, context_chunks: list[dict]) -> str:
    """Fallback when no API key is configured"""
    if context_chunks:
        context_preview = context_chunks[0].get("text", "")[:500]
        return f"""## Answer

I found relevant content in your study materials:

> {context_preview}...

**Note:** Configure your GEMINI_API_KEY in the `.env` file for full AI-powered answers.

To get a free API key: https://aistudio.google.com/app/apikey"""
    return """## Setup Required

Please add your **GEMINI_API_KEY** to `ai-service/.env` to enable AI responses.

Get a free key at: https://aistudio.google.com/app/apikey"""
