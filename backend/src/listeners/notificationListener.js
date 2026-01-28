// backend/src/listeners/notificationListener.js
const { appEmitter, EVENTS } = require("../core/events")
const prisma = require("../core/db")

/**
 * Notification Listener (Observer)
 * Responsibility: react to business events and persist notifications.
 */
const setupNotificationListeners = () => {
  console.log("[Observer] Notification listeners registered")

  // 1) New proposal -> notify receiver
  appEmitter.on(EVENTS.TRADE_CREATED, async ({ trade, proposerName }) => {
    try {
      if (!trade?.id || !trade?.receiverId) return

      await prisma.notification.create({
        data: {
          userId: trade.receiverId,
          type: "TRADE_PROPOSAL",
          message: `${proposerName ?? "Usuario"} ha propuesto un trueque por tu servicio.`,
          tradeId: trade.id
        }
      })

      console.log(`[Observer] TRADE_CREATED -> Notification for user ${trade.receiverId} (trade ${trade.id})`)
    } catch (error) {
      console.error("[Observer Error][TRADE_CREATED]", error)
    }
  })

  // 2) Proposal accepted -> notify proposer
  appEmitter.on(EVENTS.TRADE_ACCEPTED, async ({ trade, receiverName }) => {
    try {
      if (!trade?.id || !trade?.proposerId) return

      await prisma.notification.create({
        data: {
          userId: trade.proposerId,
          type: "TRADE_ACCEPTED",
          message: `${receiverName ?? "Usuario"} acepto tu propuesta de trueque!`,
          tradeId: trade.id
        }
      })

      console.log(`[Observer] TRADE_ACCEPTED -> Notification for user ${trade.proposerId} (trade ${trade.id})`)
    } catch (error) {
      console.error("[Observer Error][TRADE_ACCEPTED]", error)
    }
  })

  // 3) Proposal rejected -> notify proposer (optional)
  appEmitter.on(EVENTS.TRADE_REJECTED, async ({ trade }) => {
    try {
      if (!trade?.id || !trade?.proposerId) return

      await prisma.notification.create({
        data: {
          userId: trade.proposerId,
          type: "TRADE_REJECTED",
          message: "Tu propuesta de trueque fue rechazada.",
          tradeId: trade.id
        }
      })

      console.log(`[Observer] TRADE_REJECTED -> Notification for user ${trade.proposerId} (trade ${trade.id})`)
    } catch (error) {
      console.error("[Observer Error][TRADE_REJECTED]", error)
    }
  })

  // 4) Trade completed -> notify both participants to rate
  appEmitter.on(EVENTS.TRADE_COMPLETED, async ({ trade }) => {
    try {
      if (!trade?.id || !trade?.proposerId || !trade?.receiverId) return

      const targets = [trade.proposerId, trade.receiverId]

      await Promise.all(
        targets.map((userId) =>
          prisma.notification.create({
            data: {
              userId,
              type: "TRADE_COMPLETED",
              message: "El trueque fue marcado como completado. Califica a tu contraparte.",
              tradeId: trade.id
            }
          })
        )
      )

      console.log(`[Observer] TRADE_COMPLETED -> Notifications for trade ${trade.id}`)
    } catch (error) {
      console.error("[Observer Error][TRADE_COMPLETED]", error)
    }
  })

  // 5) Rating created -> notify ratee
  appEmitter.on(EVENTS.RATING_CREATED, async ({ rating }) => {
    try {
      if (!rating?.id || !rating?.rateeId) return

      await prisma.notification.create({
        data: {
          userId: rating.rateeId,
          type: "RATING_RECEIVED",
          message: "Recibiste una nueva calificacion.",
          tradeId: rating.tradeId
        }
      })

      console.log(`[Observer] RATING_CREATED -> Notification for user ${rating.rateeId} (rating ${rating.id})`)
    } catch (error) {
      console.error("[Observer Error][RATING_CREATED]", error)
    }
  })
}

module.exports = setupNotificationListeners
