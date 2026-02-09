// backend/src/api/ratingRoutes.js
const express = require("express")
const router = express.Router()
const authenticate = require("../middleware/authMiddleware")
const RatingService = require("../services/ratingService")
const { TAGS_BY_SCORE, MAX_COMMENT_LENGTH, MAX_TAGS } = require("../constants/ratingConstants")

// GET /api/v1/ratings/meta
router.get("/meta", (_req, res) => {
  return res.status(200).json({
    tagsByScore: TAGS_BY_SCORE,
    maxTags: MAX_TAGS,
    maxCommentLength: MAX_COMMENT_LENGTH
  })
})

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
