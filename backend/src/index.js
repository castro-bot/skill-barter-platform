/**
 * Application Entry Point
 * Wires together Routes, Middleware, and Database.
 */
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const config = require("./config/env")
const errorHandler = require("./middleware/errorMiddleware")

const authRoutes = require("./api/authRoutes")
const serviceRoutes = require("./api/serviceRoutes")
const tradeRoutes = require("./api/tradeRoutes")
const notificationRoutes = require("./api/notificationRoutes")
const ratingRoutes = require("./api/ratingRoutes")
const userRoutes = require("./api/userRoutes")
const setupNotificationListeners = require("./listeners/notificationListener")

const app = express()
setupNotificationListeners()
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
)

app.use(express.json())
app.use(cookieParser())
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/services", serviceRoutes)
app.use("/api/v1/trades", tradeRoutes)
app.use("/api/v1/ratings", ratingRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/notifications", notificationRoutes)
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "SkillBarter API" })
})
app.use(errorHandler)
app.listen(config.PORT, () => {
  console.log(`✅ Server running on http://localhost:${config.PORT}`)
  console.log(`Example: http://localhost:${config.PORT}/api/v1/health`)
})
