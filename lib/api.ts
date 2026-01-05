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
      
      // Verificar si el token está expirado antes de usarlo
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const exp = payload.exp * 1000; // Convertir a milisegundos
          const now = Date.now();
          
          // Si el token expira en menos de 5 minutos, refrescarlo proactivamente
          if (exp - now < 5 * 60 * 1000) {
            console.log('⏰ Token próximo a expirar, refrescando proactivamente...');
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (refreshToken) {
              try {
                const refreshResponse = await axios.post(`${API_URL}/api/auth/refresh`, {
                  refreshToken,
                });
                
                if (refreshResponse.data.success && refreshResponse.data.accessToken) {
                  const newToken = refreshResponse.data.accessToken;
                  await SecureStore.setItemAsync('accessToken', newToken);
                  
                  // Actualizar sesión
                  const sessionStr = await SecureStore.getItemAsync('delfin.session.v1');
                  if (sessionStr) {
                    const session = JSON.parse(sessionStr);
                    session.accessToken = newToken;
                    await SecureStore.setItemAsync('delfin.session.v1', JSON.stringify(session));
                  }
                  
                  config.headers.Authorization = `Bearer ${newToken}`;
                  console.log('✅ Token refrescado proactivamente');
                  
                  // Obtener tenantId del nuevo token
                  const newPayload = JSON.parse(atob(newToken.split('.')[1]));
                  if (newPayload.tenantId) {
                    config.headers['x-tenant-id'] = newPayload.tenantId;
                  }
                  
                  return config;
                }
              } catch (refreshError) {
                console.warn('⚠️ Error en refresh proactivo, usando token actual:', refreshError);
              }
            }
          }
          
          // Usar token actual
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token añadido a request:', config.url);
          
          // Obtener tenantId del token
          if (payload.tenantId) {
            config.headers['x-tenant-id'] = payload.tenantId;
            console.log('🏢 Tenant ID obtenido del JWT:', payload.tenantId);
          }
        } catch (jwtError) {
          console.warn('⚠️ No se pudo decodificar JWT:', jwtError);
          // Aún así usar el token, el servidor lo validará
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      
      // Fallback: Obtener tenant_id de la sesión si no está en el token
      if (!config.headers['x-tenant-id']) {
        const sessionStr = await SecureStore.getItemAsync('delfin.session.v1');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session.tenant_id) {
            config.headers['x-tenant-id'] = session.tenant_id;
            console.log('🏢 Tenant ID añadido desde sesión:', session.tenant_id);
          }
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
    const originalRequest = error.config as any;
    
    // Si es 401 y no es un intento de refresh, intentar refrescar token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔄 Token expirado, intentando refrescar...');
      
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) {
          console.warn('⚠️ No hay refresh token disponible');
          throw new Error('No refresh token');
        }
        
        console.log('🔄 Refrescando token...');
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });
        
        if (response.data.success && response.data.accessToken) {
          const newAccessToken = response.data.accessToken;
          console.log('✅ Token refrescado correctamente');
          
          // Guardar nuevo token
          await SecureStore.setItemAsync('accessToken', newAccessToken);
          
          // Actualizar sesión
          const sessionStr = await SecureStore.getItemAsync('delfin.session.v1');
          if (sessionStr) {
            const session = JSON.parse(sessionStr);
            session.accessToken = newAccessToken;
            await SecureStore.setItemAsync('delfin.session.v1', JSON.stringify(session));
          }
          
          // Actualizar header y reintentar request
          if (originalRequest) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            
            // También actualizar tenant_id si está en el token
            try {
              const payload = JSON.parse(atob(newAccessToken.split('.')[1]));
              if (payload.tenantId) {
                originalRequest.headers['x-tenant-id'] = payload.tenantId;
              }
            } catch {}
            
            console.log('🔄 Reintentando request original...');
            return api.request(originalRequest);
          }
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (refreshError) {
        console.error('❌ Error refrescando token:', refreshError);
        // Refresh falló, limpiar sesión
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('delfin.session.v1');
        // El error se propagará y el componente manejará el logout
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

