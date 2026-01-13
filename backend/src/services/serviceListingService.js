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
        ownerId: userId,
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
   * @param {Object} filters - { q, category }
   */
  static async getAllServices({ q, category }) {
    // Build the query object dynamically
    const where = {};

    // Guideline #1: DRY - Build complex queries cleanly
    if (category) {
      where.category = category;
    }

    if (q) {
      // Search in title OR description (case insensitive)
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
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
      // Guideline #9: Use specific errors
      const error = new Error('Service not found');
      error.statusCode = 404; // Used by our Error Middleware
      throw error;
    }

    return service;
  }
}

module.exports = ServiceListingService;