// frontend/src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import type { User, LoginDTO, RegisterDTO } from "../types/auth"
import { authApi } from "../api/authService"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginDTO) => Promise<void>
  register: (data: RegisterDTO) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = "sb_auth_token"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Evita doble ejecución en StrictMode DEV
  const didInitRef = useRef(false)

  useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true

    const initAuth = async () => {
      setIsLoading(true)

      try {
        const token = localStorage.getItem(TOKEN_KEY)

        // Si no hay token, no intentamos /me
        if (!token) {
          setUser(null)
          return
        }

        /**
         * Importante:
         * - NO hacemos refresh manual aquí.
         * - Si /auth/me da 401, el interceptor de axios intentará refresh
         *   (cookie httpOnly) y reintentará automáticamente.
         * - Si aún así falla, limpiamos token y estado.
         */
        const profile = await authApi.getProfile()
        setUser(profile)
      } catch (error) {
        console.warn("Sesión inválida o expirada, limpiando token:", error)
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (data: LoginDTO) => {
    setIsLoading(true)
    try {
      const resp = await authApi.login(data)
      setUser(resp.user)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterDTO) => {
    setIsLoading(true)
    try {
      const resp = await authApi.register(data)
      setUser(resp.user)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (e) {
      console.error("Error al logout:", e)
    }
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider")
  return ctx
}