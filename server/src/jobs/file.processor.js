'use strict';

const { Worker } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');
const File = require('../models/File.model');
const { downloadFromR2 } = require('../services/r2.service');
const { extractText, generateEmbeddings, summarizeFile } = require('../services/ai.service');

/**
 * File processing worker — processes jobs from the 'file-processing' queue.
 */
async function startFileWorker() {
  const worker = new Worker(
    'file-processing',
    async (job) => {
      const { fileId, r2Key } = job.data;
      logger.info(`Processing file job ${job.id}: fileId=${fileId}`);

      const file = await File.findById(fileId);
      if (!file) {
        throw new Error(`File not found: ${fileId}`);
      }
      
      await job.updateProgress(10);

      // Step 1: Download file from R2
      const fileBuffer = await downloadFromR2(r2Key);
      await job.updateProgress(30);

      // Step 2: Extract text
      const extractResult = await extractText(fileId, fileBuffer, file.mimeType);
      const text = extractResult.text;
      
      await File.findByIdAndUpdate(fileId, { textContent: text, processingStatus: 'processing' });
      
      await job.updateProgress(50);

      // Only continue AI processing if text was extracted
      if (text && text.trim().length > 0) {
        // Step 3: Generate embeddings
        await generateEmbeddings(fileId, text);
        await job.updateProgress(75);

        // Step 4: Generate summary + tags
        const summarizeResult = await summarizeFile(fileId, text);
        
        await File.findByIdAndUpdate(fileId, { 
          summary: summarizeResult.summary, 
          tags: summarizeResult.tags,
          containsPII: summarizeResult.contains_pii || false,
          processingStatus: 'done'
        });
      } else {
        // Nothing to embed/summarize
        await File.findByIdAndUpdate(fileId, { processingStatus: 'done' });
      }

      await job.updateProgress(100);

      logger.info(`File job ${job.id} completed`);
      return { fileId, status: 'done' };
    },
    {
      connection: getRedisClient(),
      concurrency: 1,  // Process 1 file at a time to avoid Gemini free tier rate limit
    }
  );

  worker.on('completed', (job) => {
    logger.info(`✅ File job ${job.id} completed`);
  });

  worker.on('failed', async (job, err) => {
    logger.error(`❌ File job ${job?.id} failed: ${err.message}`);
    console.error(err);
    
    if (job && job.data && job.data.fileId) {
      try {
        await File.findByIdAndUpdate(job.data.fileId, { processingStatus: 'failed' });
      } catch (dbErr) {
        logger.error(`Failed to update status for file ${job.data.fileId}`, dbErr);
      }
    }
  });

  worker.on('progress', (job, progress) => {
    logger.debug(`File job ${job.id} progress: ${progress}%`);
  });

  logger.info('BullMQ: file processor worker started');
  return worker;
}

module.exports = { startFileWorker };
