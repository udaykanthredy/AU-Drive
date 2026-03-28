'use strict';

const { Redis } = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

/**
 * Initialize and return the Redis client singleton
 */
async function connectRedis() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = new Redis(url, {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
  });

  redisClient.on('connect', () => logger.info('Redis connecting...'));
  redisClient.on('ready', () => logger.info('Redis ready'));
  redisClient.on('error', (err) => logger.error('Redis error:', err));
  redisClient.on('close', () => logger.warn('Redis connection closed'));

  await redisClient.connect();
  return redisClient;
}

function getRedisClient() {
  if (!redisClient) throw new Error('Redis client not initialized. Call connectRedis() first.');
  return redisClient;
}

module.exports = { connectRedis, getRedisClient };
