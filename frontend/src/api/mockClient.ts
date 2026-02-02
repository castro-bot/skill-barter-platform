// frontend/src/api/mockClient.ts
import type { AuthResponse, LoginDTO, RegisterDTO, User } from '../types/auth';

// Clave para guardar en el navegador
const TOKEN_KEY = 'sb_auth_token';

// Simulamos una base de datos local temporal
const MOCK_USER: User = {
  id: 'c3e4a2d0-5b1f-4b8a-8f0a-1c2b3e4d5f6a',
  name: 'Axel Jhostin',
  email: 'axel@pucem.edu.ec',
  createdAt: new Date().toISOString(),
  role: 'student',
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  login: async (credentials: LoginDTO): Promise<AuthResponse> => {
    await delay(500); 
    
    if (credentials.password === 'error') {
      throw new Error('Credenciales inválidas');
    }

    // ARREGLO 1: Guardamos una marca en el navegador al entrar
    localStorage.setItem(TOKEN_KEY, 'mock-jwt-token-xyz');

    return {
      user: MOCK_USER,
      accessToken: 'mock-jwt-token-xyz',
    };
  },

  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    await delay(800);
    
    // ARREGLO 2: También guardamos la marca al registrarse
    localStorage.setItem(TOKEN_KEY, 'mock-jwt-token-xyz');

    return {
      user: { ...MOCK_USER, name: data.name, email: data.email },
      accessToken: 'mock-jwt-token-xyz',
    };
  },

  logout: async (): Promise<void> => {
    await delay(200);
    // ARREGLO 3: Borramos la marca al salir
    localStorage.removeItem(TOKEN_KEY);
    console.log('Sesión cerrada');
  },

  getProfile: async (): Promise<User> => {
    await delay(300);

    // ARREGLO 4: CRÍTICO - Verificamos si existe la marca antes de responder
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      // Si no hay token, lanzamos error para que el AuthContext sepa que no hay usuario
      throw new Error('No hay sesión activa');
    }

    return MOCK_USER;
  }
};