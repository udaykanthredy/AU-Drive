'use strict';

const { Router } = require('express');
const { verifyToken } = require('../../middleware/auth.middleware');
const { rateLimiter } = require('../../middleware/rateLimiter.middleware');
const router = Router();

router.use(verifyToken);

/**
 * POST /api/ai/search
 * TODO Phase 2: Embed query → Atlas Vector Search → return ranked files
 */
router.post('/search', (req, res) =>
  res.status(501).json({ message: 'TODO: semantic search (Phase 2)' })
);

/**
 * POST /api/ai/summarize
 * TODO Phase 2: Return stored summary or trigger re-summarization
 */
router.post('/summarize', (req, res) =>
  res.status(501).json({ message: 'TODO: file summarization (Phase 2)' })
);

/**
 * POST /api/ai/chat
 * TODO Phase 3: RAG chat against file or folder context
 * Rate limited more aggressively (LLM calls are expensive)
 */
router.post('/chat', rateLimiter.chat, (req, res) =>
  res.status(501).json({ message: 'TODO: RAG chat (Phase 3)' })
);

module.exports = router;
