// =====================================================
// DASHBOARD - Pantalla principal
// =====================================================

import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

interface Reservation {
  id: number;
  reservation_code: string;
  guest_name: string;
  property_name: string;
  check_in_date: string;
  check_out_date: string;
  reservation_status: string;
}

export default function DashboardScreen() {
  const { session } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: reservations, isLoading, refetch } = useQuery({
    queryKey: ['reservations', 'today'],
    queryFn: async () => {
      const response = await api.get('/api/tenant/direct-reservations');
      return response.data.reservations as Reservation[];
    },
  });

  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations?.filter(
    (r) => r.check_in_date === today && r.reservation_status === 'confirmed'
  ) || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {session?.user.fullName || session?.user.email}</Text>
        <Text style={styles.tenantName}>{session?.user.tenant.name}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Llegadas de hoy</Text>
        {isLoading ? (
          <Text style={styles.emptyText}>Cargando...</Text>
        ) : todayReservations.length === 0 ? (
          <Text style={styles.emptyText}>No hay llegadas programadas para hoy</Text>
        ) : (
          todayReservations.map((reservation) => (
            <View key={reservation.id} style={styles.reservationItem}>
              <Text style={styles.guestName}>{reservation.guest_name}</Text>
              <Text style={styles.propertyName}>{reservation.property_name}</Text>
              <Text style={styles.dates}>
                {new Date(reservation.check_in_date).toLocaleDateString('es-ES')} -{' '}
                {new Date(reservation.check_out_date).toLocaleDateString('es-ES')}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total reservas:</Text>
          <Text style={styles.summaryValue}>{reservations?.length || 0}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Hoy:</Text>
          <Text style={styles.summaryValue}>{todayReservations.length}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  tenantName: {
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  reservationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 8,
  },
  guestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  propertyName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  dates: {
    fontSize: 14,
    color: '#2563eb',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});

