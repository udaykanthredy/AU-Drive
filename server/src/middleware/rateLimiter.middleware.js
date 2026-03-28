'use strict';

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60_000; // 1 minute

function createLimiter(max, message) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    handler: (req, res, _next, options) => {
      logger.warn(`Rate limit hit: ${req.ip} → ${req.path}`);
      res.status(429).json(options.message);
    },
  });
}

const rateLimiter = {
  /** General API: 100 req/min */
  general: createLimiter(
    parseInt(process.env.RATE_LIMIT_MAX_GENERAL) || 100,
    'Too many requests. Please slow down.'
  ),
  /** Auth endpoints: 10 req/min (brute-force protection) */
  auth: createLimiter(10, 'Too many auth attempts. Try again in a minute.'),
  /** AI endpoints: 10 req/min (cost control) */
  ai: createLimiter(
    parseInt(process.env.RATE_LIMIT_MAX_AI) || 10,
    'AI rate limit reached. Please wait before trying again.'
  ),
  /** Chat endpoint: 5 req/min */
  chat: createLimiter(5, 'Chat rate limit reached. Please wait.'),
};

module.exports = { rateLimiter };
