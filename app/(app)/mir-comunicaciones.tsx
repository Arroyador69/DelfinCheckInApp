// =====================================================
// COMUNICACIONES MIR - Registros de formularios
// =====================================================

import { View, Text, FlatList, StyleSheet, RefreshControl, TextInput, Pressable } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Search, Mail, Phone, Calendar, Users } from 'lucide-react-native';

interface FormSubmission {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  checkin: string | null;
  checkout: string | null;
  guests: number | null;
  room_type: string | null;
  message: string | null;
  form_data: any;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}

export default function MIRComunicacionesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ['form-submissions', searchTerm],
    queryFn: async () => {
      try {
        const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
        console.log('📡 Obteniendo formularios desde:', `/api/forms/submissions${params}`);
        const response = await api.get(`/api/forms/submissions${params}`);
        console.log('✅ Respuesta recibida:', {
          submissions: response.data?.submissions?.length || 0,
          stats: response.data?.stats,
        });
        return response.data;
      } catch (err: any) {
        console.error('❌ Error obteniendo formularios:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        throw err;
      }
    },
  });

  const submissions: FormSubmission[] = data?.submissions || [];
  const stats = data?.stats || {};

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando comunicaciones...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error al cargar comunicaciones</Text>
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : 'Error desconocido'}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, email o mensaje..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Estadísticas */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total_submissions || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.submissions_last_7_days || 0}</Text>
            <Text style={styles.statLabel}>Últimos 7 días</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.submissions_last_30_days || 0}</Text>
            <Text style={styles.statLabel}>Últimos 30 días</Text>
          </View>
        </View>
      )}

      {/* Lista de envíos */}
      <FlatList
        data={submissions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.date}>{formatDate(item.created_at)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Mail size={16} color="#6b7280" />
              <Text style={styles.infoText}>{item.email}</Text>
            </View>

            {item.phone && (
              <View style={styles.infoRow}>
                <Phone size={16} color="#6b7280" />
                <Text style={styles.infoText}>{item.phone}</Text>
              </View>
            )}

            {(item.checkin || item.checkout) && (
              <View style={styles.infoRow}>
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.infoText}>
                  {item.checkin && formatDate(item.checkin)}
                  {item.checkin && item.checkout && ' - '}
                  {item.checkout && formatDate(item.checkout)}
                </Text>
              </View>
            )}

            {item.guests && (
              <View style={styles.infoRow}>
                <Users size={16} color="#6b7280" />
                <Text style={styles.infoText}>{item.guests} huéspedes</Text>
              </View>
            )}

            {item.room_type && (
              <Text style={styles.roomType}>Tipo: {item.room_type}</Text>
            )}

            {item.message && (
              <View style={styles.messageContainer}>
                <Text style={styles.messageLabel}>Mensaje:</Text>
                <Text style={styles.messageText}>{item.message}</Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchTerm ? 'No se encontraron resultados' : 'No hay comunicaciones registradas'}
            </Text>
            <Text style={styles.emptySubtext}>
              Los formularios enviados desde tu página aparecerán aquí
            </Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  roomType: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 8,
  },
  messageContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
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
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
