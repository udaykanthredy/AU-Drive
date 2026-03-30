'use strict';

const { Router } = require('express');
const { verifyToken } = require('../../middleware/auth.middleware');
const router = Router();

const filesController = require('./files.controller');

// All file routes require authentication
router.use(verifyToken);

// Phase 2 implementation
router.post('/upload-url', filesController.generateUploadUrl);
router.post('/metadata', filesController.saveMetadata);

// Using GET / to fetch lists, so we don't conflict with /:id
router.get('/', filesController.listFiles);

/**
 * GET    /api/files/:id    → get file metadata + presigned download URL
 * PATCH  /api/files/:id    → rename, star, move
 * DELETE /api/files/:id    → soft delete
 */
router.get('/:id', filesController.getFile);
router.patch('/:id', (req, res) => res.status(501).json({ message: 'TODO: update file' }));
router.delete('/:id', filesController.deleteFile);

/**
 * DELETE /api/files/:id/permanent  → delete from R2 + MongoDB
 * POST   /api/files/:id/restore    → restore from trash
 */
router.delete('/:id/permanent', (req, res) => res.status(501).json({ message: 'TODO: permanent delete' }));
router.post('/:id/restore', (req, res) => res.status(501).json({ message: 'TODO: restore file' }));

module.exports = router;
