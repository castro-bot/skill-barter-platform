// backend/src/services/serviceListingService.js
const prisma = require("../core/db")

/**
 * Service for managing ServiceListings.
 * Opción A (sin migración Prisma):
 * - NO usamos isActive / deactivatedAt porque el schema actual no los tiene.
 * - Mantenemos:
 *   - excluir servicios involucrados en trades COMPLETED
 *   - opcional: excluir servicios del usuario actual (marketplace de "otros")
 */
class ServiceListingService {
  /**
   * Create a new service listing
   * @param {string} userId - ID of the owner
   * @param {Object} data - { title, description, category }
   */
  static async createService(userId, { title, description, category }) {
    if (!title || !description || !category) {
      throw new Error("Title, description, and category are required")
    }

    const service = await prisma.serviceListing.create({
      data: {
        title,
        description,
        category,
        ownerId: userId
      },
      include: {
        owner: {
          select: { id: true, name: true }
        }
      }
    })

    return service
  }

  /**
   * Get all services with optional filters
   * - Excluye servicios involucrados en trades COMPLETED
   * - Opcional: excluye servicios del usuario actual (marketplace de "otros")
   *
   * @param {Object} filters - { q, category, excludeOwnerId? }
   */
  static async getAllServices({ q, category, excludeOwnerId } = {}) {
    const where = {}

    if (category) {
      where.category = category
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } }
      ]
    }

    // ✅ Sprint 4: excluir servicios usados en trades COMPLETED (sin migración extra)
    const completedTrades = await prisma.tradeProposal.findMany({
      where: { status: "COMPLETED" },
      select: { proposerServiceId: true, receiverServiceId: true }
    })

    const usedServiceIds = Array.from(
      new Set(
        completedTrades
          .flatMap((t) => [t.proposerServiceId, t.receiverServiceId])
          .filter(Boolean)
      )
    )

    if (usedServiceIds.length > 0) {
      // NOT es limpio y evita pisar otros filtros
      where.NOT = { id: { in: usedServiceIds } }
    }

    // Hardening: si está autenticado, no le muestres sus propios servicios en marketplace
    if (excludeOwnerId) {
      where.ownerId = { not: excludeOwnerId }
    }

    const services = await prisma.serviceListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, createdAt: true } }
      }
    })

    return services
  }

  /**
   * Get a single service by ID
   * @param {string} id
   */
  static async getServiceById(id) {
    const service = await prisma.serviceListing.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, createdAt: true } }
      }
    })

    if (!service) {
      const error = new Error("Service not found")
      error.statusCode = 404
      throw error
    }

    return service
  }

  /**
   * Update a service listing (owner only)
   */
  static async updateService(userId, serviceId, { title, description, category }) {
    const service = await prisma.serviceListing.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      const error = new Error("Service not found")
      error.statusCode = 404
      throw error
    }

    if (service.ownerId !== userId) {
      const error = new Error("Not authorized to update this service")
      error.statusCode = 403
      throw error
    }

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category

    if (Object.keys(updateData).length === 0) {
      const err = new Error("No valid fields to update")
      err.statusCode = 400
      throw err
    }

    const updatedService = await prisma.serviceListing.update({
      where: { id: serviceId },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true } }
      }
    })

    return updatedService
  }

  /**
   * Delete a service listing (owner only) — HARD DELETE (Opción A)
   */
  static async deleteService(userId, serviceId) {
    const service = await prisma.serviceListing.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      const error = new Error("Service not found")
      error.statusCode = 404
      throw error
    }

    if (service.ownerId !== userId) {
      const error = new Error("Not authorized to delete this service")
      error.statusCode = 403
      throw error
    }

    await prisma.serviceListing.delete({
      where: { id: serviceId }
    })

    return { success: true, message: "Service deleted successfully" }
  }
}

module.exports = ServiceListingService