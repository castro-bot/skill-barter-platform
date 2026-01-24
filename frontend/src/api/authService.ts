// frontend/src/api/authService.ts
import client from "./client"
import type { AuthResponse, LoginDTO, RegisterDTO, User } from "../types/auth"

const TOKEN_KEY = "sb_auth_token"

export const authApi = {
  login: async (credentials: LoginDTO): Promise<AuthResponse> => {
    const payload = {
      email: credentials.email.trim(),
      password: credentials.password
    }

    const { data } = await client.post<AuthResponse>("/auth/login", payload)

    localStorage.setItem(TOKEN_KEY, data.accessToken)
    return data
  },

  register: async (dto: RegisterDTO): Promise<AuthResponse> => {
    const payload = {
      ...dto,
      email: dto.email.trim()
    }

    const { data } = await client.post<AuthResponse>("/auth/register", payload)
    localStorage.setItem(TOKEN_KEY, data.accessToken)
    return data
  },

  logout: async (): Promise<void> => {
    try {
      await client.post("/auth/logout")
    } finally {
      localStorage.removeItem(TOKEN_KEY)
    }
  },

  getProfile: async (): Promise<User> => {
    const { data } = await client.get<User>("/auth/me")
    return data
  },

  refreshSession: async (): Promise<string> => {
    const { data } = await client.post<{ accessToken: string }>("/auth/refresh")
    localStorage.setItem(TOKEN_KEY, data.accessToken)
    return data.accessToken
  }
}