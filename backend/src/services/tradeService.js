// backend/src/services/tradeService.js
const prisma = require("../core/db")
const { appEmitter, EVENTS } = require("../core/events")
const AppError = require("../utils/AppError")

class TradeService {
  /**
   * Crear una propuesta de trueque
   */
  static async createTrade(proposerId, { proposerServiceId, receiverServiceId }) {
    // 1) Validaciones previas (Evitar auto-trueque)
    const receiverService = await prisma.serviceListing.findUnique({
      where: { id: receiverServiceId },
      include: { owner: true }
    })

    // 404: servicio destino no existe
    if (!receiverService) throw new AppError("Servicio solicitado no encontrado", 404)

    // 400: regla de negocio
    if (receiverService.ownerId === proposerId) throw new AppError("No puedes comerciar contigo mismo", 400)

    const proposerService = await prisma.serviceListing.findUnique({
      where: { id: proposerServiceId }
    })

    // 404: servicio ofertado no existe
    if (!proposerService) throw new AppError("Tu servicio ofertado no encontrado", 404)

    // 403: no es dueño del servicio ofertado
    if (proposerService.ownerId !== proposerId) {
      throw new AppError("No eres dueño del servicio que ofreces", 403)
    }

    // 2) Crear el trueque
    const trade = await prisma.tradeProposal.create({
      data: {
        proposerId,
        receiverId: receiverService.ownerId,
        proposerServiceId,
        receiverServiceId,
        status: "PENDING"
      }
    })

    // 3) OBSERVER: Emitir evento (notificación)
    const proposer = await prisma.user.findUnique({ where: { id: proposerId } })
    appEmitter.emit(EVENTS.TRADE_CREATED, { trade, proposerName: proposer?.name ?? "Usuario" })

    return trade
  }

  /**
   * Obtener trueques (entrantes y salientes)
   */
  static async getTrades(userId) {
    const incoming = await prisma.tradeProposal.findMany({
      where: { receiverId: userId },
      include: {
        proposer: { select: { name: true } },
        proposerService: { select: { title: true } },
        receiverService: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    const outgoing = await prisma.tradeProposal.findMany({
      where: { proposerId: userId },
      include: {
        receiver: { select: { name: true } },
        proposerService: { select: { title: true } },
        receiverService: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return { incoming, outgoing }
  }

  /**
   * Responder a un trueque (Aceptar/Rechazar)
   */
  static async respondTrade(userId, tradeId, action) {
    // 400: action inválida
    if (!["accept", "reject"].includes(action)) {
      throw new AppError("Acción inválida. Usa 'accept' o 'reject'.", 400)
    }

    const trade = await prisma.tradeProposal.findUnique({ where: { id: tradeId } })
    if (!trade) throw new AppError("Trueque no encontrado", 404)

    // Solo el receptor puede responder
    if (trade.receiverId !== userId) {
      throw new AppError("No tienes permiso para responder este trueque", 403)
    }

    // 409: conflicto de estado (respondido previamente)
    if (trade.status !== "PENDING") {
      throw new AppError("El trueque ya ha sido procesado", 409)
    }

    const newStatus = action === "accept" ? "ACCEPTED" : "REJECTED"

    const updatedTrade = await prisma.tradeProposal.update({
      where: { id: tradeId },
      data: { status: newStatus }
    })

    // OBSERVER
    if (newStatus === "ACCEPTED") {
      const receiver = await prisma.user.findUnique({ where: { id: userId } })
      appEmitter.emit(EVENTS.TRADE_ACCEPTED, { trade: updatedTrade, receiverName: receiver?.name ?? "Usuario" })
    } else {
      appEmitter.emit(EVENTS.TRADE_REJECTED, { trade: updatedTrade })
    }

    return updatedTrade
  }

  /**
   * Completar un trueque
   */
  static async completeTrade(userId, tradeId) {
    const trade = await prisma.tradeProposal.findUnique({ where: { id: tradeId } })
    if (!trade) throw new AppError("Trueque no encontrado", 404)

    // Solo participantes pueden completar
    if (trade.proposerId !== userId && trade.receiverId !== userId) {
      throw new AppError("No eres participante de este trueque", 403)
    }

    // 409: conflicto de estado
    if (trade.status !== "ACCEPTED") {
      throw new AppError("Solo trueques aceptados pueden completarse", 409)
    }

    const updatedTrade = await prisma.tradeProposal.update({
      where: { id: tradeId },
      data: { status: "COMPLETED" }
    })

    // OBSERVER
    appEmitter.emit(EVENTS.TRADE_COMPLETED, { trade: updatedTrade, completerId: userId })

    return updatedTrade
  }
}

module.exports = TradeService