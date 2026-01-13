// backend/src/services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../core/db'); // Instancia Singleton de Prisma
const config = require('../config/env');
const { TOKEN_EXPIRATION } = require('../config/constants');

/**
 * Servicio responsable de la lógica de autenticación.
 */
class AuthService {
  
  /**
   * Registrar un nuevo usuario
   */
  static async register({ name, email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return this._sanitizeUser(user);
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