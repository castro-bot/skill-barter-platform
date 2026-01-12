const { appEmitter, EVENTS } = require('../core/events');
const prisma = require('../core/db');

/**
 * Notification Listener
 * Responsabilidad: Reaccionar a eventos de negocio y persistir notificaciones.
 */
const setupNotificationListeners = () => {

  // Caso 1: Nueva propuesta -> Notificar al receptor
  appEmitter.on(EVENTS.TRADE_CREATED, async ({ trade, proposerName }) => {
    try {
      await prisma.notification.create({
        data: {
          userId: trade.receiverId, // El dueño del servicio deseado
          type: 'TRADE_PROPOSAL',
          message: `${proposerName} ha propuesto un trueque por tu servicio.`,
          tradeId: trade.id,
        },
      });
      console.log(`[Observer] Notificación creada para User ${trade.receiverId}`);
    } catch (error) {
      console.error('[Observer Error]', error);
    }
  });

  // Caso 2: Propuesta aceptada -> Notificar al proponente original
  appEmitter.on(EVENTS.TRADE_ACCEPTED, async ({ trade, receiverName }) => {
    try {
      await prisma.notification.create({
        data: {
          userId: trade.proposerId,
          type: 'TRADE_ACCEPTED',
          message: `${receiverName} aceptó tu propuesta de trueque!`,
          tradeId: trade.id,
        },
      });
    } catch (error) {
      console.error('[Observer Error]', error);
    }
  });

  // Caso 3: Trueque completado -> Notificar a la contraparte
  appEmitter.on(EVENTS.TRADE_COMPLETED, async ({ trade, completerId }) => {
    try {
      // Notificar a la persona que NO completó la acción
      const targetUserId = completerId === trade.proposerId ? trade.receiverId : trade.proposerId;

      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: 'TRADE_COMPLETED',
          message: `El trueque ha sido marcado como completado.`,
          tradeId: trade.id,
        },
      });
    } catch (error) {
      console.error('[Observer Error]', error);
    }
  });
};

module.exports = setupNotificationListeners;