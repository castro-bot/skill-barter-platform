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

  // ✅ Evita doble ejecución en React 18 StrictMode (DEV)
  const didInitRef = useRef(false)

  useEffect(() => {
    // En dev StrictMode se ejecuta dos veces: bloqueamos la segunda
    if (didInitRef.current) return
    didInitRef.current = true

    const initAuth = async () => {
      setIsLoading(true)

      try {
        // ✅ Si no hay token, NO llames /me ni /refresh
        const token = localStorage.getItem(TOKEN_KEY)
        if (!token) {
          setUser(null)
          return
        }

        // 1) Intentar /me con token actual
        const profile = await authApi.getProfile()
        setUser(profile)
      } catch (error) {
        console.warn("Sesión inicial fallida o expirada:", error)

        // 2) Solo si había token, intentar refresh (cookie)
        try {
          console.log("Intentando refrescar sesión...")
          await authApi.refreshSession()

          const profileRetry = await authApi.getProfile()
          setUser(profileRetry)
        } catch (refreshError) {
          console.error("No se pudo restaurar la sesión, es necesario loguearse:", refreshError)
          localStorage.removeItem(TOKEN_KEY)
          setUser(null)
        }
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