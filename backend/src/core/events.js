// backend/src/core/events.js
/**
 * Event Emitter Singleton
 * Centraliza el manejo de eventos del sistema (Patrón Observer).
 */
const EventEmitter = require('events');

class AppEmitter extends EventEmitter {}

// Singleton instance
const appEmitter = new AppEmitter();

// Constantes de Eventos (Clean Code #5)
const EVENTS = {
  TRADE_CREATED: 'trade.created',
  TRADE_ACCEPTED: 'trade.accepted',
  TRADE_REJECTED: 'trade.rejected',
  TRADE_COMPLETED: 'trade.completed',
  RATING_CREATED: 'rating.created',
};

module.exports = {
  appEmitter,
  EVENTS,
};
