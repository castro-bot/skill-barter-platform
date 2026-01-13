// backend/src/services/tradeService.js
const prisma = require('../core/db');
const { appEmitter, EVENTS } = require('../core/events');

class TradeService {

  /**
   * Crear una propuesta de trueque
   */
  static async createTrade(proposerId, { proposerServiceId, receiverServiceId }) {
    // 1. Validaciones previas (Evitar auto-trueque)
    const receiverService = await prisma.serviceListing.findUnique({
      where: { id: receiverServiceId },
      include: { owner: true } // Necesitamos saber quién es el dueño
    });

    if (!receiverService) throw new Error('Servicio solicitado no encontrado');
    if (receiverService.ownerId === proposerId) throw new Error('No puedes comerciar contigo mismo');

    const proposerService = await prisma.serviceListing.findUnique({
      where: { id: proposerServiceId }
    });

    if (!proposerService) throw new Error('Tu servicio ofertado no existe');
    if (proposerService.ownerId !== proposerId) throw new Error('No eres dueño del servicio que ofreces');

    // 2. Crear el trueque
    const trade = await prisma.tradeProposal.create({
      data: {
        proposerId,
        receiverId: receiverService.ownerId,
        proposerServiceId,
        receiverServiceId,
        status: 'PENDING'
      }
    });

    // 3. PATRÓN OBSERVER: Emitir evento
    // Obtenemos el nombre del proponente para el mensaje
    const proposer = await prisma.user.findUnique({ where: { id: proposerId } });
    appEmitter.emit(EVENTS.TRADE_CREATED, { trade, proposerName: proposer.name });

    return trade;
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
      orderBy: { createdAt: 'desc' }
    });

    const outgoing = await prisma.tradeProposal.findMany({
      where: { proposerId: userId },
      include: {
        receiver: { select: { name: true } },
        proposerService: { select: { title: true } },
        receiverService: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { incoming, outgoing };
  }

  /**
   * Responder a un trueque (Aceptar/Rechazar)
   */
  static async respondTrade(userId, tradeId, action) {
    const trade = await prisma.tradeProposal.findUnique({ where: { id: tradeId } });
    if (!trade) throw new Error('Trueque no encontrado');

    // Solo el receptor puede responder
    if (trade.receiverId !== userId) throw new Error('No tienes permiso para responder este trueque');
    if (trade.status !== 'PENDING') throw new Error('El trueque ya ha sido procesado');

    const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';

    const updatedTrade = await prisma.tradeProposal.update({
      where: { id: tradeId },
      data: { status: newStatus }
    });

    // PATRÓN OBSERVER
    if (newStatus === 'ACCEPTED') {
      const receiver = await prisma.user.findUnique({ where: { id: userId } });
      appEmitter.emit(EVENTS.TRADE_ACCEPTED, { trade: updatedTrade, receiverName: receiver.name });
    } else {
      appEmitter.emit(EVENTS.TRADE_REJECTED, { trade: updatedTrade });
    }

    return updatedTrade;
  }

  /**
   * Completar un trueque
   */
  static async completeTrade(userId, tradeId) {
    const trade = await prisma.tradeProposal.findUnique({ where: { id: tradeId } });
    if (!trade) throw new Error('Trueque no encontrado');

    // Solo participantes pueden completar
    if (trade.proposerId !== userId && trade.receiverId !== userId) {
      throw new Error('No eres participante de este trueque');
    }

    if (trade.status !== 'ACCEPTED') throw new Error('Solo trueques aceptados pueden completarse');

    const updatedTrade = await prisma.tradeProposal.update({
      where: { id: tradeId },
      data: { status: 'COMPLETED' }
    });

    // PATRÓN OBSERVER
    appEmitter.emit(EVENTS.TRADE_COMPLETED, { trade: updatedTrade, completerId: userId });

    return updatedTrade;
  }
}

module.exports = TradeService;