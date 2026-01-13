// backend/src/api/authRoutes.js
const express = require('express');
const AuthService = require('../services/authService');
const { COOKIE_SETTINGS } = require('../config/constants');
// CORRECCIÓN: Apuntamos a la carpeta 'middleware' (singular)
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// Helper para errores
const handleAuthError = (res, error) => {
  if (error.message === 'Invalid credentials' || error.message === 'Email already in use') {
    return res.status(400).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
};

/**
 * POST /api/v1/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await AuthService.register({ name, email, password });
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

    res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS);
    res.status(200).json({ user, accessToken });
  } catch (error) {
    handleAuthError(res, error);
  }
});

/**
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    const { user, accessToken, newRefreshToken } = await AuthService.refresh(refreshToken);

    res.cookie('refreshToken', newRefreshToken, COOKIE_SETTINGS);
    res.status(200).json({ user, accessToken });
  } catch (error) {
    res.clearCookie('refreshToken', COOKIE_SETTINGS);
    return res.status(401).json({ error: 'Unauthorized: Invalid refresh token' });
  }
});

/**
 * GET /api/v1/auth/me
 * 👇 ESTA ES LA PARTE CRÍTICA QUE FALTABA 👇
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    // req.user.id viene del middleware
    const user = await AuthService.getUserById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ error: 'Usuario no existe' });
    }
    handleAuthError(res, error);
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