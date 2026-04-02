'use strict';

const Share = require('../../models/Share.model');
const File = require('../../models/File.model');
const Folder = require('../../models/Folder.model');
const { getPresignedDownloadUrl } = require('../../services/r2.service');

async function createShareLink(userId, resourceId, resourceType, expiresInDays = null) {
  // Check if resource exists and user owns it
  if (resourceType === 'file') {
    const file = await File.findOne({ _id: resourceId, ownerId: userId, isDeleted: false });
    if (!file) throw Object.assign(new Error('File not found'), { statusCode: 404 });
  } else if (resourceType === 'folder') {
    const folder = await Folder.findOne({ _id: resourceId, ownerId: userId, isDeleted: false });
    if (!folder) throw Object.assign(new Error('Folder not found'), { statusCode: 404 });
  } else {
    throw Object.assign(new Error('Invalid resource type'), { statusCode: 400 });
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

  } else if (share.resourceType === 'folder') {
    // Return folder metadata + direct children
    const folder = await Folder.findOne({ _id: share.resourceId, isDeleted: false }).lean();
    if (!folder) {
      throw Object.assign(new Error('Shared folder no longer exists'), { statusCode: 404 });
    }

    // Fetch direct subfolders and files in parallel
    const [subfolders, rawFiles] = await Promise.all([
      Folder.find({ parentFolderId: share.resourceId, isDeleted: false }).lean(),
      File.find({ folderId: share.resourceId, isDeleted: false }).select('+r2Key').lean(),
    ]);

    // Generate presigned download URLs for all files
    const files = await Promise.all(
      rawFiles.map(async (f) => {
        const presignedUrl = await getPresignedDownloadUrl(f.r2Key);
        const { r2Key, ...rest } = f;
        return { ...rest, presignedUrl };
      })
    );

    return {
      folder,
      subfolders,
      files,
      share: { permission: share.permission, expiresAt: share.expiresAt },
    };

  } else {
    throw Object.assign(new Error('Unknown resource type'), { statusCode: 400 });
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
