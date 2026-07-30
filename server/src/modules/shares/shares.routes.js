'use strict';

const { Router } = require('express');
const { verifyToken, optionalToken } = require('../../middleware/auth.middleware');
const sharesController = require('./shares.controller');
const router = Router();

/**
 * POST   /api/shares        → create share link (auth required)
 * GET    /api/shares/:token → access shared resource (no auth required — public)
 * DELETE /api/shares/:id   → revoke share link (auth required)
 */
router.post('/', verifyToken, sharesController.createShare);

// List current user's own shares (auth required — must come before /:token)
router.get('/', verifyToken, sharesController.listMyShares);

// Public route — validate token, check expiry, return presigned URL
router.get('/:token', optionalToken, sharesController.getShare);

router.delete('/:id', verifyToken, sharesController.revokeShare);

module.exports = router;
