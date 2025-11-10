// =====================================================
// FACTURACIÓN (Stub inicial)
// =====================================================

import { View, Text, StyleSheet } from 'react-native';

export default function InvoicesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Facturación</Text>
        <Text style={styles.subtitle}>
          Este módulo estará disponible próximamente
        </Text>
        <Text style={styles.description}>
          Aquí podrás gestionar tus facturas SIF y generar documentos fiscales.
        </Text>
      </View>
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
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
});

