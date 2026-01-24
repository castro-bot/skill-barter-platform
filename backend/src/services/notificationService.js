// backend/src/services/notificationService.js
const prisma = require("../core/db");

class NotificationService {
  /**
   * Obtener notificaciones del usuario (más recientes primero)
   */
  static async getUserNotifications(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        message: true,
        read: true,
        createdAt: true,
        tradeId: true,
      },
    });
  }

  /**
   * Contar no leídas (para campana)
   */
  static async countUnread(userId) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  }

  /**
   * Marcar seleccionadas como leídas (solo del usuario)
   */
  static async markAsRead(userId, notificationIds) {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      const err = new Error("notificationIds must be a non-empty array");
      err.statusCode = 400;
      throw err;
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        id: { in: notificationIds },
      },
      data: { read: true },
    });

    return { updatedCount: result.count };
  }

  /**
   * Marcar todas como leídas
   */
  static async markAllAsRead(userId) {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { updatedCount: result.count };
  }
}

module.exports = NotificationService;