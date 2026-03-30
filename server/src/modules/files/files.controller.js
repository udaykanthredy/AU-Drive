'use strict';

const filesService = require('./files.service');
const { getPresignedUploadUrl } = require('../../services/r2.service');
const catchAsync = require('../../utils/catchAsync');

const generateUploadUrl = catchAsync(async (req, res) => {
  const { originalName, mimeType } = req.body;
  const userId = req.user.id;

  if (!originalName || !mimeType) {
    return res.status(400).json({ success: false, message: 'originalName and mimeType are required' });
  }

  const { presignedUrl, r2Key } = await getPresignedUploadUrl(userId, originalName, mimeType);

  res.json({
    success: true,
    data: {
      presignedUrl,
      r2Key,
    },
  });
});

const saveMetadata = catchAsync(async (req, res) => {
  const { name, size, mimeType, r2Key, folderId } = req.body;
  const ownerId = req.user.id;

  if (!name || !size || !mimeType || !r2Key) {
    return res.status(400).json({ success: false, message: 'Missing required file metadata' });
  }

  const newFile = await filesService.createFileRecord({
    ownerId,
    name,
    size,
    mimeType,
    r2Key,
    folderId: folderId || null,
  });

  res.status(201).json({ success: true, data: newFile });
});

const listFiles = catchAsync(async (req, res) => {
  const { folderId, isStarred, isDeleted, limit, skip } = req.query;
  const userId = req.user.id;

  const queryOptions = {
    folderId,
    limit: limit ? parseInt(limit, 10) : 50,
    skip: skip ? parseInt(skip, 10) : 0,
  };

  if (isStarred === 'true') queryOptions.isStarred = true;
  if (isDeleted === 'true') {
    queryOptions.isDeleted = true;
  } else {
    queryOptions.isDeleted = false;
  }

  const result = await filesService.getUserFiles(userId, queryOptions);

  res.json({ success: true, data: result.files, total: result.total });
});

const getFile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const file = await filesService.getFileWithPresignedUrl(id, userId);

  res.json({ success: true, data: file });
});

const deleteFile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const deletedFile = await filesService.softDeleteFile(id, userId);

  res.json({ success: true, data: deletedFile });
});

module.exports = {
  generateUploadUrl,
  saveMetadata,
  listFiles,
  getFile,
  deleteFile
};
