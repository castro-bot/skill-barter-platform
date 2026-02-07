// backend/src/services/ratingService.js
const prisma = require("../core/db")
const { appEmitter, EVENTS } = require("../core/events")
const AppError = require("../utils/AppError")
const { TAGS_BY_SCORE, MAX_COMMENT_LENGTH, MAX_TAGS } = require("../constants/ratingConstants")

const normalizeTags = (tags, score) => {
  if (tags === undefined || tags === null) return []
  if (!Array.isArray(tags)) {
    throw new AppError("tags must be an array", 400)
  }

  const allowed = new Set(TAGS_BY_SCORE[score] || [])
  const normalized = tags
    .map((tag) => String(tag).trim())
    .filter((tag) => tag.length > 0)

  const unique = Array.from(new Set(normalized))

  const invalid = unique.find((tag) => !allowed.has(tag))
  if (invalid) {
    throw new AppError("Invalid tag selection", 400)
  }

  return unique.slice(0, MAX_TAGS)
}

class RatingService {
  static async createRating(userId, { tradeId, score, comment, tags }) {
    if (!tradeId) throw new AppError("tradeId is required", 400)

    const numericScore = Number(score)
    if (!Number.isInteger(numericScore) || numericScore < 1 || numericScore > 5) {
      throw new AppError("score must be an integer between 1 and 5", 400)
    }

    const trimmedComment = comment !== undefined && comment !== null ? String(comment).trim() : ""
    if (trimmedComment.length > MAX_COMMENT_LENGTH) {
      throw new AppError("comment is too long", 400)
    }

    const normalizedTags = normalizeTags(tags, numericScore)

    const result = await prisma.$transaction(async (tx) => {
      const trade = await tx.tradeProposal.findUnique({ where: { id: tradeId } })
      if (!trade) throw new AppError("Trade not found", 404)

      if (trade.status !== "COMPLETED") {
        throw new AppError("Trade must be completed before rating", 409)
      }

      const isParticipant = trade.proposerId === userId || trade.receiverId === userId
      if (!isParticipant) {
        throw new AppError("You are not a participant of this trade", 403)
      }

      const existing = await tx.rating.findUnique({
        where: { tradeId_raterId: { tradeId, raterId: userId } }
      })
      if (existing) {
        throw new AppError("You already rated this trade", 409)
      }

      const rateeId = trade.proposerId === userId ? trade.receiverId : trade.proposerId

      const created = await tx.rating.create({
        data: {
          tradeId,
          raterId: userId,
          rateeId,
          score: numericScore,
          comment: trimmedComment.length > 0 ? trimmedComment : null,
          tags: normalizedTags
        }
      })

      const stats = await tx.rating.aggregate({
        where: { rateeId },
        _avg: { score: true },
        _count: { _all: true }
      })

      await tx.user.update({
        where: { id: rateeId },
        data: {
          ratingAverage: stats._avg.score || 0,
          ratingCount: stats._count._all
        }
      })

      return created
    })

    appEmitter.emit(EVENTS.RATING_CREATED, { rating: result })

    return result
  }

  static async getUserRatings(userId, { limit = 10, offset = 0 } = {}) {
    const take = Math.min(Math.max(Number(limit) || 10, 1), 50)
    const skip = Math.max(Number(offset) || 0, 0)

    const ratings = await prisma.rating.findMany({
      where: { rateeId: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        score: true,
        comment: true,
        tags: true,
        createdAt: true,
        tradeId: true,
        rater: { select: { id: true, name: true } }
      }
    })

    return ratings
  }

  static async getUserRatingSummary(userId) {
    const stats = await prisma.rating.aggregate({
      where: { rateeId: userId },
      _avg: { score: true },
      _count: { _all: true }
    })

    return {
      average: stats._avg.score || 0,
      count: stats._count._all
    }
  }
}

module.exports = RatingService
