// backend/src/api/ratingRoutes.js
const express = require("express")
const router = express.Router()
const authenticate = require("../middleware/authMiddleware")
const RatingService = require("../services/ratingService")

// POST /api/v1/ratings
router.post("/", authenticate, async (req, res, next) => {
  try {
    const rating = await RatingService.createRating(req.user.id, req.body)
    return res.status(201).json(rating)
  } catch (error) {
    next(error)
  }
})

module.exports = router
