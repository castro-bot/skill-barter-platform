// frontend/src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginDTO, RegisterDTO } from '../types/auth';
import { authApi } from '../api/authService';

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

  // Lógica de inicio: Recuperar sesión
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Intentamos obtener el perfil directamente
        const userProfile = await authApi.getProfile();
        setUser(userProfile);
      } catch (error) {
        // CORRECCIÓN 1: Usamos la variable 'error' imprimiéndola
        console.warn("Sesión inicial fallida o expirada:", error);
        
        // 2. Si falla, intentamos REFRESCAR el token
        try {
          console.log("Intentando refrescar sesión...");
          await authApi.refreshSession(); 
          
          // 3. Si el refresh funciona, pedimos el perfil de nuevo
          const userProfileRetry = await authApi.getProfile();
          setUser(userProfileRetry);
        } catch (refreshError) {
          // CORRECCIÓN 2: Usamos la variable 'refreshError'
          console.error("No se pudo restaurar la sesión, es necesario loguearse:", refreshError);
          setUser(null);
        }
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
    try {
      await authApi.logout();
    } catch (e) {
      console.error("Error al salir:", e);
    }
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

// CORRECCIÓN 3: Fast Refresh
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};