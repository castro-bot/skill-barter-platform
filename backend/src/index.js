// backend/src/index.js
/**
 * Application Entry Point
 * Wires together Routes, Middleware, and Database.
 */
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const config = require("./config/env")
const errorHandler = require("./middleware/errorMiddleware")

// Routes
const authRoutes = require("./api/authRoutes")
const serviceRoutes = require("./api/serviceRoutes")
const tradeRoutes = require("./api/tradeRoutes")
const notificationRoutes = require("./api/notificationRoutes")

// 👉 NUEVO: User Routes (Perfil Público)
const userRoutes = require("./api/userRoutes")

// Listeners (Observer)
const setupNotificationListeners = require("./listeners/notificationListener")

const app = express()

// --- 0. Init Listeners ---
setupNotificationListeners()

// --- 1. Global Middleware ---
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
)

// Body Parsers
app.use(express.json())
app.use(cookieParser())

// --- 2. Routes ---
// Auth Routes
app.use("/api/v1/auth", authRoutes)

// Service & Trade Routes
app.use("/api/v1/services", serviceRoutes)
app.use("/api/v1/trades", tradeRoutes)

// 👉 NUEVO: Perfil público de usuario
app.use("/api/v1/users", userRoutes)

// Notifications Routes (IMPORTANTE: antes del errorHandler)
app.use("/api/v1/notifications", notificationRoutes)

// Health Check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "SkillBarter API" })
})

// --- 3. Error Handling (SIEMPRE al final) ---
app.use(errorHandler)

// --- 4. Start Server ---
app.listen(config.PORT, () => {
  console.log(`✅ Server running on http://localhost:${config.PORT}`)
  console.log(`Example: http://localhost:${config.PORT}/api/v1/health`)
})