// backend/src/services/serviceListingService.js
const prisma = require("../core/db")

/**
 * Service for managing ServiceListings.
 * - Excludes services involved in COMPLETED trades
 * - Optionally excludes current user's own services
 */
class ServiceListingService {
  /**
   * Create a new service listing
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
          select: { id: true, name: true, ratingAverage: true, ratingCount: true }
        }
      }
    })

    return service
  }

  /**
   * Get all services with optional filters
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

    // Exclude services used in COMPLETED trades
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
      where.NOT = { id: { in: usedServiceIds } }
    }

    if (excludeOwnerId) {
      where.ownerId = { not: excludeOwnerId }
    }

    const services = await prisma.serviceListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, createdAt: true, ratingAverage: true, ratingCount: true } }
      }
    })

    return services
  }

  /**
   * Get services owned by a user
   */
  static async getMyServices(userId) {
    if (!userId) {
      const err = new Error("User ID is required")
      err.statusCode = 400
      throw err
    }

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

    const where = { ownerId: userId }

    if (usedServiceIds.length > 0) {
      where.NOT = { id: { in: usedServiceIds } }
    }

    const services = await prisma.serviceListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, createdAt: true, ratingAverage: true, ratingCount: true } }
      }
    })

    return services
  }

  /**
   * Get a single service by ID
   */
  static async getServiceById(id) {
    const service = await prisma.serviceListing.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, createdAt: true, ratingAverage: true, ratingCount: true } }
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
        owner: { select: { id: true, name: true, ratingAverage: true, ratingCount: true } }
      }
    })

    return updatedService
  }

  /**
   * Delete a service listing (owner only) - hard delete
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
