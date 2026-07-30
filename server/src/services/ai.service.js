'use strict';

const axios = require('axios');
const logger = require('../utils/logger');

// Docker compose maps the AI service to this hostname internally
// But for local development outside docker, it might be localhost:8000
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 60000, // 60s timeout for heavy AI operations
});

/**
 * Extracts text from a file buffer using the AI service.
 * @param {string} fileId
 * @param {Buffer} fileBuffer
 * @param {string} mimeType
 * @returns {Promise<{text: string, char_count: number}>}
 */
async function extractText(fileId, fileBuffer, mimeType) {
  try {
    const response = await aiClient.post('/extract/', {
      file_id: fileId.toString(),
      file_bytes: fileBuffer.toString('base64'),
      mime_type: mimeType,
    });
    return response.data;
  } catch (error) {
    logger.error(`AI Extract error for file ${fileId}:`, error.message);
    throw error;
  }
}

/**
 * Generates embeddings for a given text using the AI service.
 * @param {string} fileId
 * @param {string} text
 * @returns {Promise<{chunks_stored: number}>}
 */
async function generateEmbeddings(fileId, text) {
  try {
    const response = await aiClient.post('/embed/', {
      file_id: fileId.toString(),
      text: text,
    });
    return response.data;
  } catch (error) {
    logger.error(`AI Embed error for file ${fileId}:`, error.message);
    throw error;
  }
}

/**
 * Generates a summary and tags for a given text using the AI service.
 * @param {string} fileId
 * @param {string} text
 * @returns {Promise<{summary: string, tags: string[], contains_pii: boolean}>}
 */
async function summarizeFile(fileId, text) {
  try {
    const response = await aiClient.post('/summarize/', {
      file_id: fileId.toString(),
      text: text,
    });
    return response.data;
  } catch (error) {
    // If it's a 503, it means the API key is not configured.
    // We should probably swallow this error and just return empty summary, 
    // so the rest of the pipeline doesn't fail.
    if (error.response && error.response.status === 503) {
      logger.warn(`AI Summarize skipped for file ${fileId}: LLM not configured.`);
      return { summary: '', tags: [], contains_pii: false };
    }
    logger.error(`AI Summarize error for file ${fileId}:`, error.message);
    throw error;
  }
}

module.exports = {
  extractText,
  generateEmbeddings,
  summarizeFile,
};
