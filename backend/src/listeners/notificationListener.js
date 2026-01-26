// backend/src/listeners/notificationListener.js
const { appEmitter, EVENTS } = require("../core/events")
const prisma = require("../core/db")

/**
 * Notification Listener (Observer)
 * Responsabilidad: Reaccionar a eventos de negocio y persistir notificaciones.
 * - Robusto ante payloads incompletos
 * - No rompe el flujo del negocio si falla la notificación
 */
const setupNotificationListeners = () => {
  console.log("[Observer] Notification listeners registered")

  /**
   * 1) Nueva propuesta -> Notificar al receptor
   */
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

      // Log opcional (útil en demo / debugging)
      console.log(`[Observer] TRADE_CREATED -> Notification for user ${trade.receiverId} (trade ${trade.id})`)
    } catch (error) {
      console.error("[Observer Error][TRADE_CREATED]", error)
    }
  })

  /**
   * 2) Propuesta aceptada -> Notificar al proponente original
   */
  appEmitter.on(EVENTS.TRADE_ACCEPTED, async ({ trade, receiverName }) => {
    try {
      if (!trade?.id || !trade?.proposerId) return

      await prisma.notification.create({
        data: {
          userId: trade.proposerId,
          type: "TRADE_ACCEPTED",
          message: `${receiverName ?? "Usuario"} aceptó tu propuesta de trueque!`,
          tradeId: trade.id
        }
      })

      console.log(`[Observer] TRADE_ACCEPTED -> Notification for user ${trade.proposerId} (trade ${trade.id})`)
    } catch (error) {
      console.error("[Observer Error][TRADE_ACCEPTED]", error)
    }
  })

  /**
   * 3) Propuesta rechazada -> (Opcional según requisitos)
   * Tu servicio emite TRADE_REJECTED. Si quieres notificar al proponente,
   * descomenta y deja este handler. Si NO lo necesitas para Sprint 3, puedes omitirlo.
   */
  appEmitter.on(EVENTS.TRADE_REJECTED, async ({ trade }) => {
    try {
      // Si no quieres notificar rechazo, puedes dejar esto vacío o removerlo.
      if (!trade?.id || !trade?.proposerId) return

      await prisma.notification.create({
        data: {
          userId: trade.proposerId,
          type: "TRADE_REJECTED",
          message: `Tu propuesta de trueque fue rechazada.`,
          tradeId: trade.id
        }
      })

      console.log(`[Observer] TRADE_REJECTED -> Notification for user ${trade.proposerId} (trade ${trade.id})`)
    } catch (error) {
      console.error("[Observer Error][TRADE_REJECTED]", error)
    }
  })

  /**
   * 4) Trueque completado -> Notificar a la contraparte
   */
  appEmitter.on(EVENTS.TRADE_COMPLETED, async ({ trade, completerId }) => {
    try {
      if (!trade?.id || !trade?.proposerId || !trade?.receiverId || !completerId) return

      const targetUserId = completerId === trade.proposerId ? trade.receiverId : trade.proposerId

      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: "TRADE_COMPLETED",
          message: `El trueque ha sido marcado como completado.`,
          tradeId: trade.id
        }
      })

      console.log(`[Observer] TRADE_COMPLETED -> Notification for user ${targetUserId} (trade ${trade.id})`)
    } catch (error) {
      console.error("[Observer Error][TRADE_COMPLETED]", error)
    }
  })
}

module.exports = setupNotificationListeners