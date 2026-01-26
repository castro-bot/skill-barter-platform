// backend/src/services/serviceListingService.js
const prisma = require('../core/db');

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
    // 1. Basic Validation
    if (!title || !description || !category) {
      throw new Error('Title, description, and category are required');
    }

    // 2. Persist to DB
    const service = await prisma.serviceListing.create({
      data: {
        title,
        description,
        category,
        ownerId: userId
      },
      // Include owner info to match API Contract return shape immediately
      include: {
        owner: {
          select: { id: true, name: true }
        }
      }
    });

    return service;
  }

  /**
   * Get all services with optional filters
   * Sprint 4 (SIN Prisma migration):
   * - Excluye servicios involucrados en trades COMPLETED
   * - Opcional: excluye servicios del usuario actual si se provee excludeOwnerId
   *
   * @param {Object} filters - { q, category, excludeOwnerId? }
   */
  static async getAllServices({ q, category, excludeOwnerId } = {}) {
    const where = {};

    // Filtro por categoría
    if (category) {
      where.category = category;
    }

    // Búsqueda por texto
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    // ✅ Sprint 4: excluir servicios usados en trades COMPLETED
    const completedTrades = await prisma.tradeProposal.findMany({
      where: { status: 'COMPLETED' },
      select: {
        proposerServiceId: true,
        receiverServiceId: true
      }
    });

    const usedServiceIds = Array.from(
      new Set(
        completedTrades
          .flatMap((t) => [t.proposerServiceId, t.receiverServiceId])
          .filter(Boolean)
      )
    );

    if (usedServiceIds.length > 0) {
      where.id = { notIn: usedServiceIds };
    }

    // Hardening: excluir servicios propios si se conoce al usuario
    if (excludeOwnerId) {
      where.ownerId = { not: excludeOwnerId };
    }

    const services = await prisma.serviceListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, name: true, createdAt: true }
        }
      }
    });

    return services;
  }

  /**
   * Get a single service by ID
   * @param {string} id
   */
  static async getServiceById(id) {
    const service = await prisma.serviceListing.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, createdAt: true }
        }
      }
    });

    if (!service) {
      const error = new Error('Service not found');
      error.statusCode = 404;
      throw error;
    }

    return service;
  }

  /**
   * Update a service listing
   * @param {string} userId - ID of the user making the request
   * @param {string} serviceId - ID of the service to update
   * @param {Object} data - { title?, description?, category? }
   */
  static async updateService(userId, serviceId, { title, description, category }) {
    // 1. Find the service
    const service = await prisma.serviceListing.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      const error = new Error('Service not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Verify ownership
    if (service.ownerId !== userId) {
      const error = new Error('Not authorized to update this service');
      error.statusCode = 403;
      throw error;
    }

    // 3. Build update object dynamically (DRY principle)
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    // 4. Update
    const updatedService = await prisma.serviceListing.update({
      where: { id: serviceId },
      data: updateData,
      include: {
        owner: {
          select: { id: true, name: true }
        }
      }
    });

    return updatedService;
  }

  /**
   * Delete a service listing
   * @param {string} userId - ID of the user making the request
   * @param {string} serviceId - ID of the service to delete
   */
  static async deleteService(userId, serviceId) {
    // 1. Find the service
    const service = await prisma.serviceListing.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      const error = new Error('Service not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Verify ownership
    if (service.ownerId !== userId) {
      const error = new Error('Not authorized to delete this service');
      error.statusCode = 403;
      throw error;
    }

    // 3. Delete
    await prisma.serviceListing.delete({
      where: { id: serviceId }
    });

    return { success: true, message: 'Service deleted successfully' };
  }
}

module.exports = ServiceListingService;