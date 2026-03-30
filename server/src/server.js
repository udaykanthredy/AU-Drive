'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const app = require('./app');
const { connectDB } = require('./config/db');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

/**
 * Graceful startup: connect to all services before accepting traffic
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('✅ MongoDB connected');

    // Connect to Redis (optional for local auth tests)
    try {
      await connectRedis();
      logger.info('✅ Redis connected');
    } catch (err) {
      logger.warn('⚠️ Redis connection failed (probably not running locally) — skipping for now');
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`📋 API: http://localhost:${PORT}/api`);
      logger.info(`🔧 Health: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
