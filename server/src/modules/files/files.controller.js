'use strict';

const filesService = require('./files.service');
const { getPresignedUploadUrl, uploadToR2 } = require('../../services/r2.service');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('../../utils/catchAsync');

const generateUploadUrl = catchAsync(async (req, res) => {
  const { originalName, mimeType } = req.body;
  const userId = req.user.userId;

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
  const ownerId = req.user.userId;

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

/**
 * Proxied upload: Browser → Express → R2 (bypasses CORS entirely)
 * Accepts multipart/form-data with a single file + optional folderId
 */
const uploadFile = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: 'No file provided' });
  }

  const r2Key = `users/${userId}/files/${uuidv4()}-${file.originalname}`;

  // 1. Upload to R2 from the server
  try {
    await uploadToR2(r2Key, file.buffer, file.mimetype);
  } catch (r2Err) {
    console.error('R2 Upload Error Details:', {
      message: r2Err.message,
      code: r2Err.Code || r2Err.$metadata,
      name: r2Err.name,
    });
    return res.status(502).json({
      success: false,
      message: 'Failed to upload to storage',
      detail: r2Err.message,
    });
  }

  // 2. Save metadata to MongoDB
  const newFile = await filesService.createFileRecord({
    ownerId: userId,
    name: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    r2Key,
    folderId: req.body.folderId || null,
  });

  res.status(201).json({ success: true, data: newFile });
});

const listFiles = catchAsync(async (req, res) => {
  const { folderId, isStarred, isDeleted, limit, skip } = req.query;
  const userId = req.user.userId;

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
  const userId = req.user.userId;

  const file = await filesService.getFileWithPresignedUrl(id, userId);

  res.json({ success: true, data: file });
});

const deleteFile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const deletedFile = await filesService.softDeleteFile(id, userId);

  res.json({ success: true, data: deletedFile });
});

const updateFile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  const updatedFile = await filesService.updateFile(id, userId, req.body);
  res.json({ success: true, data: updatedFile });
});

const restoreFile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const restoredFile = await filesService.restoreFile(id, userId);
  res.json({ success: true, data: restoredFile });
});

const permanentDeleteFile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const result = await filesService.hardDeleteFile(id, userId);
  res.json({ success: true, data: result });
});

module.exports = {
  generateUploadUrl,
  saveMetadata,
  uploadFile,
  listFiles,
  getFile,
  deleteFile,
  updateFile,
  restoreFile,
  permanentDeleteFile,
};
