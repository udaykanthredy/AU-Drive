'use strict';

const { S3Client } = require('@aws-sdk/client-s3');

/**
 * Cloudflare R2 is S3-compatible, so we use the AWS SDK pointed at R2's endpoint.
 * TODO: Validate all required env vars on startup
 */
function createR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY;
  const secretAccessKey = process.env.R2_SECRET_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'R2 credentials not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY in .env'
    );
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
  });
}

module.exports = { createR2Client };
