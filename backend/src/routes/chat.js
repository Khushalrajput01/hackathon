const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST /api/chat/session - create a new chat session
router.post('/session', async (req, res) => {
  const { subject_id, title } = req.body;
  if (!subject_id) return res.status(400).json({ error: 'subject_id required' });

  try {
    const result = await db.query(
      `INSERT INTO chat_sessions (subject_id, title)
       VALUES ($1, $2)
       RETURNING *`,
      [subject_id, title || 'New Chat']
    );
    res.json({ session: result.rows[0] });
  } catch (err) {
    console.error('session create error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/chat/sessions/:subjectId - get all sessions for a subject
router.get('/sessions/:subjectId', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT cs.*, s.name as subject_name, s.icon as subject_icon
       FROM chat_sessions cs
       JOIN subjects s ON cs.subject_id = s.id
       WHERE cs.subject_id = $1
       ORDER BY cs.updated_at DESC`,
      [req.params.subjectId]
    );
    res.json({ sessions: result.rows });
  } catch (err) {
    console.error('sessions fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/chat/sessions - get all sessions (for sidebar)
router.get('/sessions', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT cs.*, s.name as subject_name, s.icon as subject_icon, s.color as subject_color
       FROM chat_sessions cs
       JOIN subjects s ON cs.subject_id = s.id
       ORDER BY cs.updated_at DESC
       LIMIT 50`
    );
    res.json({ sessions: result.rows });
  } catch (err) {
    console.error('sessions fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/chat/history/:sessionId - get messages for a session
router.get('/history/:sessionId', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM messages
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [req.params.sessionId]
    );
    res.json({ messages: result.rows });
  } catch (err) {
    console.error('history fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// POST /api/chat/message - send message and get AI response
router.post('/message', async (req, res) => {
  const { session_id, question, subject_id, subject_name, chat_history } = req.body;

  if (!session_id || !question || !subject_id) {
    return res.status(400).json({ error: 'session_id, question, and subject_id are required' });
  }

  try {
    // Save user message to DB
    await db.query(
      `INSERT INTO messages (session_id, role, content)
       VALUES ($1, 'user', $2)`,
      [session_id, question]
    );

    // Update session title if it's the first message
    const sessionResult = await db.query(
      `SELECT title FROM chat_sessions WHERE id = $1`,
      [session_id]
    );
    if (sessionResult.rows[0]?.title === 'New Chat') {
      const shortTitle = question.substring(0, 50) + (question.length > 50 ? '...' : '');
      await db.query(
        `UPDATE chat_sessions SET title = $1, updated_at = NOW() WHERE id = $2`,
        [shortTitle, session_id]
      );
    } else {
      await db.query(
        `UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1`,
        [session_id]
      );
    }

    // Call FastAPI RAG service
    const ragResponse = await axios.post(`${AI_SERVICE_URL}/query/ask`, {
      question,
      subject_id: String(subject_id),
      subject_name: subject_name || 'General',
      chat_history: chat_history || [],
    }, { timeout: 30000 });

    const { answer, sources } = ragResponse.data;

    // Save AI response to DB
    await db.query(
      `INSERT INTO messages (session_id, role, content, sources)
       VALUES ($1, 'assistant', $2, $3)`,
      [session_id, answer, JSON.stringify(sources)]
    );

    res.json({ answer, sources, session_id });

  } catch (err) {
    console.error('message error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to get AI response. Is the AI service running?' });
  }
});

// DELETE /api/chat/session/:sessionId - delete a session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    await db.query(
      `DELETE FROM chat_sessions WHERE id = $1`,
      [req.params.sessionId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('session delete error:', err);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

module.exports = router;
