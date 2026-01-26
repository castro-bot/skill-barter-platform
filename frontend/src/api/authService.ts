// frontend/src/api/authService.ts
import client from "./client"
import type { LoginDTO, RegisterDTO, User } from "../types/auth"

type LoginResponse = {
  accessToken: string
  user: User
}

type RegisterResponse = {
  accessToken: string
  user: User
}

type RefreshResponse = {
  accessToken: string
}

const TOKEN_KEY = "sb_auth_token"

export const authApi = {
  login: async (data: LoginDTO): Promise<{ user: User }> => {
    const res = await client.post<LoginResponse>("/auth/login", data)

    // Guardamos token para que el interceptor lo adjunte en adelante
    localStorage.setItem(TOKEN_KEY, res.data.accessToken)

    return { user: res.data.user }
  },

  register: async (data: RegisterDTO): Promise<{ user: User }> => {
    const res = await client.post<RegisterResponse>("/auth/register", data)
    localStorage.setItem(TOKEN_KEY, res.data.accessToken)
    return { user: res.data.user }
  },

  logout: async (): Promise<void> => {
    // si tu backend devuelve 204, esto igual funciona
    await client.post("/auth/logout")
    localStorage.removeItem(TOKEN_KEY)
  },

  refreshSession: async (): Promise<void> => {
    // refresh usa cookie httpOnly; client ya tiene withCredentials:true
    const res = await client.post<RefreshResponse>("/auth/refresh")
    localStorage.setItem(TOKEN_KEY, res.data.accessToken)
  },

  getProfile: async (): Promise<User> => {
    const { data } = await client.get<User>("/auth/me")
    return data
  }
}