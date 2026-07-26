const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const db = require('../db');
const upload = require('../middleware/multer');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST /api/upload/pdf
router.post('/pdf', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  const { subject_id, subject_name } = req.body;
  if (!subject_id) {
    // Clean up uploaded file if missing metadata
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'subject_id is required' });
  }

  try {
    // 1. Forward the PDF to FastAPI service for ingestion
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));
    formData.append('subject_id', subject_id);
    formData.append('subject_name', subject_name || 'General');

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/ingest/pdf`, formData, {
      headers: { ...formData.getHeaders() },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    const { collection, chunk_count } = aiResponse.data;

    // 2. Save metadata to PostgreSQL
    const dbResult = await db.query(
      `INSERT INTO documents (subject_id, filename, original_name, chroma_collection, chunk_count)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [subject_id, req.file.filename, req.file.originalname, collection, chunk_count]
    );

    res.json({
      success: true,
      document: dbResult.rows[0],
    });
  } catch (err) {
    console.error('Upload error:', err?.response?.data || err.message);
    // Cleanup on failure
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

module.exports = router;
