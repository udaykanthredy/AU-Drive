'use strict';

const { Queue } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

let fileQueue;

/**
 * Lazy-initialize the file processing queue.
 * Must be called after Redis is connected.
 *
 * TODO: Add queue event listeners for monitoring (Phase 2)
 */
function getFileQueue() {
  if (!fileQueue) {
    fileQueue = new Queue('file-processing', {
      connection: getRedisClient(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
      },
    });
    logger.info('BullMQ: file-processing queue initialized');
  }
  return fileQueue;
}

/**
 * Enqueue a file for background AI processing.
 * Called immediately after File metadata is saved to MongoDB.
 *
 * @param {string} fileId - MongoDB File document _id
 * @param {string} r2Key  - R2 object key for downloading the file
 */
async function enqueueFileProcessing(fileId, r2Key) {
  const queue = getFileQueue();
  const job = await queue.add(
    'process-file',
    { fileId, r2Key },
    { jobId: `file-${fileId}` } // Deduplicate jobs for same file
  );
  logger.info(`Enqueued file processing job ${job.id} for file ${fileId}`);
  return job;
}

module.exports = { getFileQueue, enqueueFileProcessing };
