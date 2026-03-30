'use strict';

const File = require('../../models/File.model');
const { getPresignedDownloadUrl } = require('../../services/r2.service');

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

  // Only filter by folderId if we're not looking at starred or trash
  if (isStarred === undefined && queryOptions.isDeleted === undefined) {
    query.folderId = folderId;
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

module.exports = {
  createFileRecord,
  getUserFiles,
  getFileWithPresignedUrl,
  softDeleteFile,
};
