import os
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv(override=True)

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.1-8b-instant"

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
    if not GROQ_API_KEY:
        return _fallback_response(question, context_chunks)

    try:
        client = Groq(api_key=GROQ_API_KEY)

        # Build context string from retrieved chunks
        context_text = ""
        if context_chunks:
            context_text = "\n\n**Relevant Study Material:**\n"
            for i, chunk in enumerate(context_chunks, 1):
                source = chunk.get("source", "Unknown")
                text = chunk.get("text", "")
                context_text += f"\n[Source {i} - {source}]:\n{text}\n"

        if context_chunks:
            instruction = "Please provide a clear, educational answer based strictly on the study material above."
        else:
            instruction = "Please provide a clear, educational, and comprehensive answer using your general knowledge."

        prompt = f"""Subject: {subject}
{context_text}

Student Question: {question}

{instruction}"""

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]

        # Build history for multi-turn
        if chat_history:
            for msg in chat_history[-6:]:  # Last 3 exchanges
                # OpenAI/Groq use "user" and "assistant"
                role = "user" if msg["role"] == "user" else "assistant"
                messages.append({"role": role, "content": msg["content"]})

        messages.append({"role": "user", "content": prompt})

        chat_completion = client.chat.completions.create(
            messages=messages,
            model=GROQ_MODEL,
            temperature=0.7,
            max_tokens=1024
        )
        
        return chat_completion.choices[0].message.content

    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return _fallback_response(question, context_chunks)

def _fallback_response(question: str, context_chunks: list[dict]) -> str:
    """Fallback when no API key is configured"""
    if context_chunks:
        context_preview = context_chunks[0].get("text", "")[:500]
        return f"""## Answer

I found relevant content in your study materials:

> {context_preview}...

**Note:** Configure your GROQ_API_KEY in the `.env` file for full AI-powered answers.

To get a free API key: https://console.groq.com/keys"""
    return """## Setup Required

Please add your **GROQ_API_KEY** to `ai-service/.env` to enable AI responses.

Get a free key at: https://console.groq.com/keys"""
