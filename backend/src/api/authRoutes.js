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
    const { name, email, password } = req.body || {};
    const { user, accessToken, refreshToken } = await AuthService.register({ name, email, password });

    // ðŸ”— Alineamos la respuesta con /login: guardamos refresh en cookie httpOnly
    res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS);
    res.status(201).json({ user, accessToken });
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
 * PUT /api/v1/auth/me
 * Update profile (name, email)
 */
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updatedUser = await AuthService.updateProfile(req.user.id, { name, email });
    res.status(200).json(updatedUser);
  } catch (error) {
    if (error.message === 'Email already in use' || error.message === 'No valid fields to update') {
      return res.status(400).json({ error: error.message });
    }
    handleAuthError(res, error);
  }
});

/**
 * PUT /api/v1/auth/me/password
 * Change password
 */
router.put('/me/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await AuthService.changePassword(req.user.id, { currentPassword, newPassword });
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Current password is incorrect') {
      return res.status(401).json({ error: error.message });
    }
    if (error.message.includes('required') || error.message.includes('at least')) {
      return res.status(400).json({ error: error.message });
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
