// backend/src/api/tradeRoutes.js
const express = require("express")
const router = express.Router()
const TradeService = require("../services/tradeService")
const authenticate = require("../middleware/authMiddleware")

// Todas las rutas de trueques requieren autenticación
router.use(authenticate)

// 1) Proponer
router.post("/", async (req, res, next) => {
  try {
    const { proposerServiceId, receiverServiceId, note } = req.body
    const trade = await TradeService.createTrade(req.user.id, {
      proposerServiceId,
      receiverServiceId,
      note
    })
    return res.status(201).json(trade)
  } catch (error) {
    next(error)
  }
})

// 2) Obtener mis trueques
router.get("/", async (req, res, next) => {
  try {
    const trades = await TradeService.getTrades(req.user.id)
    return res.json(trades)
  } catch (error) {
    next(error)
  }
})

// 3) Responder (Aceptar/Rechazar)
router.put("/:id/respond", async (req, res, next) => {
  try {
    const { action, contactWhatsapp } = req.body // 'accept' or 'reject'
    // Puedes dejar esta validación aquí por UX, aunque ya se valida en el service
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ success: false, error: "Action must be 'accept' or 'reject'" })
    }

    const trade = await TradeService.respondTrade(req.user.id, req.params.id, action, { contactWhatsapp })
    return res.json(trade)
  } catch (error) {
    next(error)
  }
})

// 4) Completar
router.put("/:id/complete", async (req, res, next) => {
  try {
    const trade = await TradeService.completeTrade(req.user.id, req.params.id)
    return res.json(trade)
  } catch (error) {
    next(error)
  }
})

module.exports = router
