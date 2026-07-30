'use strict';

const filesService = require('./files.service');
const { getPresignedUploadUrl, uploadToR2 } = require('../../services/r2.service');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('../../utils/catchAsync');
const { enqueueFileProcessing } = require('../../queues/file.queue');

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

  if (size > 10 * 1024 * 1024) {
    return res.status(413).json({ success: false, message: 'File exceeds the 10MB limit' });
  }

  const newFile = await filesService.createFileRecord({
    ownerId,
    name,
    size,
    mimeType,
    r2Key,
    folderId: folderId || null,
  });

  // Enqueue AI processing job (Phase 4)
  await enqueueFileProcessing(newFile._id, newFile.r2Key);

  res.status(201).json({ success: true, data: newFile });
});

const crypto = require('crypto');
const File = require('../../models/File.model');

const checkDuplicate = catchAsync(async (req, res) => {
  const { contentHash, name, size, mimeType, folderId } = req.body;
  const ownerId = req.user.userId;

  if (!contentHash) {
    return res.status(400).json({ success: false, message: 'contentHash is required' });
  }

  // Find any existing file with the same hash owned by this user (including in trash!)
  // If we find one, we can deduplicate.
  const existingFile = await File.findOne({ ownerId, contentHash });

  if (existingFile) {
    // Perform Virtual Upload! Create a new file record pointing to the same R2 key
    const newFile = await filesService.createFileRecord({
      ownerId,
      name,
      size,
      mimeType,
      r2Key: existingFile.r2Key, // Reuse the same Cloudflare R2 object
      contentHash,
      folderId: folderId || null,
    });

    // Don't need to re-run AI processing if the hash is the same and we could just copy metadata,
    // but for now enqueueing it ensures the new record gets the AI summary too.
    await enqueueFileProcessing(newFile._id, newFile.r2Key);

    return res.json({ success: true, isDuplicate: true, data: newFile });
  }

  res.json({ success: true, isDuplicate: false });
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

  if (file.size > 10 * 1024 * 1024) {
    return res.status(413).json({ success: false, message: 'File exceeds the 10MB limit' });
  }

  // Phase 5: Duplicate Detection
  const contentHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const duplicate = await File.findOne({ ownerId: userId, contentHash, isDeleted: false });
  
  if (duplicate) {
    return res.status(409).json({ 
      success: false, 
      message: 'This exact file already exists in your drive.',
      data: duplicate
    });
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
    contentHash,
    folderId: req.body.folderId || null,
  });

  // Enqueue AI processing job (Phase 4)
  await enqueueFileProcessing(newFile._id, newFile.r2Key);

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

const archiver = require('archiver');
const { downloadFromR2 } = require('../../services/r2.service');

const bulkDownload = catchAsync(async (req, res) => {
  const { fileIds } = req.body;
  const userId = req.user.userId;

  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    return res.status(400).json({ success: false, message: 'No files provided' });
  }

  const files = await File.find({ _id: { $in: fileIds }, ownerId: userId, isDeleted: false });
  if (files.length === 0) {
    return res.status(404).json({ success: false, message: 'Files not found' });
  }

  res.attachment('AU-Drive-Export.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => res.status(500).send({ error: err.message }));
  archive.pipe(res);

  for (const file of files) {
    const buffer = await downloadFromR2(file.r2Key);
    archive.append(buffer, { name: file.name });
  }

  await archive.finalize();
});

const bulkMove = catchAsync(async (req, res) => {
  const { fileIds, folderId } = req.body;
  const userId = req.user.userId;

  await File.updateMany(
    { _id: { $in: fileIds }, ownerId: userId, isDeleted: false },
    { $set: { folderId: folderId || null } }
  );

  res.json({ success: true, message: 'Files moved successfully' });
});

const bulkDelete = catchAsync(async (req, res) => {
  const { fileIds } = req.body;
  const userId = req.user.userId;

  await File.updateMany(
    { _id: { $in: fileIds }, ownerId: userId, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } }
  );

  res.json({ success: true, message: 'Files moved to trash' });
});

module.exports = {
  generateUploadUrl,
  saveMetadata,
  checkDuplicate,
  uploadFile,
  listFiles,
  getFile,
  deleteFile,
  updateFile,
  restoreFile,
  permanentDeleteFile,
  bulkDownload,
  bulkMove,
  bulkDelete,
};
