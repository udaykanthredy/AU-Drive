'use strict';

const express = require('express');
const router = express.Router();

const { rateLimiter } = require('../middleware/rateLimiter.middleware');

// ─── Module Routes ───────────────────────────────────────────────────────────
router.use('/auth', rateLimiter.auth, require('../modules/auth/auth.routes'));
router.use('/files', require('../modules/files/files.routes'));
router.use('/folders', require('../modules/folders/folders.routes'));
router.use('/shares', require('../modules/shares/shares.routes'));
router.use('/ai', rateLimiter.ai, require('../modules/ai/ai.routes'));
router.use('/activities', require('../modules/activities/activities.routes'));

module.exports = router;
