// backend/src/services/userService.js
const prisma = require("../core/db")
const bcrypt = require("bcrypt")

/**
 * User service:
 * - Public profile: GET /users/:id
 * - Profile settings: PUT /users/me
 * - Password change: PUT /users/me/password
 */
class UserService {
  /**
   * Public user profile (no password) and services.
   */
  static async getPublicProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        ratingAverage: true,
        ratingCount: true
      }
    })

    if (!user) {
      const err = new Error("Usuario no encontrado")
      err.statusCode = 404
      throw err
    }

    const services = await prisma.serviceListing.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            ratingAverage: true,
            ratingCount: true
          }
        }
      }
    })

    return { user, services }
  }

  /**
   * Update authenticated user profile (name/email).
   */
  static async updateProfile(userId, { name, email }) {
    const updateData = {}

    if (name !== undefined) {
      const trimmed = String(name).trim()
      if (trimmed.length < 2) {
        const err = new Error("Name must be at least 2 characters")
        err.statusCode = 400
        throw err
      }
      updateData.name = trimmed
    }

    if (email !== undefined) {
      const trimmed = String(email).trim().toLowerCase()
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!emailRegex.test(trimmed)) {
        const err = new Error("Invalid email format")
        err.statusCode = 400
        throw err
      }

      const existing = await prisma.user.findUnique({ where: { email: trimmed } })
      if (existing && existing.id !== userId) {
        const err = new Error("Email already in use")
        err.statusCode = 409
        throw err
      }

      updateData.email = trimmed
    }

    if (Object.keys(updateData).length === 0) {
      const err = new Error("No valid fields to update")
      err.statusCode = 400
      throw err
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })

    return updated
  }

  /**
   * Change authenticated user's password.
   */
  static async changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      const err = new Error("currentPassword and newPassword are required")
      err.statusCode = 400
      throw err
    }

    const current = String(currentPassword)
    const next = String(newPassword)

    if (next.length < 6) {
      const err = new Error("New password must be at least 6 characters")
      err.statusCode = 400
      throw err
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true }
    })

    if (!user) {
      const err = new Error("User not found")
      err.statusCode = 404
      throw err
    }

    const ok = await bcrypt.compare(current, user.password)
    if (!ok) {
      const err = new Error("Current password is incorrect")
      err.statusCode = 401
      throw err
    }

    const hashed = await bcrypt.hash(next, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed }
    })

    return { success: true }
  }
}

module.exports = UserService
