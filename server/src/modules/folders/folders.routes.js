'use strict';

const { Router } = require('express');
const { verifyToken } = require('../../middleware/auth.middleware');
const router = Router();

router.use(verifyToken);

/**
 * POST   /api/folders         → create folder
 * GET    /api/folders/:id     → list folder contents (files + subfolders), id='root' for root
 * PATCH  /api/folders/:id     → rename / move folder
 * DELETE /api/folders/:id     → soft delete folder + all children
 */
router.post('/', (req, res) => res.status(501).json({ message: 'TODO: create folder' }));
router.get('/:id', (req, res) => res.status(501).json({ message: 'TODO: get folder contents' }));
router.patch('/:id', (req, res) => res.status(501).json({ message: 'TODO: update folder' }));
router.delete('/:id', (req, res) => res.status(501).json({ message: 'TODO: delete folder' }));

module.exports = router;
