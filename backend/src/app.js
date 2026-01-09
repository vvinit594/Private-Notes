const express = require('express');
const cors = require('cors');
const { requireAuth } = require('./middleware/requireAuth');
const { notesRouter } = require('./routes/notes');

function createApp() {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: false,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (req, res) => {
    res.json({ ok: true });
  });

  // Step 7 sanity check: protected endpoint
  app.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });

  // Step 8: notes CRUD
  app.use('/notes', notesRouter);

  return app;
}

module.exports = { createApp };
