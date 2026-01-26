// backend/src/services/serviceListingService.js
const prisma = require("../core/db")

/**
 * Service for managing ServiceListings.
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
        // isActive tiene default true en el schema, no hace falta setearlo aquí
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
   * Sprint 4 / ERS:
   * - SOLO isActive: true (catálogo público)
   * - Excluye servicios involucrados en trades COMPLETED
   * - Opcional: excluye servicios del usuario actual (marketplace de "otros")
   *
   * @param {Object} filters - { q, category, excludeOwnerId? }
   */
  static async getAllServices({ q, category, excludeOwnerId } = {}) {
    const where = {
      isActive: true
    }

    if (category) {
      where.category = category
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } }
      ]
    }

    // Excluir servicios usados en trades COMPLETED
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
      // NOT es más limpio que AND para este caso
      where.NOT = { id: { in: usedServiceIds } }
    }

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
   * Get a single active service by ID
   * @param {string} id
   */
  static async getServiceById(id) {
    // Importante: findFirst permite filtrar por isActive junto con id
    const service = await prisma.serviceListing.findFirst({
      where: { id, isActive: true },
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

    if (!service || service.isActive === false) {
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
   * Soft delete a service listing (owner only)
   * - isActive = false
   * - deactivatedAt = now
   */
  static async deleteService(userId, serviceId) {
    const service = await prisma.serviceListing.findUnique({
      where: { id: serviceId }
    })

    if (!service || service.isActive === false) {
      const error = new Error("Service not found")
      error.statusCode = 404
      throw error
    }

    if (service.ownerId !== userId) {
      const error = new Error("Not authorized to delete this service")
      error.statusCode = 403
      throw error
    }

    await prisma.serviceListing.update({
      where: { id: serviceId },
      data: {
        isActive: false,
        deactivatedAt: new Date()
      }
    })

    return { success: true, message: "Service deleted successfully" }
  }
}

module.exports = ServiceListingService