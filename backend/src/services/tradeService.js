// backend/src/services/tradeService.js
const prisma = require("../core/db")
const { appEmitter, EVENTS } = require("../core/events")
const AppError = require("../utils/AppError")

const WHATSAPP_REGEX = /^(?:\+5939\d{8}|09\d{8})$/

const normalizeWhatsapp = (value) => {
  const raw = String(value ?? "").trim()
  if (!raw) return ""
  const hasPlus = raw.startsWith("+")
  const digits = raw.replace(/\D/g, "")
  return hasPlus ? `+${digits}` : digits
}

class TradeService {
  /**
   * Create a trade proposal
   */
  static async createTrade(proposerId, { proposerServiceId, receiverServiceId, note }) {
    // Prevent duplicate pending proposals using the same service from the same user
    const pendingDuplicate = await prisma.tradeProposal.findFirst({
      where: {
        proposerId,
        proposerServiceId,
        status: "PENDING"
      },
      select: { id: true }
    })

    if (pendingDuplicate) {
      throw new AppError(
        "No se puede solicitar trueque porque ya se solicitó con este servicio y está pendiente de respuesta.",
        409
      )
    }

    const receiverService = await prisma.serviceListing.findUnique({
      where: { id: receiverServiceId },
      include: { owner: true }
    })

    if (!receiverService) throw new AppError("Servicio solicitado no encontrado", 404)

    if (receiverService.ownerId === proposerId) throw new AppError("No puedes comerciar contigo mismo", 400)

    const proposerService = await prisma.serviceListing.findUnique({
      where: { id: proposerServiceId }
    })

    if (!proposerService) throw new AppError("Tu servicio ofertado no encontrado", 404)

    if (proposerService.ownerId !== proposerId) {
      throw new AppError("No eres duenio del servicio que ofreces", 403)
    }

    const trimmedNote = note !== undefined && note !== null ? String(note).trim() : null

    const trade = await prisma.tradeProposal.create({
      data: {
        proposerId,
        receiverId: receiverService.ownerId,
        proposerServiceId,
        receiverServiceId,
        status: "PENDING",
        note: trimmedNote && trimmedNote.length > 0 ? trimmedNote : null
      }
    })

    const proposer = await prisma.user.findUnique({ where: { id: proposerId } })
    appEmitter.emit(EVENTS.TRADE_CREATED, { trade, proposerName: proposer?.name ?? "Usuario" })

    return trade
  }

  /**
   * Get trades (incoming and outgoing)
   */
  static async getTrades(userId) {
    const incoming = await prisma.tradeProposal.findMany({
      where: { receiverId: userId },
      include: {
        proposer: { select: { name: true } },
        proposerService: { select: { title: true } },
        receiverService: { select: { title: true } },
        ratings: { where: { raterId: userId }, select: { id: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    const outgoing = await prisma.tradeProposal.findMany({
      where: { proposerId: userId },
      include: {
        receiver: { select: { name: true } },
        proposerService: { select: { title: true } },
        receiverService: { select: { title: true } },
        ratings: { where: { raterId: userId }, select: { id: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    const mapTrade = (trade) => {
      const hasRated = Array.isArray(trade.ratings) && trade.ratings.length > 0
      const { ratings, contactWhatsapp, ...rest } = trade
      const canShowContact = trade.status === "ACCEPTED" || trade.status === "COMPLETED"
      return {
        ...rest,
        hasRated,
        contactWhatsapp: canShowContact ? contactWhatsapp : undefined
      }
    }

    return {
      incoming: incoming.map(mapTrade),
      outgoing: outgoing.map(mapTrade)
    }
  }

  /**
   * Respond to a trade (accept/reject)
   */
  static async respondTrade(userId, tradeId, action, { contactWhatsapp } = {}) {
    if (!["accept", "reject"].includes(action)) {
      throw new AppError("Accion invalida. Usa 'accept' o 'reject'.", 400)
    }

    const trade = await prisma.tradeProposal.findUnique({ where: { id: tradeId } })
    if (!trade) throw new AppError("Trueque no encontrado", 404)

    if (trade.receiverId !== userId) {
      throw new AppError("No tienes permiso para responder este trueque", 403)
    }

    if (trade.status !== "PENDING") {
      throw new AppError("El trueque ya ha sido procesado", 409)
    }

    const newStatus = action === "accept" ? "ACCEPTED" : "REJECTED"
    let whatsappValue = null

    if (action === "accept") {
      const normalizedWhatsapp = normalizeWhatsapp(contactWhatsapp)
      if (!normalizedWhatsapp) {
        throw new AppError("El numero de WhatsApp es obligatorio para aceptar el trueque", 400)
      }
      if (!WHATSAPP_REGEX.test(normalizedWhatsapp)) {
        throw new AppError("Numero de WhatsApp invalido. Usa +5939XXXXXXXX o 09XXXXXXXX", 400)
      }
      whatsappValue = normalizedWhatsapp
    }

    const updatedTrade = await prisma.tradeProposal.update({
      where: { id: tradeId },
      data: {
        status: newStatus,
        ...(action === "accept" ? { contactWhatsapp: whatsappValue } : {})
      }
    })

    if (newStatus === "ACCEPTED") {
      const receiver = await prisma.user.findUnique({ where: { id: userId } })
      appEmitter.emit(EVENTS.TRADE_ACCEPTED, { trade: updatedTrade, receiverName: receiver?.name ?? "Usuario" })
    } else {
      appEmitter.emit(EVENTS.TRADE_REJECTED, { trade: updatedTrade })
    }

    return updatedTrade
  }

  /**
   * Complete a trade
   */
  static async completeTrade(userId, tradeId) {
    const trade = await prisma.tradeProposal.findUnique({ where: { id: tradeId } })
    if (!trade) throw new AppError("Trueque no encontrado", 404)

    if (trade.proposerId !== userId && trade.receiverId !== userId) {
      throw new AppError("No eres participante de este trueque", 403)
    }

    if (trade.status !== "ACCEPTED") {
      throw new AppError("Solo trueques aceptados pueden completarse", 409)
    }

    const updatedTrade = await prisma.tradeProposal.update({
      where: { id: tradeId },
      data: { status: "COMPLETED" }
    })

    appEmitter.emit(EVENTS.TRADE_COMPLETED, { trade: updatedTrade, completerId: userId })

    return updatedTrade
  }
}

module.exports = TradeService
