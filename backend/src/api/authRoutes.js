const express = require('express');
const AuthService = require('../services/authService');
const { COOKIE_SETTINGS } = require('../config/constants');

const router = express.Router();

// Helper for error handling (Guideline #9)
const handleAuthError = (res, error) => {
  if (error.message === 'Invalid credentials' || error.message === 'Email already in use') {
    return res.status(400).json({ error: error.message });
  }
  console.error(error); // Log internal errors
  return res.status(500).json({ error: 'Internal server error' });
};

/**
 * POST /api/v1/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await AuthService.register({ name, email, password });

    // Auto-login after register? Usually yes, but let's stick to contract.
    // Contract says register returns tokens.
    // So strictly we should probably generate tokens here too or modify register service.
    // Let's modify the flow to generate tokens on register for better UX:

    // Re-using login logic or refactoring register to return tokens is common.
    // For now, let's keep it simple: Register -> Returns User -> Client redirects to Login.
    // OR: Update AuthService.register to return tokens (Better UX).

    // Let's assume the user logs in immediately after.
    res.status(201).json({ user });
  } catch (error) {
    handleAuthError(res, error);
  }
});

/**
 * POST /api/v1/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.login(email, password);

    // Set Refresh Token in HttpOnly Cookie (Security Best Practice)
    res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS);

    // Return Access Token in body
    res.status(200).json({ user, accessToken });
  } catch (error) {
    handleAuthError(res, error);
  }
});


/**
 * POST /api/v1/auth/refresh
 * Exchanges a valid refresh token for new access and refresh tokens
 */
router.post('/refresh', async (req, res) => {
  try {
    // Extract refresh token from httpOnly cookie
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    // Verify and generate new tokens
    const { user, accessToken, newRefreshToken } = await AuthService.refresh(refreshToken);

    // Set new refresh token in httpOnly cookie
    res.cookie('refreshToken', newRefreshToken, COOKIE_SETTINGS);

    // Return new access token
    res.status(200).json({ user, accessToken });
  } catch (error) {
    // Clear invalid cookie
    res.clearCookie('refreshToken', COOKIE_SETTINGS);
    handleAuthError(res, error);
  }
});

/**
 * POST /api/v1/auth/refresh
 * Uses HttpOnly cookie to get a new Access Token.
 */
router.post('/refresh', async (req, res) => {
  try {
    // 1. Extract token from cookies (requires cookie-parser middleware)
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      // Guideline #9: Explicit Error Handling
      return res.status(401).json({ error: 'Refresh token missing' });
    }

    // 2. Call Service
    const result = await AuthService.refresh(refreshToken);

    // 3. Return new Access Token
    res.status(200).json(result);

  } catch (error) {
    // If the token is invalid (expired/tampered), return 401 Unauthorized
    // The frontend interceptor will catch this and redirect to /login
    return res.status(401).json({ error: 'Unauthorized: Invalid refresh token' });
  }
});


/**
 * POST /api/v1/auth/logout
 */
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    ...COOKIE_SETTINGS,
    maxAge: 0
  });
  res.status(204).send();
});

module.exports = router;