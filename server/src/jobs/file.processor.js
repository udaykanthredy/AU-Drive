'use strict';

const { Worker } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * File processing worker — processes jobs from the 'file-processing' queue.
 *
 * TODO Phase 2: Implement each step:
 *   1. Download file from R2 using r2Key
 *   2. Extract text (PDF.js / mammoth for DOCX / fs for plain text)
 *   3. Call AI service: POST /internal/embed  → store embeddings in MongoDB
 *   4. Call AI service: POST /internal/summarize → update File.summary + File.tags
 *   5. Update File.processingStatus = 'done'
 *
 * On failure: set File.processingStatus = 'failed', log error
 */
async function startFileWorker() {
  const worker = new Worker(
    'file-processing',
    async (job) => {
      const { fileId, r2Key } = job.data;
      logger.info(`Processing file job ${job.id}: fileId=${fileId}`);

      // TODO Phase 2: Replace this placeholder with actual processing pipeline
      await job.updateProgress(10);

      // Step 1: Download file from R2
      // const fileBuffer = await downloadFromR2(r2Key);
      await job.updateProgress(30);

      // Step 2: Extract text
      // const text = await extractText(fileBuffer, mimeType);
      await job.updateProgress(50);

      // Step 3: Generate embeddings
      // await callAIService('/internal/embed', { fileId, text });
      await job.updateProgress(75);

      // Step 4: Generate summary + tags
      // await callAIService('/internal/summarize', { fileId, text });
      await job.updateProgress(90);

      // Step 5: Update status
      // await File.findByIdAndUpdate(fileId, { processingStatus: 'done' });
      await job.updateProgress(100);

      logger.info(`File job ${job.id} completed (placeholder)`);
      return { fileId, status: 'done' };
    },
    {
      connection: getRedisClient(),
      concurrency: 5,  // Process 5 files simultaneously
    }
  );

  worker.on('completed', (job) => {
    logger.info(`✅ File job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`❌ File job ${job?.id} failed:`, err.message);
    // TODO Phase 2: Update File.processingStatus = 'failed' in DB
  });

  worker.on('progress', (job, progress) => {
    logger.debug(`File job ${job.id} progress: ${progress}%`);
  });

  logger.info('BullMQ: file processor worker started');
  return worker;
}

module.exports = { startFileWorker };
