/**
 * Authentication Middleware
 * Guideline #6: Single Responsibility - Only validates tokens.
 */
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const authenticate = (req, res, next) => {
  try {
    // 1. Extract Header: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Guideline #9: Standardized error responses via error middleware usually,
      // but middleware often sends direct 401 for clarity.
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify Token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // 3. Attach User ID to Request
    // Now any route using this middleware can access req.user.id
    req.user = { id: decoded.userId };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticate;