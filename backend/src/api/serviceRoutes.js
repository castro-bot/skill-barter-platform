// backend/src/api/serviceRoutes.js
const express = require('express');
const router = express.Router();
const ServiceListingService = require('../services/serviceListingService');
const authenticate = require('../middleware/authMiddleware'); // The Gatekeeper

/**
 * GET /api/v1/services
 * Public - Get all services (with search)
 */
router.get('/', async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const services = await ServiceListingService.getAllServices({ q, category });
    res.json(services);
  } catch (error) {
    next(error); // Pass to global error handler
  }
});

/**
 * GET /api/v1/services/:id
 * Public - Get one service
 */
router.get('/:id', async (req, res, next) => {
  try {
    const service = await ServiceListingService.getServiceById(req.params.id);
    res.json(service);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/services
 * Protected - Create a new service
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    // req.user.id comes from the authenticate middleware
    const newService = await ServiceListingService.createService(req.user.id, req.body);
    res.status(201).json(newService);
  } catch (error) {
    if (error.message.includes('required')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PUT /api/v1/services/:id
 * Protected - Update a service (owner only)
 */
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const updatedService = await ServiceListingService.updateService(
      req.user.id,
      req.params.id,
      { title, description, category }
    );
    res.json(updatedService);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (error.message === 'No valid fields to update') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * DELETE /api/v1/services/:id
 * Protected - Delete a service (owner only)
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await ServiceListingService.deleteService(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;