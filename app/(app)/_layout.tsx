// =====================================================
// LAYOUT DE LA APP (Tabs)
// =====================================================

import { Tabs } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { Redirect } from 'expo-router';

export default function AppLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return null; // O un componente de loading
  }

  if (!session) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Reservas',
          tabBarLabel: 'Reservas',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Facturación',
          tabBarLabel: 'Facturación',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💰</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}

// Componente temporal para iconos (luego usar react-native-vector-icons)
function Text({ children, style }: { children: React.ReactNode; style?: any }) {
  return <>{children}</>;
}

