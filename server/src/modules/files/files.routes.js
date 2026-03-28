'use strict';

const { Router } = require('express');
const { verifyToken } = require('../../middleware/auth.middleware');
const router = Router();

// All file routes require authentication
router.use(verifyToken);

// TODO Phase 1: Import files controller
// const filesController = require('./files.controller');

/**
 * POST /api/files/upload-url
 * TODO Phase 1: Validate request → check quota → call r2Service.getPresignedUploadUrl() → return presignedUrl + r2Key
 */
router.post('/upload-url', (req, res) => {
  res.status(501).json({ success: false, message: 'TODO: generate R2 presigned upload URL' });
});

/**
 * POST /api/files/metadata
 * TODO Phase 1: Save File doc to MongoDB → enqueue background processing job → return fileId
 */
router.post('/metadata', (req, res) => {
  res.status(501).json({ success: false, message: 'TODO: save file metadata' });
});

/**
 * GET /api/files/recent
 * GET /api/files/starred
 * GET /api/files/trash
 * NOTE: These MUST be before /:id to avoid route conflicts
 */
router.get('/recent', (req, res) => res.status(501).json({ message: 'TODO: recent files' }));
router.get('/starred', (req, res) => res.status(501).json({ message: 'TODO: starred files' }));
router.get('/trash', (req, res) => res.status(501).json({ message: 'TODO: trash files' }));

/**
 * GET    /api/files/:id    → get file metadata + presigned download URL
 * PATCH  /api/files/:id    → rename, star, move
 * DELETE /api/files/:id    → soft delete
 */
router.get('/:id', (req, res) => res.status(501).json({ message: 'TODO: get file' }));
router.patch('/:id', (req, res) => res.status(501).json({ message: 'TODO: update file' }));
router.delete('/:id', (req, res) => res.status(501).json({ message: 'TODO: soft delete file' }));

/**
 * DELETE /api/files/:id/permanent  → delete from R2 + MongoDB
 * POST   /api/files/:id/restore    → restore from trash
 */
router.delete('/:id/permanent', (req, res) => res.status(501).json({ message: 'TODO: permanent delete' }));
router.post('/:id/restore', (req, res) => res.status(501).json({ message: 'TODO: restore file' }));

module.exports = router;
