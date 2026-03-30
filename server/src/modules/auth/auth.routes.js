'use strict';

const { Router } = require('express');
const router = Router();

const { register, login, logout, refreshToken, getMe } = require('./auth.controller');
const { validate, registerSchema, loginSchema } = require('./auth.validation');
const { verifyToken } = require('../../middleware/auth.middleware');

/**
 * POST /api/auth/register  — Create account, returns user + JWT
 */
router.post('/register', validate(registerSchema), register);

/**
 * POST /api/auth/login  — Validate credentials, returns user + JWT
 */
router.post('/login', validate(loginSchema), login);

/**
 * POST /api/auth/logout  — Clears auth cookies
 */
router.post('/logout', logout);

/**
 * POST /api/auth/refresh  — Rotate refresh token → new access token
 */
router.post('/refresh', refreshToken);

/**
 * GET /api/auth/me  — Get current user profile (protected)
 */
router.get('/me', verifyToken, getMe);

module.exports = router;
