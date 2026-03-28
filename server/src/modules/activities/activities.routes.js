'use strict';

const { Router } = require('express');
const { verifyToken } = require('../../middleware/auth.middleware');
const router = Router();

router.use(verifyToken);

/**
 * GET /api/activities        → paginated activity log for current user
 * GET /api/activities/file/:id → activity for a specific file
 */
router.get('/', (req, res) => res.status(501).json({ message: 'TODO: get user activity log' }));
router.get('/file/:id', (req, res) =>
  res.status(501).json({ message: 'TODO: get file activity log' })
);

module.exports = router;
