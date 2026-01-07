// src/types/auth.ts

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: 'student' | 'admin'; // Asumimos student por defecto según SRS
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// Lo que enviamos al hacer Login
export interface LoginDTO {
  email: string;
  password: string; // "a-strong-password-123" según el PDF
}

// Lo que enviamos al Registrarse
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}