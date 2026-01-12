// frontend/src/api/authService.ts
import client from './client';
import type { AuthResponse, LoginDTO, RegisterDTO, User } from '../types/auth';

const TOKEN_KEY = 'sb_auth_token';

export const authApi = {
  login: async (credentials: LoginDTO): Promise<AuthResponse> => {
    // POST real al backend
    const { data } = await client.post<AuthResponse>('/auth/login', credentials);
    
    // Guardamos el token real que nos da el backend
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
      // Borramos el token del navegador siempre, aunque falle el server
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  getProfile: async (): Promise<User> => {
    // GET real a /auth/me
    const { data } = await client.get<User>('/auth/me');
    return data;
  }
};