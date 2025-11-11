// =====================================================
// RESERVAS DIRECTAS - Igual que el admin web
// =====================================================

import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

export default function DirectReservationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['direct-reservations'],
    queryFn: async () => {
      const response = await api.get('/api/tenant/direct-reservations');
      return response.data.reservations || [];
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading && !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando reservas directas...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={data || []}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.reservationCode}>{item.reservation_code || `#${item.id}`}</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#10b98120' }]}>
              <Text style={[styles.statusText, { color: '#10b981' }]}>
                {item.reservation_status === 'confirmed' ? 'Confirmada' : item.reservation_status}
              </Text>
            </View>
          </View>

          <Text style={styles.guestName}>{item.guest_name}</Text>
          {item.guest_email && <Text style={styles.guestEmail}>{item.guest_email}</Text>}
          <Text style={styles.propertyName}>{item.property_name || 'N/A'}</Text>

          <View style={styles.datesContainer}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Check-in:</Text>
              <Text style={styles.dateValue}>{formatDate(item.check_in_date)}</Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Check-out:</Text>
              <Text style={styles.dateValue}>{formatDate(item.check_out_date)}</Text>
            </View>
          </View>

          {item.total_amount && (
            <Text style={styles.amount}>
              {parseFloat(String(item.total_amount)).toFixed(2)} €
            </Text>
          )}
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay reservas directas</Text>
        </View>
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reservationCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  guestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  guestEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  propertyName: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 12,
    fontWeight: '500',
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'right',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

