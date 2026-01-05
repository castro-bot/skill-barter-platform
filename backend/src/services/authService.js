const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../core/db'); // Singleton instance
const config = require('../config/env');
const { TOKEN_EXPIRATION } = require('../config/constants');

/**
 * Service responsible for User Authentication logic.
 * Adheres to Single Responsibility Principle.
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   * @returns {Promise<Object>} - Created user (without password)
   */
  static async register({ name, email, password }) {
    // 1. Validation (Guideline #1: DRY - could extract email check)
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // 2. Check for duplicates
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
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
   * Authenticate a user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} - { user, accessToken, refreshToken }
   */
  static async login(email, password) {
    // 1. Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 2. Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // 3. Generate tokens
    const accessToken = this._generateAccessToken(user.id);
    const refreshToken = this._generateRefreshToken(user.id);

    return {
      user: this._sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh a short-lived access token using a long-lived refresh token.
   * @param {string} refreshToken
   * @returns {Object} - { accessToken }
   */
  static async refresh(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    try {
      // 1. Verify the Refresh Token
      // This throws an error if the token is expired or invalid
      const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

      // 2. Check if user still exists (Security Best Practice)
      // If the user was deleted/banned 5 mins ago, we shouldn't issue a new token.
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user) {
        throw new Error('User not found');
      }

      // 3. Generate a NEW Access Token
      const accessToken = this._generateAccessToken(user.id);

      return { accessToken };
    } catch (error) {
      // Guideline #9: Handle specific errors
      throw new Error('Invalid refresh token');
    }
  }

  // --- Private Helpers (Guideline #1: DRY) ---

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
    // Return user without sensitive fields
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = AuthService;