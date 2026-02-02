// src/types/notification.ts

export type NotificationType = string;

/**
 * Modelo real según el response confirmado:
 * GET /api/v1/notifications -> { notifications: Notification[] }
 */
export interface Notification {
  id: string;
  type: NotificationType; // ej: "TRADE_PROPOSAL"
  message: string;
  read: boolean;
  createdAt: string; // ISO
  tradeId?: string | null;
}

/**
 * Response real confirmado:
 * { "notifications": [ ... ] }
 */
export interface NotificationsResponse {
  notifications: Notification[];
}

/**
 * Response real confirmado:
 * { "unreadCount": 0 }
 */
export interface UnreadCountResponse {
  unreadCount: number;
}

/**
 * Body real confirmado para mark-read:
 * { "notificationIds": ["id1","id2"] }
 */
export interface MarkReadRequest {
  notificationIds: string[];
}

export interface MarkReadResponse {
  success: boolean;
  updatedCount: number;
}