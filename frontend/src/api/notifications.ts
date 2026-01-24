// src/api/notifications.ts
import client from "./client";
import type {
  NotificationsResponse,
  UnreadCountResponse,
  MarkReadRequest,
  MarkReadResponse,
  Notification
} from "../types/notification";

export const notificationsApi = {
  /**
   * GET /api/v1/notifications/unread-count
   */
  getUnreadCount: async (): Promise<number> => {
    const { data } = await client.get<UnreadCountResponse>("/notifications/unread-count");
    return data.unreadCount;
  },

  /**
   * GET /api/v1/notifications
   */
  getAll: async (): Promise<Notification[]> => {
    const { data } = await client.get<NotificationsResponse>("/notifications");
    return data.notifications;
  },

  /**
   * POST /api/v1/notifications/mark-read
   * Body: { notificationIds: [...] }  (debe ser no vacío)
   */
  markRead: async (notificationIds: string[]): Promise<MarkReadResponse> => {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      // Evitamos disparar el error del backend:
      // "notificationIds must be a non-empty array"
      throw new Error("markRead requiere un arreglo no vacío de notificationIds");
    }

    const payload: MarkReadRequest = { notificationIds };
    const { data } = await client.post<MarkReadResponse>("/notifications/mark-read", payload);
    return data;
  }
};