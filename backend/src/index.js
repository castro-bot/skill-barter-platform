/**
 * Application Entry Point
 * Wires together Routes, Middleware, and Database.
 */
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config/env'); // Guideline #15
const authRoutes = require('./api/authRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// --- 1. Global Middleware ---

// CORS: Allow Frontend to communicate with Backend
// Vite usually runs on port 5173
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // Allow cookies (Critical for Refresh Token)
}));

// Body Parsers
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse Cookies

// --- 2. Routes ---

// Mount Auth Routes
// Maps to: POST /api/v1/auth/register, /login, etc.
app.use('/api/v1/auth', authRoutes);

// Health Check (Use this to verify server is running)
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SkillBarter API' });
});

// --- 3. Error Handling ---
// Must be placed AFTER all routes
app.use(errorHandler);

// --- 4. Start Server ---
app.listen(config.PORT, () => {
  console.log(`✅ Server running on http://localhost:${config.PORT}`);
  console.log(`Example: http://localhost:${config.PORT}/api/v1/health`);
});