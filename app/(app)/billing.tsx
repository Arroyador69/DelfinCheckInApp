// =====================================================
// FACTURACIÓN - Gestión de facturación
// =====================================================

import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function BillingScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Facturación</Text>
        <Text style={styles.subtitle}>Gestión de facturación</Text>
        <Text style={styles.description}>
          Aquí podrás gestionar tu facturación, igual que en el admin web.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
    alignItems: 'center',
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
    textAlign: 'center',
  },
});

