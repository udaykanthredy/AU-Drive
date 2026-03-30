'use strict';

const Share = require('../../models/Share.model');
const File = require('../../models/File.model');
const { getPresignedDownloadUrl } = require('../../services/r2.service');

async function createShareLink(userId, resourceId, resourceType, expiresInDays = null) {
  // Check if resource exists and user owns it
  if (resourceType === 'file') {
    const file = await File.findOne({ _id: resourceId, ownerId: userId, isDeleted: false });
    if (!file) throw Object.assign(new Error('File not found'), { statusCode: 404 });
  } else {
    throw Object.assign(new Error('Folder sharing not yet implemented'), { statusCode: 501 });
  }

  // Calculate expiresAt if provided
  let expiresAt = null;
  if (expiresInDays) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  // Find existing share or create new
  const share = await Share.findOneAndUpdate(
    { resourceId, resourceType, createdBy: userId, isRevoked: false },
    { expiresAt }, // Update expiration if it exists
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return share;
}

async function resolveShare(token) {
  const share = await Share.findOne({ linkToken: token, isRevoked: false }).lean();
  if (!share) {
    throw Object.assign(new Error('Invalid or revoked share link'), { statusCode: 404 });
  }

  // If expired, the TTL index might not have caught it yet
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    throw Object.assign(new Error('Share link expired'), { statusCode: 410 }); // Gone
  }

  if (share.resourceType === 'file') {
    // Return file metadata and presigned URL
    const file = await File.findOne({ _id: share.resourceId, isDeleted: false }).select('+r2Key').lean();
    if (!file) {
      throw Object.assign(new Error('Shared file no longer exists'), { statusCode: 404 });
    }

    const presignedUrl = await getPresignedDownloadUrl(file.r2Key);
    delete file.r2Key;

    return { file: { ...file, presignedUrl }, share: { permission: share.permission, expiresAt: share.expiresAt } };
  } else {
     throw Object.assign(new Error('Folder sharing not yet implemented'), { statusCode: 501 });
  }
}

async function revokeShare(userId, shareId) {
  const share = await Share.findOneAndUpdate(
    { _id: shareId, createdBy: userId },
    { isRevoked: true },
    { new: true }
  ).lean();

  if (!share) {
    throw Object.assign(new Error('Share not found'), { statusCode: 404 });
  }

  return share;
}

module.exports = {
  createShareLink,
  resolveShare,
  revokeShare
};
