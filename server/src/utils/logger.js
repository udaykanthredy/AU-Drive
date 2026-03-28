'use strict';

const winston = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ─── Log Format ─────────────────────────────────────────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

// ─── Logger ─────────────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    // TODO: Add file transport or a cloud logging sink for production
    // new winston.transports.File({ filename: path.join(__dirname, '../../logs/error.log'), level: 'error' }),
    // new winston.transports.File({ filename: path.join(__dirname, '../../logs/combined.log') }),
  ],
  exitOnError: false,
});

// Add http level for Morgan
logger.http = (msg) => logger.log('http', msg);

module.exports = logger;
