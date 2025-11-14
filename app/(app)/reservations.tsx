// =====================================================
// LISTA DE RESERVAS - Con crear reserva y búsqueda
// =====================================================

import { View, Text, FlatList, StyleSheet, RefreshControl, TextInput, Pressable, Modal, ScrollView, Alert } from 'react-native';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react-native';

interface Reservation {
  id: number;
  reservation_code?: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  property_name?: string;
  room_id?: string;
  check_in_date?: string;
  check_in?: string;
  check_out_date?: string;
  check_out?: string;
  reservation_status?: string;
  status?: string;
  total_amount?: number;
  total_price?: number;
}

interface Room {
  id: number;
  name: string;
}

export default function ReservationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    room_id: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guest_count: '1',
    check_in: '',
    check_out: '',
    total_price: '',
    status: 'confirmed' as 'confirmed' | 'cancelled' | 'completed',
    channel: 'manual' as 'airbnb' | 'booking' | 'manual',
  });

  // Obtener habitaciones
  const { data: roomsData } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await api.get('/api/tenant/rooms');
      return response.data.rooms || [];
    },
  });

  const rooms: Room[] = roomsData || [];

  // Obtener reservas normales
  const { data: normalReservations } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const response = await api.get('/api/reservations');
      return response.data || [];
    },
  });

  const reservations = (normalReservations || []) as Reservation[];

  // Filtrar reservas por búsqueda
  const filteredReservations = reservations.filter((r) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      r.guest_name?.toLowerCase().includes(search) ||
      r.guest_email?.toLowerCase().includes(search) ||
      r.guest_phone?.toLowerCase().includes(search) ||
      r.reservation_code?.toLowerCase().includes(search) ||
      r.property_name?.toLowerCase().includes(search)
    );
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['reservations'] }),
      queryClient.refetchQueries({ queryKey: ['rooms'] }),
    ]);
    setRefreshing(false);
  };

  const createReservation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/api/reservations', {
        room_id: data.room_id,
        guest_name: data.guest_name,
        guest_email: data.guest_email || null,
        guest_phone: data.guest_phone || null,
        guest_count: parseInt(data.guest_count) || 1,
        check_in: data.check_in,
        check_out: data.check_out,
        total_price: parseFloat(data.total_price) || 0,
        status: data.status,
        channel: data.channel,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      setShowCreateModal(false);
      resetForm();
      Alert.alert('Éxito', 'Reserva creada correctamente');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Error al crear la reserva');
    },
  });

  const handleCreate = () => {
    if (!formData.room_id || !formData.guest_name || !formData.check_in || !formData.check_out) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios');
      return;
    }
    createReservation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      room_id: '',
      guest_name: '',
      guest_email: '',
      guest_phone: '',
      guest_count: '1',
      check_in: '',
      check_out: '',
      total_price: '',
      status: 'confirmed',
      channel: 'manual',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      case 'completed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda y botón crear */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar reservas..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#9ca3af"
          />
        </View>
        <Pressable
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color="white" />
          <Text style={styles.createButtonText}>Nueva</Text>
        </Pressable>
      </View>

      {/* Lista de reservas */}
      <FlatList
        data={filteredReservations}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const status = item.reservation_status || item.status || 'unknown';
          const checkIn = item.check_in_date || item.check_in;
          const checkOut = item.check_out_date || item.check_out;
          const priceValue = item.total_amount ?? item.total_price ?? null;
          const price = priceValue !== null && priceValue !== undefined ? parseFloat(String(priceValue)) : 0;

          return (
            <View style={styles.card}>
              {/* Header: Nombre y precio */}
              <View style={styles.cardHeader}>
                <View style={styles.namePriceContainer}>
                  <Text style={styles.guestName}>{item.guest_name}</Text>
                  {price > 0 && !isNaN(price) && <Text style={styles.price}>{price.toFixed(2)} €</Text>}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(status) },
                    ]}
                  >
                    {status === 'confirmed'
                      ? 'Confirmada'
                      : status === 'cancelled'
                      ? 'Cancelada'
                      : status === 'completed'
                      ? 'Completada'
                      : status}
                  </Text>
                </View>
              </View>

              {/* Información adicional */}
              <View style={styles.infoContainer}>
                {item.guest_email && (
                  <Text style={styles.infoText}>📧 {item.guest_email}</Text>
                )}
                {item.guest_phone && (
                  <Text style={styles.infoText}>📱 {item.guest_phone}</Text>
                )}
                <Text style={styles.infoText}>
                  🏠 {item.property_name || item.room_id || 'N/A'}
                </Text>
                {checkIn && checkOut && (
                  <Text style={styles.infoText}>
                    📅 {formatDate(checkIn)} - {formatDate(checkOut)}
                  </Text>
                )}
                {item.reservation_code && (
                  <Text style={styles.infoText}>
                    🔖 {item.reservation_code}
                  </Text>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchTerm ? 'No se encontraron reservas' : 'No hay reservas'}
            </Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
      />

      {/* Modal crear reserva */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Reserva</Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <X size={24} color="#6b7280" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Habitación *</Text>
              <View style={styles.pickerContainer}>
                {rooms.map((room) => (
                  <Pressable
                    key={room.id}
                    style={[
                      styles.pickerOption,
                      formData.room_id === String(room.id) && styles.pickerOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, room_id: String(room.id) })}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formData.room_id === String(room.id) && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {room.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Nombre del huésped *</Text>
              <TextInput
                style={styles.input}
                value={formData.guest_name}
                onChangeText={(text) => setFormData({ ...formData, guest_name: text })}
                placeholder="Nombre completo"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.guest_email}
                onChangeText={(text) => setFormData({ ...formData, guest_email: text })}
                placeholder="email@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={formData.guest_phone}
                onChangeText={(text) => setFormData({ ...formData, guest_phone: text })}
                placeholder="+34 600 000 000"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Número de huéspedes</Text>
              <TextInput
                style={styles.input}
                value={formData.guest_count}
                onChangeText={(text) => setFormData({ ...formData, guest_count: text })}
                placeholder="1"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Check-in *</Text>
              <TextInput
                style={styles.input}
                value={formData.check_in}
                onChangeText={(text) => setFormData({ ...formData, check_in: text })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.label}>Check-out *</Text>
              <TextInput
                style={styles.input}
                value={formData.check_out}
                onChangeText={(text) => setFormData({ ...formData, check_out: text })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.label}>Precio total</Text>
              <TextInput
                style={styles.input}
                value={formData.total_price}
                onChangeText={(text) => setFormData({ ...formData, total_price: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCreate]}
                onPress={handleCreate}
                disabled={creating}
              >
                <Text style={styles.modalButtonTextCreate}>
                  {creating ? 'Creando...' : 'Crear'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  searchBox: {
    flex: 1,
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  namePriceContainer: {
    flex: 1,
  },
  guestName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
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
  infoContainer: {
    gap: 6,
  },
  infoText: {
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  pickerOptionSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  pickerOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonCreate: {
    backgroundColor: '#2563eb',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalButtonTextCreate: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
