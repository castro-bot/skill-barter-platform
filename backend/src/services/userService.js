// backend/src/services/userService.js
const prisma = require("../core/db")

/**
 * Servicio para perfil público de usuario.
 * Devuelve datos del usuario (sin password) y sus servicios.
 */
class UserService {
  static async getPublicProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true, // si no quieres exponer email, ponlo en false
        createdAt: true
      }
    })

    if (!user) {
      const err = new Error("Usuario no encontrado")
      err.statusCode = 404
      throw err
    }

    // Servicios del usuario (incluye owner para reutilizar ServiceCard del frontend)
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
          select: { id: true, name: true }
        }
      }
    })

    return { user, services }
  }
}

module.exports = UserService