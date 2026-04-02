'use strict';

const { Router } = require('express');
const { verifyToken } = require('../../middleware/auth.middleware');
const router = Router();

const foldersController = require('./folders.controller');

router.use(verifyToken);

router.post('/', foldersController.createFolder);
router.get('/', foldersController.listFolders);
router.patch('/:id', foldersController.updateFolder);
router.patch('/:id/star', foldersController.starFolder);
router.delete('/:id', foldersController.deleteFolder);

module.exports = router;
