// frontend/src/api/client.ts
import axios from 'axios';

// ✅ AJUSTE: Usamos el puerto 3001 que dijo Adolfo
const BASE_URL = 'http://localhost:3001/api/v1'; 

export const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Vital para las cookies de sesión
});

// Interceptor: Le pega el token a cada petición si existe
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;