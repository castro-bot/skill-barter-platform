// backend/src/api/notificationRoutes.js
const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const NotificationService = require("../services/notificationService");

/**
 * GET /api/v1/notifications
 * Protected - List user's notifications
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const notifications = await NotificationService.getUserNotifications(req.user.id);
    res.status(200).json({ notifications });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/notifications/unread-count
 * Protected - Count unread notifications
 */
router.get("/unread-count", authenticate, async (req, res, next) => {
  try {
    const unreadCount = await NotificationService.countUnread(req.user.id);
    res.status(200).json({ unreadCount });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/notifications/mark-read
 * Body: { notificationIds: string[] } OR { all: true }
 */
router.post("/mark-read", authenticate, async (req, res, next) => {
  try {
    const { notificationIds, all } = req.body || {};

    const result = all
      ? await NotificationService.markAllAsRead(req.user.id)
      : await NotificationService.markAsRead(req.user.id, notificationIds);

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;