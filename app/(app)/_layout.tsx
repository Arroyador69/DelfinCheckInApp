// =====================================================
// LAYOUT DE LA APP (Tabs + Menú Hamburguesa)
// =====================================================

import { Tabs, useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { Redirect } from 'expo-router';
import { Text, Pressable, View } from 'react-native';
import { useState } from 'react';
import DrawerMenu from '@/components/DrawerMenu';
import { Menu } from 'lucide-react-native';

export default function AppLayout() {
  const { session, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitleAlign: 'center',
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#6b7280',
          headerLeft: () => (
            <Pressable
              onPress={() => setDrawerOpen(true)}
              style={{ marginLeft: 16, padding: 8 }}
            >
              <Menu size={24} color="#1f2937" />
            </Pressable>
          ),
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
          name="calendar"
          options={{
            title: 'Calendario',
            tabBarLabel: 'Calendario',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📆</Text>,
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
        {/* Pantallas ocultas del menú hamburguesa */}
        <Tabs.Screen
          name="invoices"
          options={{
            href: null, // Ocultar del tab bar
            title: 'Facturación',
          }}
        />
        <Tabs.Screen
          name="mir-comunicaciones"
          options={{
            href: null,
            title: 'Comunicaciones MIR',
          }}
        />
        <Tabs.Screen
          name="payment-links"
          options={{
            href: null,
            title: 'Enlaces de Pago',
          }}
        />
      </Tabs>
      <DrawerMenu isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
