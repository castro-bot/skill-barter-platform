// src/context/NotificationsContext.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { notificationsApi } from "../api/notifications"
import type { Notification } from "../types/notification"
import { useAuth } from "./AuthContext"
import { getApiErrorMessage } from "../utils/error"

type NotificationsContextType = {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null

  refreshUnreadCount: () => Promise<void>
  refreshNotifications: () => Promise<void>
  refreshAll: () => Promise<void>

  /**
   * Marca como leídas las notificaciones NO leídas que existan en el estado actual.
   * Es útil para “al abrir el panel”.
   */
  markAllUnreadAsRead: () => Promise<void>

  /**
   * Marca como leídas notificaciones específicas (por IDs).
   * Respeta el contrato real del backend: { notificationIds: [...] } (no vacío).
   */
  markReadByIds: (ids: string[]) => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Evita setState después de un unmount
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Evita requests duplicados simultáneos
  const inFlightRef = useRef({
    unread: false,
    list: false,
    mark: false,
    all: false
  })

  const safeSetState = useCallback((fn: () => void) => {
    if (mountedRef.current) fn()
  }, [])

  const resetState = useCallback(() => {
    safeSetState(() => {
      setNotifications([])
      setUnreadCount(0)
      setError(null)
      setIsLoading(false)
    })
  }, [safeSetState])

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated || authLoading) return
    if (inFlightRef.current.unread) return

    inFlightRef.current.unread = true
    try {
      const count = await notificationsApi.getUnreadCount()
      safeSetState(() => {
        setUnreadCount(count)
        setError(null)
      })
    } catch (e) {
      safeSetState(() => setError(getApiErrorMessage(e, "Error obteniendo unreadCount")))
    } finally {
      inFlightRef.current.unread = false
    }
  }, [isAuthenticated, authLoading, safeSetState])

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated || authLoading) return
    if (inFlightRef.current.list) return

    inFlightRef.current.list = true
    safeSetState(() => setIsLoading(true))

    try {
      const list = await notificationsApi.getAll()

      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      safeSetState(() => {
        setNotifications(sorted)
        setError(null)
      })
    } catch (e) {
      safeSetState(() => setError(getApiErrorMessage(e, "Error obteniendo notificaciones")))
    } finally {
      safeSetState(() => setIsLoading(false))
      inFlightRef.current.list = false
    }
  }, [isAuthenticated, authLoading, safeSetState])

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated || authLoading) return
    if (inFlightRef.current.all) return

    inFlightRef.current.all = true
    safeSetState(() => setIsLoading(true))

    try {
      const [count, list] = await Promise.all([
        notificationsApi.getUnreadCount(),
        notificationsApi.getAll()
      ])

      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      safeSetState(() => {
        setUnreadCount(count)
        setNotifications(sorted)
        setError(null)
      })
    } catch (e) {
      safeSetState(() => setError(getApiErrorMessage(e, "Error refrescando notificaciones")))
    } finally {
      safeSetState(() => setIsLoading(false))
      inFlightRef.current.all = false
    }
  }, [isAuthenticated, authLoading, safeSetState])

  const markReadByIds = useCallback(
    async (ids: string[]) => {
      if (!isAuthenticated || authLoading) return
      if (!Array.isArray(ids) || ids.length === 0) return // evita el error del backend
      if (inFlightRef.current.mark) return

      inFlightRef.current.mark = true
      try {
        // 1) Optimista local: marcamos read=true (sin manipular unreadCount “a ojo”)
        safeSetState(() => {
          setNotifications((prev) =>
            prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
          )
          setError(null)
        })

        // 2) Backend
        await notificationsApi.markRead(ids)

        // 3) Source of truth: refrescamos contador real
        await refreshUnreadCount()
      } catch (e) {
        // Si falla, re-sincronizamos para quedar consistentes
        await refreshAll()
        safeSetState(() => setError(getApiErrorMessage(e, "Error marcando notificaciones")))
      } finally {
        inFlightRef.current.mark = false
      }
    },
    [isAuthenticated, authLoading, refreshAll, refreshUnreadCount, safeSetState]
  )

  const markAllUnreadAsRead = useCallback(async () => {
    if (!isAuthenticated || authLoading) return

    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return

    await markReadByIds(unreadIds)
  }, [isAuthenticated, authLoading, notifications, markReadByIds])

  /**
   * Bootstrap automático:
   * - Cuando termina la carga de Auth y hay sesión válida -> traemos estado inicial.
   * - Si se desloguea -> limpiamos.
   */
  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      resetState()
      return
    }

    refreshAll()
  }, [authLoading, isAuthenticated, refreshAll, resetState])

  const value = useMemo<NotificationsContextType>(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      error,
      refreshUnreadCount,
      refreshNotifications,
      refreshAll,
      markAllUnreadAsRead,
      markReadByIds
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      error,
      refreshUnreadCount,
      refreshNotifications,
      refreshAll,
      markAllUnreadAsRead,
      markReadByIds
    ]
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error("useNotifications debe usarse dentro de un NotificationsProvider")
  return ctx
}
