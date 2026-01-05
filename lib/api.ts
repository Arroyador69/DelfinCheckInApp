// =====================================================
// API CLIENT PARA APP MÓVIL
// =====================================================

import axios, { AxiosInstance, AxiosError } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_URL = Constants.expoConfig?.extra?.API_URL || process.env.EXPO_PUBLIC_API_URL || 'https://admin.delfincheckin.com';

console.log('🌐 API URL configurada:', API_URL);

// Cliente axios configurado
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token añadido a request:', config.url);
      }
      
      // Obtener tenant_id de la sesión
      const sessionStr = await SecureStore.getItemAsync('delfin.session.v1');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.tenant_id) {
          config.headers['x-tenant-id'] = session.tenant_id;
          console.log('🏢 Tenant ID añadido a request:', session.tenant_id, 'para URL:', config.url);
        } else {
          console.warn('⚠️ Sesión no tiene tenant_id:', session);
        }
      } else {
        console.warn('⚠️ No se encontró sesión en SecureStore');
      }
      
      // También intentar obtener tenant_id del token JWT si no está en la sesión
      if (!config.headers['x-tenant-id'] && token) {
        try {
          // Decodificar JWT (solo payload, sin verificar firma)
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.tenantId) {
            config.headers['x-tenant-id'] = payload.tenantId;
            console.log('🔑 Tenant ID obtenido del JWT:', payload.tenantId);
          }
        } catch (jwtError) {
          console.warn('⚠️ No se pudo decodificar JWT para obtener tenantId:', jwtError);
        }
      }
    } catch (error) {
      console.error('❌ Error obteniendo token o tenant_id:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Intentar refrescar token
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          await SecureStore.setItemAsync('accessToken', accessToken);
          
          // Reintentar request original
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return api.request(error.config);
          }
        }
      } catch (refreshError) {
        // Refresh falló, limpiar sesión
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('delfin.session.v1');
        // Redirigir al login (se manejará en el componente)
      }
    }
    return Promise.reject(error);
  }
);

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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

