const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/subjects - list all subjects
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM subjects ORDER BY id ASC'
    );
    res.json({ subjects: result.rows });
  } catch (err) {
    console.error('subjects error:', err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET /api/subjects/:id/documents - list uploaded PDFs for a subject
router.get('/:id/documents', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM documents WHERE subject_id = $1 ORDER BY uploaded_at DESC',
      [req.params.id]
    );
    res.json({ documents: result.rows });
  } catch (err) {
    console.error('documents error:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

module.exports = router;
