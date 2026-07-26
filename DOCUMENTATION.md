# AI Doubt Solver - Complete Project Documentation 🧠

This document provides a comprehensive explanation of the entire project, covering its architecture, technology stack, and exactly how the code works under the hood. This is a perfect reference for your hackathon presentation!

---

## 🏗️ 1. High-Level Architecture

The project is built using a modern, microservice-inspired architecture separated into three independent layers:

1. **Frontend (React + Vite)**: The user interface where students interact with the AI, choose subjects, and upload study materials.
2. **Backend API (Node.js + Express)**: The central server that handles database connections, stores chat histories, and manages file uploads.
3. **AI Service (Python + FastAPI)**: The specialized engine that performs **Retrieval-Augmented Generation (RAG)**. It processes PDFs, manages the Vector Database (ChromaDB), and communicates with the LLM (Groq/LLaMA-3).

---

## 🛠️ 2. Technology Stack

* **Frontend**: React, Vite, Tailwind CSS (for Glassmorphism UI), Lucide React (icons).
* **Backend**: Node.js, Express, PostgreSQL (for structured data), Multer (for file handling).
* **AI Service**: Python, FastAPI, LangChain (for text chunking), `pypdf` (for PDF extraction).
* **AI Models**: 
  * **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` (running locally).
  * **Inference (LLM)**: **Groq API** (`llama-3.1-8b-instant`) for blazing fast generation.
* **Vector Database**: ChromaDB (running locally).

---

## 🔄 3. How the Code Works: Step-by-Step Data Flows

### Flow A: Uploading a PDF (Ingestion)
When a student uploads a textbook or past paper:
1. **Frontend**: Sends the PDF file to the Node.js Backend (`/api/upload`).
2. **Backend**: Saves the file temporarily using `multer`, records the document in the PostgreSQL database, and forwards the file to the Python AI Service.
3. **AI Service (`routers/ingest.py`)**: 
   - Uses `pypdf` to read all the text from the PDF.
   - Uses LangChain's `RecursiveCharacterTextSplitter` to chop the massive text into smaller, overlapping chunks (512 tokens each).
   - Passes these chunks to the **Embedding Model** (`services/embedder.py`), which converts the text into mathematical vectors (arrays of numbers).
   - Saves these vectors into **ChromaDB** inside a collection specific to the subject (e.g., "Physics").

### Flow B: Asking a Question (RAG Query)
When a student asks a doubt:
1. **Frontend**: Sends the question to the Node.js Backend (`/api/chat/message`).
2. **Backend**: Saves the user's message in PostgreSQL and forwards the question (along with recent chat history) to the AI Service.
3. **AI Service (`routers/query.py`)**:
   - The question is converted into a mathematical vector.
   - **ChromaDB** is searched using *Cosine Similarity* to find the top 5 most relevant textbook chunks that match the question's vector.
   - The retrieved chunks are bundled together with the original question and the `SYSTEM_PROMPT`.
4. **LLM Generation (`services/llm.py`)**:
   - The bundled prompt is sent to the **Groq API**.
   - The LLaMA-3 model generates a highly accurate, educational answer strictly based on the provided textbook chunks.
   - The answer is sent all the way back to the Frontend and displayed to the user!

---

## 📁 4. Key File Breakdown

Here is a breakdown of what the most important files in the repository actually do:

### AI Service (`/ai-service`)
* `main.py`: The entry point for the FastAPI server.
* `routers/ingest.py`: Contains the logic for processing incoming PDFs and chunking them.
* `routers/query.py`: Contains the logic for searching the vector database and calling the LLM.
* `services/embedder.py`: Loads the local `all-MiniLM-L6-v2` AI model used to turn text into vectors.
* `services/chroma_client.py`: Manages the connection to the local ChromaDB storage.
* `services/llm.py`: Handles the connection to the external Groq API and builds the prompts.

### Backend (`/backend`)
* `src/app.js`: The entry point for the Node.js Express server.
* `src/db/schema.sql`: Contains the PostgreSQL database table definitions (Subjects, Chat Sessions, Messages).
* `src/routes/chat.js`: Handles saving chat messages to the database and proxying requests to the AI Service.
* `src/routes/upload.js`: Handles receiving files from the frontend and sending them to the AI Service.

### Frontend (`/frontend`)
* `src/App.jsx`: The main React component that manages state and layout.
* `src/components/ChatInterface.jsx`: Renders the beautiful glassmorphic chat window, handles markdown rendering, and auto-scrolls.
* `src/components/UploadPanel.jsx`: The drag-and-drop zone for uploading PDFs.
* `src/components/SubjectSelector.jsx`: The visually rich grid where users select which subject they want to study.
