# AI Doubt Solver Bot — Hackathon Project 🚀

Welcome to the AI Doubt Solver Bot! This project is a comprehensive, full-stack AI platform designed to help students learn better by answering their doubts using Retrieval-Augmented Generation (RAG). By uploading their own study materials (past papers, lecture notes, textbook chapters), students can get AI-generated answers grounded in their specific curriculum.

---

## 🌟 Key Features

- **Subject-Specific Context:** Organize study materials by subjects (Physics, Chemistry, Maths, etc.).
- **RAG Powered Answers:** The AI doesn't just guess—it retrieves relevant text chunks from the uploaded PDFs and cites its sources.
- **Glassmorphism UI:** A stunning, modern dark theme with frosted glass effects and smooth animations.
- **Persistent Chat History:** Seamlessly resume previous doubt-solving sessions.
- **Drag & Drop Uploads:** Easily ingest large PDF documents directly through the web interface.

---

## 🏗️ Architecture Overview

This project is built using a microservices-style architecture, splitting concerns across specialized technologies.

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                │
│  Subject Selector  │  Chat UI  │  Upload Panel           │
└────────────┬───────────────────────────────────┬────────┘
             │ REST API                          │ Multipart Form (PDF)
             ▼                                   ▼
┌─────────────────────┐              ┌──────────────────────┐
│  Node/Express API   │◄────────────►│  PostgreSQL DB       │
│  (Session handling, │              │  (Users, Chats,      │
│   Chat History,     │              │   Messages, Files)   │
│   File Proxy)       │              └──────────────────────┘
└────────┬────────────┘
         │ Internal HTTP Proxy
         ▼
┌─────────────────────┐
│  FastAPI RAG Service│
│  - PyMuPDF parsing  │
│  - ChromaDB Vector  │
│  - Google Gemini LLM│
│  - Sentence-Trans.  │
└─────────────────────┘
```

---

## 💻 Tech Stack & Code Structure

### 1. Frontend (`/frontend`)
Built with **React 18** and **Vite**, styled using pure Vanilla CSS for a custom Glassmorphism aesthetic.
- `src/App.jsx` & `main.jsx`: Handles React Router setup.
- `src/index.css`: Contains the CSS variables, animations (`animate-fade-in`, typing bounce), and glassmorphism utilities (`.glass-panel`, `.glass-card`).
- `src/pages/Home.jsx`: The landing page with hero text and the subject selection grid.
- `src/pages/Chat.jsx`: The main application view, managing the layout between the Sidebar, Chat Interface, and Upload Panel.
- `src/components/ChatInterface.jsx`: Manages message state, API calls to the Node backend, and auto-scrolling.
- `src/components/MessageBubble.jsx`: Uses `react-markdown` to render the AI's responses and displays source citations as interactive chips.
- `src/components/UploadPanel.jsx`: Handles drag-and-drop file selection and uploads.

### 2. Backend API (`/backend`)
Built with **Node.js** and **Express**. Acts as the main gateway and handles persistent data.
- `src/app.js`: Entry point, sets up CORS, routes, and error handling.
- `src/db/schema.sql`: The PostgreSQL database schema defining tables for `subjects`, `chat_sessions`, `messages`, and `documents`.
- `src/routes/chat.js`: Handles creating chat sessions, fetching history, and proxying user questions to the AI Service. Automatically titles new chats based on the first question.
- `src/routes/upload.js`: Uses **Multer** (`src/middleware/multer.js`) to temporarily save uploaded PDFs, then forwards them to the AI service for ingestion, and finally logs the document metadata in PostgreSQL.

### 3. AI & RAG Service (`/ai-service`)
Built with **FastAPI** (Python). Dedicated exclusively to heavy AI computation, embedding, and LLM orchestration.
- `routers/ingest.py`: Receives PDFs, extracts text using **PyMuPDF**, splits the text into 512-token chunks using **LangChain**, embeds them, and upserts them into a subject-specific collection in ChromaDB.
- `routers/query.py`: The core RAG pipeline. It embeds the user's question, queries ChromaDB for the Top-5 most relevant chunks (using Cosine Similarity), filters out low-relevance matches, and passes the context to the LLM.
- `services/embedder.py`: Uses `sentence-transformers/all-MiniLM-L6-v2` to generate dense vector embeddings locally (no API cost).
- `services/chroma_client.py`: Manages the persistent local ChromaDB instance (`/chroma_data` directory).
- `services/llm.py`: Connects to the **Google Gemini (2.0 Flash)** API to generate the final educational response, combining the retrieved context and the user's recent chat history.

---

## 🚀 Setup & Run Instructions

To run the project locally, you will need to start the Database and the three independent services.

### Prerequisites
- PostgreSQL running on your machine.
- Node.js (v18+)
- Python (v3.9+)
- A free [Google Gemini API Key](https://aistudio.google.com/app/apikey).

### Step 1: Database Setup
Create a PostgreSQL database and run the schema file to create the tables and seed the initial subjects.
```bash
psql -U postgres -f backend/src/db/schema.sql
```

### Step 2: AI Service (FastAPI)
Navigate to the AI service, create a virtual environment, install dependencies, and start the server.
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt

# Configure Environment Variables
cp .env.example .env
# Edit .env and paste your GEMINI_API_KEY inside.

# Start FastAPI server on port 8000
uvicorn main:app --reload --port 8000
```

### Step 3: Backend API (Node.js)
Open a new terminal window, navigate to the backend, install Node modules, and start the server.
```bash
cd backend
npm install

# Configure Environment Variables
cp .env.example .env
# (Optional) Edit .env if your PostgreSQL uses a different password/port.

# Start Express server on port 3001
npm run dev
```

### Step 4: Frontend (React)
Open a third terminal window, navigate to the frontend, install dependencies, and start the Vite dev server.
```bash
cd frontend
npm install
npm run dev
```

The web application will now be running at **http://localhost:5173**. 

### 💡 Hackathon Demo Flow:
1. Open the UI, click on a Subject (e.g., Physics).
2. Click "Upload Materials" in the top right.
3. Drag and drop a sample Physics PDF. Wait for the success message.
4. Click "Close Files" to return to the chat.
5. Ask a question specific to the PDF you just uploaded.
6. Watch the AI type out a markdown-formatted answer and provide source citations!
