'use strict';

const { Router } = require('express');
const router = Router();

// TODO Phase 1: Import auth controller
// const { register, login, logout, refreshToken, getMe } = require('./auth.controller');

/**
 * POST /api/auth/register
 * TODO Phase 1: Validate input → hash password → create user → return JWT
 */
router.post('/register', (req, res) => {
  res.status(501).json({ success: false, message: 'TODO: implement register' });
});

/**
 * POST /api/auth/login
 * TODO Phase 1: Validate credentials → compare hash → return access + refresh token
 */
router.post('/login', (req, res) => {
  res.status(501).json({ success: false, message: 'TODO: implement login' });
});

/**
 * POST /api/auth/logout
 * TODO Phase 1: Invalidate refresh token, clear cookie
 */
router.post('/logout', (req, res) => {
  res.status(501).json({ success: false, message: 'TODO: implement logout' });
});

/**
 * POST /api/auth/refresh
 * TODO Phase 1: Verify refresh token → issue new access token
 */
router.post('/refresh', (req, res) => {
  res.status(501).json({ success: false, message: 'TODO: implement token refresh' });
});

/**
 * GET /api/auth/me
 * TODO Phase 1: Return current user profile (requires verifyToken middleware)
 */
router.get('/me', (req, res) => {
  res.status(501).json({ success: false, message: 'TODO: implement get me' });
});

module.exports = router;
