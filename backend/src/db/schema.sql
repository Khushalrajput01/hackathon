-- AI Doubt Solver Bot - PostgreSQL Schema
-- Run: psql -U postgres -d doubt_solver -f schema.sql

-- Note: Run `CREATE DATABASE doubt_solver;` manually if the database doesn't exist yet.
\c doubt_solver;

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    color VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Chat',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Documents (uploaded PDFs) table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    chroma_collection VARCHAR(100) NOT NULL,
    chunk_count INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Seed subjects
INSERT INTO subjects (name, icon, color, description) VALUES
    ('Physics', '⚛️', 'from-blue-500 to-cyan-500', 'Mechanics, Thermodynamics, Optics, Electromagnetism & Modern Physics'),
    ('Chemistry', '🧪', 'from-green-500 to-emerald-500', 'Organic, Inorganic & Physical Chemistry'),
    ('Mathematics', '📐', 'from-purple-500 to-violet-500', 'Calculus, Algebra, Trigonometry & Statistics'),
    ('Biology', '🧬', 'from-pink-500 to-rose-500', 'Cell Biology, Genetics, Ecology & Human Physiology'),
    ('Computer Science', '💻', 'from-orange-500 to-amber-500', 'Data Structures, Algorithms, DBMS & Networks'),
    ('History', '📜', 'from-yellow-500 to-orange-500', 'Ancient, Medieval & Modern World History'),
    ('Geography', '🌍', 'from-teal-500 to-green-500', 'Physical, Human & Economic Geography'),
    ('English', '📚', 'from-red-500 to-pink-500', 'Literature, Grammar, Writing & Comprehension')
ON CONFLICT DO NOTHING;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_subject_id ON chat_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_documents_subject_id ON documents(subject_id);
