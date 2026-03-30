'use strict';

const Folder = require('../../models/Folder.model');

/**
 * Creates a new folder
 * @param {Object} folderData
 * @returns {Promise<Object>}
 */
async function createFolder(folderData) {
  const folder = new Folder(folderData);
  await folder.save();
  return folder.toObject();
}

/**
 * Retrieves folders for a user
 * @param {string} userId
 * @param {string|null} parentFolderId
 * @returns {Promise<Object[]>}
 */
async function getUserFolders(userId, parentFolderId = null) {
  const query = { 
    ownerId: userId, 
    parentFolderId,
    isDeleted: false
  };

  return await Folder.find(query).sort({ name: 1 }).lean();
}

/**
 * Updates a folder
 * @param {string} folderId
 * @param {string} userId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
async function updateFolder(folderId, userId, updateData) {
  const folder = await Folder.findOneAndUpdate(
    { _id: folderId, ownerId: userId, isDeleted: false },
    { $set: updateData },
    { new: true }
  ).lean();

  if (!folder) {
    const error = new Error('Folder not found');
    error.statusCode = 404;
    throw error;
  }

  return folder;
}

/**
 * Soft deletes a folder
 * @param {string} folderId
 * @param {string} userId
 * @returns {Promise<Object>}
 */
async function softDeleteFolder(folderId, userId) {
  const folder = await Folder.findOneAndUpdate(
    { _id: folderId, ownerId: userId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  ).lean();

  if (!folder) {
    const error = new Error('Folder not found or already deleted');
    error.statusCode = 404;
    throw error;
  }

  return folder;
}

module.exports = {
  createFolder,
  getUserFolders,
  updateFolder,
  softDeleteFolder,
};
