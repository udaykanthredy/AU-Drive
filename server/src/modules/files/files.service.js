'use strict';

const File = require('../../models/File.model');
const { getPresignedDownloadUrl, deleteObject } = require('../../services/r2.service');

/**
 * Creates a file record in the database after successful upload to R2
 * @param {Object} fileData
 * @returns {Promise<Object>}
 */
async function createFileRecord(fileData) {
  const file = new File(fileData);
  await file.save();
  return file.toObject();
}

/**
 * Retrieves files for a user, handling folder navigation and filters
 * @param {string} userId
 * @param {Object} queryOptions - { folderId, isStarred, isDeleted, limit, skip }
 * @returns {Promise<{ files: Object[], total: number }>}
 */
async function getUserFiles(userId, queryOptions = {}) {
  const { folderId = null, isStarred, isDeleted = false, limit = 50, skip = 0 } = queryOptions;

  const query = { ownerId: userId, isDeleted };

  // Apply folderId filter for normal drive browsing (not starred/trash views)
  // isStarred view and trash view fetch across all folders, so we skip the filter there
  if (isStarred === undefined) {
    query.folderId = folderId ?? null;
  }

  if (isStarred !== undefined) {
    query.isStarred = isStarred;
  }

  const [files, total] = await Promise.all([
    File.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    File.countDocuments(query),
  ]);

  return { files, total };
}

/**
 * Retrieves a single file with a fresh presigned download URL
 * @param {string} fileId
 * @param {string} userId
 * @returns {Promise<Object>}
 */
async function getFileWithPresignedUrl(fileId, userId) {
  const file = await File.findOne({ _id: fileId, ownerId: userId, isDeleted: false }).select('+r2Key').lean();
  
  if (!file) {
    const error = new Error('File not found');
    error.statusCode = 404;
    throw error;
  }

  const presignedUrl = await getPresignedDownloadUrl(file.r2Key);
  
  // Remove r2Key from the output
  delete file.r2Key;
  
  return { ...file, presignedUrl };
}

/**
 * Soft deletes a file
 * @param {string} fileId
 * @param {string} userId
 * @returns {Promise<Object>}
 */
async function softDeleteFile(fileId, userId) {
  const file = await File.findOneAndUpdate(
    { _id: fileId, ownerId: userId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  ).lean();

  if (!file) {
    const error = new Error('File not found or already deleted');
    error.statusCode = 404;
    throw error;
  }

  return file;
}

/**
 * Updates a file metadata (rename, move, star)
 */
async function updateFile(fileId, userId, updateData) {
  const allowedUpdates = {};
  if (updateData.name !== undefined) allowedUpdates.name = updateData.name;
  if (updateData.folderId !== undefined) allowedUpdates.folderId = updateData.folderId;
  if (updateData.isStarred !== undefined) allowedUpdates.isStarred = updateData.isStarred;
  
  const file = await File.findOneAndUpdate(
    { _id: fileId, ownerId: userId, isDeleted: false },
    { $set: allowedUpdates },
    { new: true }
  ).lean();

  if (!file) {
    const error = new Error('File not found');
    error.statusCode = 404;
    throw error;
  }
  return file;
}

/**
 * Restores a file from the trash
 */
async function restoreFile(fileId, userId) {
  const file = await File.findOneAndUpdate(
    { _id: fileId, ownerId: userId, isDeleted: true },
    { $set: { isDeleted: false, deletedAt: null } },
    { new: true }
  ).lean();

  if (!file) {
    const error = new Error('File not found in trash');
    error.statusCode = 404;
    throw error;
  }
  return file;
}

/**
 * Permanently deletes a file from R2 and MongoDB
 */
async function hardDeleteFile(fileId, userId) {
  // We must find it first to get the r2Key, regardless of if it's in the trash
  const file = await File.findOne({ _id: fileId, ownerId: userId });

  if (!file) {
    const error = new Error('File not found');
    error.statusCode = 404;
    throw error;
  }

  // 1. Delete object from Cloudflare R2
  try {
    await deleteObject(file.r2Key);
  } catch (err) {
    // If it's already missing from R2, continue with DB deletion. Otherwise throw
    if (err.name !== 'NoSuchKey') {
      throw err;
    }
  }

  // 2. Delete document from MongoDB
  await File.deleteOne({ _id: fileId, ownerId: userId });
  
  return { id: fileId, deleted: true };
}

module.exports = {
  createFileRecord,
  getUserFiles,
  getFileWithPresignedUrl,
  softDeleteFile,
  updateFile,
  restoreFile,
  hardDeleteFile,
};
