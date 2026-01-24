// frontend/src/api/client.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

const TOKEN_KEY = "sb_auth_token"

const client = axios.create({
  baseURL: "http://localhost:3001/api/v1",
  withCredentials: true, // NECESARIO para enviar/recibir cookie refreshToken
  headers: {
    "Content-Type": "application/json"
  }
})

// --- REQUEST: adjunta Bearer token si existe ---
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- REFRESH CONTROL ---
let isRefreshing = false
let pendingQueue: Array<(token: string | null) => void> = []

const flushQueue = (token: string | null) => {
  pendingQueue.forEach((cb) => cb(token))
  pendingQueue = []
}

// --- RESPONSE: si 401 -> intenta refresh una vez y reintenta ---
client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (!originalRequest) return Promise.reject(error)

    const status = error.response?.status
    const isAuthRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh")

    // Si es 401 y NO es login/register/refresh
    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true

      // Si ya hay un refresh en curso, encola la request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((token) => {
            if (!token) return reject(error)
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(client(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        // Intentamos refresh usando cookie httpOnly
        const refreshRes = await client.post<{ accessToken: string }>("/auth/refresh")
        const newToken = refreshRes.data.accessToken
        localStorage.setItem(TOKEN_KEY, newToken)

        flushQueue(newToken)

        // Reintenta la request original con token nuevo
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return client(originalRequest)
      } catch (refreshErr) {
        localStorage.removeItem(TOKEN_KEY)
        flushQueue(null)
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default client