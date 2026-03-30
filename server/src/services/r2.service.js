'use strict';

const { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const { createR2Client } = require('../config/r2');
const logger = require('../utils/logger');

const BUCKET = process.env.R2_BUCKET || 'au-drive-files';
const UPLOAD_URL_TTL = 30 * 60;    // 30 minutes — enough for large files
const DOWNLOAD_URL_TTL = 5 * 60;   // 5 minutes

let r2Client;

function getR2Client() {
  if (!r2Client) r2Client = createR2Client();
  return r2Client;
}

/**
 * Generate a presigned PUT URL for direct client → R2 upload.
 * The r2Key is generated here and stored in the File metadata doc.
 *
 * @param {string} userId       - Owner's user ID (for namespaced keys)
 * @param {string} originalName - Original file name
 * @param {string} mimeType     - File MIME type
 * @returns {{ presignedUrl: string, r2Key: string }}
 *
 * TODO: For files > 50MB, use multipart upload instead (Phase 2)
 */
async function getPresignedUploadUrl(userId, originalName, mimeType) {
  const extension = originalName.split('.').pop();
  const r2Key = `users/${userId}/files/${uuidv4()}-${originalName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    ContentType: mimeType,
  });

  const presignedUrl = await getSignedUrl(getR2Client(), command, {
    expiresIn: UPLOAD_URL_TTL,
  });

  logger.debug(`R2 presigned upload URL generated for key: ${r2Key}`);
  return { presignedUrl, r2Key };
}

/**
 * Generate a presigned GET URL for secure file access.
 * Never store this URL — regenerate on each request.
 *
 * @param {string} r2Key - The R2 object key (from File.r2Key)
 * @returns {string} presignedUrl
 */
async function getPresignedDownloadUrl(r2Key) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
  });

  const presignedUrl = await getSignedUrl(getR2Client(), command, {
    expiresIn: DOWNLOAD_URL_TTL,
  });

  return presignedUrl;
}

/**
 * Permanently delete an object from R2.
 * Call ONLY when permanently deleting a file (not soft delete).
 *
 * @param {string} r2Key
 */
async function deleteObject(r2Key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
  });

  await getR2Client().send(command);
  logger.info(`R2 object deleted: ${r2Key}`);
}

module.exports = {
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  deleteObject,
};
