// =====================================================
// AJUSTES
// =====================================================

import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)');
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{session?.user.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nombre:</Text>
          <Text style={styles.infoValue}>{session?.user.fullName || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tenant:</Text>
          <Text style={styles.infoValue}>{session?.user.tenant.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Plan:</Text>
          <Text style={styles.infoValue}>{session?.user.tenant.planId}</Text>
        </View>
      </View>

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Cerrar Sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

