// backend/src/core/UserFactory.js
/**
 * UserFactory - Factory Pattern for User Creation
 *
 * Follows Clean Code Guidelines:
 * - Single Responsibility: Only handles user object creation
 * - Open/Closed: Easy to add new user types without modifying existing code
 * - DRY: Centralized user creation logic
 */

// User type constants (avoid magic strings)
const USER_TYPES = {
  REGULAR: 'USER',
  MODERATOR: 'MODERATOR',
};

/**
 * Factory class for creating user objects with appropriate roles
 */
class UserFactory {

  /**
   * Create a user data object with the specified role
   * @param {string} type - User type ('REGULAR' or 'MODERATOR')
   * @param {Object} userData - Base user data { name, email, password (hashed) }
   * @returns {Object} User data object with role attached
   */
  static create(type, userData) {
    const { name, email, password } = userData;

    // Base user properties (shared by all types)
    const baseUser = {
      name,
      email,
      password,
    };

    switch (type) {
      case 'REGULAR':
        return {
          ...baseUser,
          role: USER_TYPES.REGULAR,
        };

      case 'MODERATOR':
        return {
          ...baseUser,
          role: USER_TYPES.MODERATOR,
        };

      default:
        // Default to regular user (fail-safe)
        console.warn(`Unknown user type: ${type}. Defaulting to REGULAR.`);
        return {
          ...baseUser,
          role: USER_TYPES.REGULAR,
        };
    }
  }

  /**
   * Create a regular user
   * @param {Object} userData - { name, email, password }
   */
  static createRegularUser(userData) {
    return this.create('REGULAR', userData);
  }

  /**
   * Create a moderator user
   * @param {Object} userData - { name, email, password }
   */
  static createModeratorUser(userData) {
    return this.create('MODERATOR', userData);
  }
}

module.exports = {
  UserFactory,
  USER_TYPES,
};
