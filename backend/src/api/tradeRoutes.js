// backend/src/api/tradeRoutes.js
const express = require('express');
const router = express.Router();
const TradeService = require('../services/tradeService');
const authenticate = require('../middleware/authMiddleware');

// Todas las rutas de trueques requieren autenticación
router.use(authenticate);

// 1. Proponer
router.post('/', async (req, res, next) => {
  try {
    const { proposerServiceId, receiverServiceId } = req.body;
    const trade = await TradeService.createTrade(req.user.id, { proposerServiceId, receiverServiceId });
    res.status(201).json(trade);
  } catch (error) {
    // Manejo de errores de negocio como 400
    if (error.message.includes('No puedes') || error.message.includes('no existe')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// 2. Obtener mis trueques
router.get('/', async (req, res, next) => {
  try {
    const trades = await TradeService.getTrades(req.user.id);
    res.json(trades);
  } catch (error) {
    next(error);
  }
});

// 3. Responder (Aceptar/Rechazar)
router.put('/:id/respond', async (req, res, next) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: "Action must be 'accept' or 'reject'" });
    }
    const trade = await TradeService.respondTrade(req.user.id, req.params.id, action);
    res.json(trade);
  } catch (error) {
    if (error.message.includes('permiso') || error.message.includes('procesado')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
});

// 4. Completar
router.put('/:id/complete', async (req, res, next) => {
  try {
    const trade = await TradeService.completeTrade(req.user.id, req.params.id);
    res.json(trade);
  } catch (error) {
    if (error.message.includes('participante')) return res.status(403).json({ error: error.message });
    if (error.message.includes('Solo trueques')) return res.status(400).json({ error: error.message });
    next(error);
  }
});

module.exports = router;