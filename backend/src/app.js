const express = require('express');
const cors = require('cors');
require('dotenv').config();

const subjectsRouter = require('./routes/subjects');
const chatRouter = require('./routes/chat');
const uploadRouter = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files if needed (optional)
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/subjects', subjectsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/upload', uploadRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Node API', version: '1.0.0' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Node API Server running on port ${PORT}`);
});
