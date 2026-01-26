// backend/src/middleware/optionalAuthMiddleware.js
const jwt = require("jsonwebtoken")
const config = require("../config/env")

/**
 * Optional Auth Middleware
 * - Si NO hay token: deja pasar (req.user queda undefined).
 * - Si HAY token y es válido: setea req.user = { id: ... } y deja pasar.
 * - Si HAY token pero es inválido/expiró: NO bloquea, solo deja pasar sin req.user.
 */
module.exports = function optionalAuthMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next()
  }

  const token = authHeader.split(" ")[1]
  if (!token) return next()

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET)

    // Normalizamos el id del usuario (depende cómo firmaste el JWT)
    const id = decoded.sub || decoded.userId || decoded.id

    if (id) {
      req.user = { id }
      req.tokenPayload = decoded
    }
  } catch (_err) {
    // Token inválido/expirado: NO cortamos el request (es "optional")
  }

  return next()
}