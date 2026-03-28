'use strict';

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Middleware: Verify JWT access token from Authorization header or cookie
 * TODO: Add token blacklist check (Redis) for logout support
 */
function verifyToken(req, res, next) {
  try {
    // Support both header bearer token and httpOnly cookie
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;
    const tokenFromCookie = req.cookies?.accessToken;

    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, iat, exp }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    logger.error('Auth middleware error:', error);
    next(error);
  }
}

/**
 * Middleware: Optional auth — attach user if token present but don't block
 * Used for public share pages that may show extra info if logged in
 */
function optionalToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.accessToken;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch {
    // Silently ignore invalid/expired tokens for optional auth
  }
  next();
}

module.exports = { verifyToken, optionalToken };
