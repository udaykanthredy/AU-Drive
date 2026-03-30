'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const { ApiError } = require('../../middleware/error.middleware');
const logger = require('../../utils/logger');

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// ── Token Helpers ────────────────────────────────────────────────────────────

function generateAccessToken(userId, email) {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
}

/**
 * Set httpOnly cookies for access + refresh token.
 * These cookies are inaccessible to JavaScript — mitigates XSS.
 */
function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOpts = { httpOnly: true, sameSite: 'strict', secure: isProd };

  res.cookie('accessToken', accessToken, {
    ...cookieOpts,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOpts,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh', // limit refresh token scope
  });
}

function clearAuthCookies(res) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
}

// ── Auth Service Methods ─────────────────────────────────────────────────────

/**
 * Register a new user.
 * @throws {ApiError} 409 if email already exists
 */
async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({ name, email, passwordHash });
  logger.info(`New user registered: ${email}`);

  const accessToken = generateAccessToken(user._id, user.email);
  const refreshToken = generateRefreshToken(user._id);

  return { user, accessToken, refreshToken };
}

/**
 * Log in an existing user.
 * @throws {ApiError} 401 if credentials are invalid
 */
async function login({ email, password }) {
  // Explicitly select passwordHash (it's hidden by default via `select: false`)
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  const accessToken = generateAccessToken(user._id, user.email);
  const refreshToken = generateRefreshToken(user._id);

  logger.info(`User logged in: ${email}`);
  return { user, accessToken, refreshToken };
}

/**
 * Rotate the refresh token → issue a new access token.
 * @throws {ApiError} 401 if token is invalid/expired
 */
async function refresh(refreshToken) {
  if (!refreshToken) throw new ApiError(401, 'Refresh token missing');

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Refresh token invalid or expired. Please log in again.');
  }

  const user = await User.findById(decoded.userId);
  if (!user) throw new ApiError(401, 'User not found');

  const newAccessToken = generateAccessToken(user._id, user.email);
  const newRefreshToken = generateRefreshToken(user._id);

  return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
}

module.exports = {
  register,
  login,
  refresh,
  setAuthCookies,
  clearAuthCookies,
};
