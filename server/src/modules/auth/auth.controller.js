'use strict';

const authService = require('./auth.service');
const logger = require('../../utils/logger');

// ── Register ─────────────────────────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.register({
      name,
      email,
      password,
    });

    authService.setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          storageUsed: user.storageUsed,
          storageQuota: user.storageQuota,
        },
        accessToken, // also return in body for clients that can't use cookies
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({ email, password });

    authService.setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          storageUsed: user.storageUsed,
          storageQuota: user.storageQuota,
        },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
async function logout(req, res) {
  authService.clearAuthCookies(res);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

// ── Refresh Token ─────────────────────────────────────────────────────────────
async function refreshToken(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    const { user, accessToken, refreshToken: newRefreshToken } = await authService.refresh(token);

    authService.setAuthCookies(res, accessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          storageUsed: user.storageUsed,
          storageQuota: user.storageQuota,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── Get Current User ──────────────────────────────────────────────────────────
async function getMe(req, res, next) {
  try {
    const User = require('../../models/User.model');
    const File = require('../../models/File.model');
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate dynamic storage usage to prevent desync
    const result = await File.aggregate([
      { $match: { ownerId: user._id, isDeleted: false } },
      { $group: { _id: null, totalSize: { $sum: '$size' } } }
    ]);
    const actualStorageUsed = result[0]?.totalSize || 0;

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        storageUsed: actualStorageUsed,
        storageQuota: user.storageQuota,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, refreshToken, getMe };
