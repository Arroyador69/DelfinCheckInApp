// =====================================================
// GESTIÓN DE AUTENTICACIÓN (SecureStore + Context)
// =====================================================

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, LoginResponse } from './api';

const SESSION_KEY = 'delfin.session.v1';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export interface Session {
  accessToken: string;
  refreshToken: string;
  tenant_id: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isPlatformAdmin: boolean;
    tenant: {
      id: string;
      name: string;
      status: string;
      planId: string;
      maxRooms: number;
      currentRooms: number;
    };
  };
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión al iniciar
  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      console.log('🔐 Cargando sesión...');
      const sessionStr = await SecureStore.getItemAsync(SESSION_KEY);
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      console.log('📦 Datos encontrados:', {
        tieneSession: !!sessionStr,
        tieneAccessToken: !!accessToken,
        tieneRefreshToken: !!refreshToken,
      });

      if (sessionStr && accessToken) {
        const parsedSession = JSON.parse(sessionStr);
        setSession(parsedSession);
        console.log('✅ Sesión cargada correctamente');
      } else if (refreshToken) {
        console.log('🔄 Intentando refrescar token...');
        // Intentar refrescar si hay refresh token pero no access token
        await refreshSession();
      } else {
        console.log('ℹ️ No hay sesión guardada');
      }
    } catch (error) {
      console.error('❌ Error cargando sesión:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Carga de sesión completada');
    }
  }

  async function signIn(email: string, password: string): Promise<boolean> {
    try {
      console.log('🔐 Intentando login con:', { email, apiUrl: api.defaults.baseURL });
      const response = await api.post<LoginResponse>('/api/auth/mobile-login', {
        email,
        password,
      });

      console.log('✅ Respuesta del servidor:', { success: response.data.success, status: response.status });
      if (response.data.success) {
        const sessionData: Session = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          tenant_id: response.data.user.tenant.id,
          user: response.data.user,
        };

        // Guardar en SecureStore
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(sessionData));
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, response.data.accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.data.refreshToken);

        setSession(sessionData);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      console.error('📡 Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullUrl: error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A',
        data: error.response?.data,
      });
      return false;
    }
  }

  async function signOut(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      setSession(null);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  }

  async function refreshSession(): Promise<boolean> {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const response = await api.post('/api/auth/refresh', {
        refreshToken,
      });

      if (response.data.success) {
        const newAccessToken = response.data.accessToken;
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccessToken);

        // Actualizar sesión
        const sessionStr = await SecureStore.getItemAsync(SESSION_KEY);
        if (sessionStr) {
          const sessionData: Session = JSON.parse(sessionStr);
          sessionData.accessToken = newAccessToken;
          await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(sessionData));
          setSession(sessionData);
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refrescando sesión:', error);
      await signOut();
      return false;
    }
  }

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

