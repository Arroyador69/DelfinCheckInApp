// =====================================================
// API CLIENT PARA APP MÓVIL
// =====================================================

import axios, { AxiosInstance, AxiosError } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_URL = Constants.expoConfig?.extra?.API_URL || process.env.EXPO_PUBLIC_API_URL || 'https://admin.delfincheckin.com';

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
      }
      
      // Obtener tenant_id del token si está disponible
      const sessionStr = await SecureStore.getItemAsync('delfin.session.v1');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.tenant_id) {
          config.headers['x-tenant-id'] = session.tenant_id;
        }
      }
    } catch (error) {
      console.error('Error obteniendo token:', error);
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

