// backend/src/api/userRoutes.js
const express = require("express")
const UserService = require("../services/userService")
const authenticate = require("../middleware/authMiddleware")

const router = express.Router()

/**
 * PUT /api/v1/users/me
 * Protected - Actualizar perfil propio (name/email)
 */
router.put("/me", authenticate, async (req, res, next) => {
  try {
    const updated = await UserService.updateProfile(req.user.id, req.body)
    return res.status(200).json({ user: updated })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    return next(err)
  }
})

/**
 * PUT /api/v1/users/me/password
 * Protected - Cambiar contraseña propia
 */
router.put("/me/password", authenticate, async (req, res, next) => {
  try {
    const result = await UserService.changePassword(req.user.id, req.body)
    return res.status(200).json(result)
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    return next(err)
  }
})

/**
 * GET /api/v1/users/:id
 * Perfil público + servicios del usuario
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params
    const profile = await UserService.getPublicProfile(id)
    return res.status(200).json(profile) // { user, services }
  } catch (err) {
    return next(err)
  }
})

module.exports = router