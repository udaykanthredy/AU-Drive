'use strict';

const { Router } = require('express');
const { verifyToken } = require('../../middleware/auth.middleware');
const { rateLimiter } = require('../../middleware/rateLimiter.middleware');
const axios = require('axios');
const logger = require('../../utils/logger');
const router = Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.use(verifyToken);

/**
 * POST /api/ai/search
 * Proxies the search query to the Python AI service.
 */
router.post('/search', async (req, res) => {
  try {
    const { query, topK } = req.body;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const response = await axios.post(`${AI_SERVICE_URL}/search/`, {
      query,
      user_id: req.user.userId,
      top_k: topK || 5,
    });
    
    res.json({ success: true, data: response.data });
  } catch (error) {
    logger.error('Semantic search error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to perform semantic search' });
  }
});

/**
 * POST /api/ai/summarize
 * Proxies the manual summarize request to the Python AI service.
 */
router.post('/summarize', async (req, res) => {
  try {
    const { fileId } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ success: false, message: 'fileId is required' });
    }

    // Usually summaries are done in the background queue, but this endpoint 
    // allows a user to force a manual re-summarize or fetch a summary on demand.
    // We would need to fetch the file's text content from DB first.
    // For now, we just return the existing summary from the DB.
    const File = require('../../models/File.model');
    const file = await File.findOne({ _id: fileId, ownerId: req.user.userId });
    
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.json({ 
      success: true, 
      data: {
        summary: file.summary || '',
        tags: file.tags || [],
        processingStatus: file.processingStatus
      } 
    });
  } catch (error) {
    logger.error('Summarize proxy error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve summary' });
  }
});

/**
 * POST /api/ai/chat
 * Proxies the RAG chat request to the Python AI service.
 * Rate limited more aggressively (LLM calls are expensive)
 */
router.post('/chat', rateLimiter.chat, async (req, res) => {
  try {
    const { fileId, folderId, fileName, messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'messages array is required' });
    }
    
    // fileId/folderId are optional — omitting them allows chatting across all files
    const response = await axios.post(`${AI_SERVICE_URL}/chat/`, {
      file_id: fileId || null,
      folder_id: folderId && folderId !== 'root' ? folderId : null,
      file_name: fileName || null,
      messages: messages,
      user_id: req.user.userId,
    });
    
    res.json({ success: true, data: response.data });
  } catch (error) {
    logger.error('RAG Chat proxy error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to perform chat' });
  }
});

module.exports = router;
