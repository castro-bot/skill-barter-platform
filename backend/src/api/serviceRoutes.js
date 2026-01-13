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

module.exports = router;