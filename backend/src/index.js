// backend/src/index.js
/**
 * Application Entry Point
 * Wires together Routes, Middleware, and Database.
 */
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const errorHandler = require('./middleware/errorMiddleware');

const authRoutes = require('./api/authRoutes');
const serviceRoutes = require('./api/serviceRoutes');
const tradeRoutes = require('./api/tradeRoutes');
// Listeners
const setupNotificationListeners = require('./listeners/notificationListener');

const app = express();

// --- 0. Init Listeners ---
setupNotificationListeners();

// --- 1. Global Middleware ---
app.use(cors({
  origin: 'http://localhost:5173', // Asegúrate que este sea el puerto de tu frontend
  credentials: true, // Vital para que pasen las cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json()); 
app.use(cookieParser());

// --- 2. Routes ---

// Auth Routes
app.use('/api/v1/auth', authRoutes); // Una sola vez es suficiente

// Service & Trade Routes
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/trades', tradeRoutes); 

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SkillBarter API' });
});

// --- 3. Error Handling ---
app.use(errorHandler);

// --- 4. Start Server ---
app.listen(config.PORT, () => {
  console.log(`✅ Server running on http://localhost:${config.PORT}`);
  console.log(`Example: http://localhost:${config.PORT}/api/v1/health`);
});