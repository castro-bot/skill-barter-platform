// frontend/src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginDTO, RegisterDTO } from '../types/auth';
import { authApi } from '../api/authService'; // ✅ AÑADE ESTO

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userProfile = await authApi.getProfile();
        setUser(userProfile);
      } catch (error) {
        console.error(error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (data: LoginDTO) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterDTO) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};