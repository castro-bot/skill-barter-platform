// backend/src/services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../core/db'); // Instancia Singleton de Prisma
const config = require('../config/env');
const { TOKEN_EXPIRATION } = require('../config/constants');
const { UserFactory } = require('../core/UserFactory'); // Factory Pattern

/**
 * Servicio responsable de la lógica de autenticación.
 */
class AuthService {

  /**
   * Registrar un nuevo usuario
   * @param {string} userType - Optional: 'REGULAR' or 'MODERATOR' (default: REGULAR)
   */
  static async register({ name, email, password, userType = 'REGULAR' }) {
    const rawEmail = String(email ?? '').trim();

    if (!rawEmail || !password) {
      throw new Error('Email and password are required');
    }

    const normalizedEmail = rawEmail.toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Factory Pattern: Create user data with appropriate role
    const userData = UserFactory.create(userType, {
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const user = await prisma.user.create({
      data: userData,
    });

    // Genera tokens para iniciar sesión inmediatamente después de registrar
    const accessToken = this._generateAccessToken(user.id);
    const refreshToken = this._generateRefreshToken(user.id);

    return {
      user: this._sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Obtener usuario por ID (Para la ruta /me)
   * CORREGIDO PARA PRISMA
   */
  static async getUserById(userId) {
    // Usamos Prisma para buscar por ID
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Reutilizamos la función helper para quitar la contraseña
    return this._sanitizeUser(user);
  }

  /**
   * Iniciar sesión
   */
  static async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this._generateAccessToken(user.id);
    const refreshToken = this._generateRefreshToken(user.id);

    return {
      user: this._sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refrescar token
   */
  static async refresh(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    try {
      // 1. Verificar el token
      const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

      // 2. Verificar que el usuario exista en Prisma
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user) {
        throw new Error('User not found');
      }

      // 3. Generar NUEVOS tokens (Rotación de tokens para seguridad)
      const accessToken = this._generateAccessToken(user.id);
      const newRefreshToken = this._generateRefreshToken(user.id);

      return {
        user: this._sanitizeUser(user),
        accessToken,
        newRefreshToken // Devolvemos esto para actualizar la cookie
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Update user profile (name and/or email)
   * @param {string} userId
   * @param {Object} data - { name?, email? }
   */
  static async updateProfile(userId, { name, email }) {
    // Build update object dynamically (only include provided fields)
    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (email !== undefined) {
      // Check email uniqueness if changing email
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email already in use');
      }
      updateData.email = email;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this._sanitizeUser(updatedUser);
  }

  /**
   * Change user password
   * @param {string} userId
   * @param {Object} data - { currentPassword, newPassword }
   */
  static async changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    // 1. Get user with password
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // 3. Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: 'Password updated successfully' };
  }

  // --- Private Helpers ---

  static _generateAccessToken(userId) {
    return jwt.sign({ userId }, config.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION.ACCESS,
    });
  }

  static _generateRefreshToken(userId) {
    return jwt.sign({ userId }, config.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION.REFRESH,
    });
  }

  static _sanitizeUser(user) {
    // Retorna el usuario sin la contraseña
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = AuthService;
