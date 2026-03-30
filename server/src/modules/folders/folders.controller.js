'use strict';

const foldersService = require('./folders.service');
const catchAsync = require('../../utils/catchAsync');

const createFolder = catchAsync(async (req, res) => {
  const { name, parentFolderId } = req.body;
  const ownerId = req.user.userId;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Folder name is required' });
  }

  const folder = await foldersService.createFolder({
    ownerId,
    name,
    parentFolderId: parentFolderId || null
  });

  res.status(201).json({ success: true, data: folder });
});

const listFolders = catchAsync(async (req, res) => {
  const { parentFolderId } = req.query;
  const ownerId = req.user.userId;

  const folders = await foldersService.getUserFolders(ownerId, parentFolderId || null);

  res.json({ success: true, data: folders });
});

const updateFolder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const ownerId = req.user.userId;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Folder name is required' });
  }

  const folder = await foldersService.updateFolder(id, ownerId, { name });

  res.json({ success: true, data: folder });
});

const deleteFolder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user.userId;

  const folder = await foldersService.softDeleteFolder(id, ownerId);

  res.json({ success: true, data: folder });
});

module.exports = {
  createFolder,
  listFolders,
  updateFolder,
  deleteFolder
};
