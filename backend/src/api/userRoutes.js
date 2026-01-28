// backend/src/api/userRoutes.js
const express = require("express")
const UserService = require("../services/userService")
const RatingService = require("../services/ratingService")
const authenticate = require("../middleware/authMiddleware")

const router = express.Router()

/**
 * PUT /api/v1/users/me
 * Protected - Update own profile (name/email)
 */
router.put("/me", authenticate, async (req, res, next) => {
  try {
    const updated = await UserService.updateProfile(req.user.id, req.body)
    return res.status(200).json({ user: updated })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    return next(err)
  }
})

/**
 * PUT /api/v1/users/me/password
 * Protected - Change own password
 */
router.put("/me/password", authenticate, async (req, res, next) => {
  try {
    const result = await UserService.changePassword(req.user.id, req.body)
    return res.status(200).json(result)
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    return next(err)
  }
})

/**
 * GET /api/v1/users/:id/rating-summary
 * Public - Rating summary for user
 */
router.get("/:id/rating-summary", async (req, res, next) => {
  try {
    const summary = await RatingService.getUserRatingSummary(req.params.id)
    return res.status(200).json(summary)
  } catch (err) {
    return next(err)
  }
})

/**
 * GET /api/v1/users/:id/ratings
 * Public - Ratings received by user
 */
router.get("/:id/ratings", async (req, res, next) => {
  try {
    const { limit, offset } = req.query
    const ratings = await RatingService.getUserRatings(req.params.id, { limit, offset })
    return res.status(200).json({ ratings })
  } catch (err) {
    return next(err)
  }
})

/**
 * GET /api/v1/users/:id
 * Public profile + services
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params
    const profile = await UserService.getPublicProfile(id)
    return res.status(200).json(profile) // { user, services }
  } catch (err) {
    return next(err)
  }
})

module.exports = router
