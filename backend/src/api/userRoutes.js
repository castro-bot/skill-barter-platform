// backend/src/api/userRoutes.js
const express = require("express")
const UserService = require("../services/userService")

const router = express.Router()

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