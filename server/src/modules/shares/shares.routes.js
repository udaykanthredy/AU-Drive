'use strict';

const { Router } = require('express');
const { verifyToken, optionalToken } = require('../../middleware/auth.middleware');
const router = Router();

/**
 * POST   /api/shares        → create share link (auth required)
 * GET    /api/shares/:token → access shared resource (no auth required — public)
 * DELETE /api/shares/:id   → revoke share link (auth required)
 */
router.post('/', verifyToken, (req, res) => res.status(501).json({ message: 'TODO: create share' }));

// Public route — validate token, check expiry, return presigned URL
router.get('/:token', optionalToken, (req, res) =>
  res.status(501).json({ message: 'TODO: resolve share link' })
);

router.delete('/:id', verifyToken, (req, res) =>
  res.status(501).json({ message: 'TODO: revoke share' })
);

module.exports = router;
