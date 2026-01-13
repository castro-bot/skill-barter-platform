// frontend/src/api/authService.ts
import client from './client';
import type { AuthResponse, LoginDTO, RegisterDTO, User } from '../types/auth';

const TOKEN_KEY = 'sb_auth_token';

export const authApi = {
  // ... (tus funciones login, register, logout, getProfile déjalas igual) ...

  login: async (credentials: LoginDTO): Promise<AuthResponse> => {
    const { data } = await client.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    return data;
  },

  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    const { data: responseData } = await client.post<AuthResponse>('/auth/register', data);
    localStorage.setItem(TOKEN_KEY, responseData.accessToken);
    return responseData;
  },

  logout: async (): Promise<void> => {
    try {
      await client.post('/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  getProfile: async (): Promise<User> => {
    const { data } = await client.get<User>('/auth/me');
    return data;
  },

  // 👇 AGREGA ESTA NUEVA FUNCIÓN 👇
  refreshSession: async (): Promise<string> => {
    // Llama al endpoint que usa la Cookie para darnos un nuevo Token
    const { data } = await client.post<{ accessToken: string }>('/auth/refresh');
    // Guardamos el nuevo token inmediatamente
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    return data.accessToken;
  }
};