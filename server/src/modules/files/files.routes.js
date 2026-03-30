'use strict';

const { Router } = require('express');
const multer = require('multer');
const { verifyToken } = require('../../middleware/auth.middleware');
const router = Router();

const filesController = require('./files.controller');

// Multer: store file in memory buffer (for proxied upload to R2)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 100) * 1024 * 1024 },
});

// All file routes require authentication
router.use(verifyToken);

// Proxied upload: Browser → Express → R2 (no CORS issues)
router.post('/upload', upload.single('file'), filesController.uploadFile);

// Legacy presigned URL flow (kept for reference/future use)
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
router.patch('/:id', filesController.updateFile);
router.delete('/:id', filesController.deleteFile);

/**
 * DELETE /api/files/:id/permanent  → delete from R2 + MongoDB
 * POST   /api/files/:id/restore    → restore from trash
 */
router.delete('/:id/permanent', filesController.permanentDeleteFile);
router.post('/:id/restore', filesController.restoreFile);

module.exports = router;
