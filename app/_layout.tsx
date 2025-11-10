// =====================================================
// ROOT LAYOUT - Configuración global de la app
// =====================================================

import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter, useSegments } from 'expo-router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// Componente para manejar navegación según autenticación
function NavigationHandler() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // No hay sesión y no está en auth, redirigir a login
      router.replace('/(auth)');
    } else if (session && inAuthGroup) {
      // Hay sesión y está en auth, redirigir a app
      router.replace('/(app)');
    }
  }, [session, loading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationHandler />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

