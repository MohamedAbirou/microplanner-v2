import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function WeekScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>This Week</Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusEmoji}>🎉</Text>
          <Text style={styles.statusText}>Your week is planned!</Text>
          <Text style={styles.statusSubtext}>18/20 tasks completed (90%)</Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>📱</Text>
          <Text style={styles.placeholderTitle}>Mobile App Coming Soon</Text>
          <Text style={styles.placeholderSubtext}>
            Weekly calendar view with your AI-planned tasks
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 24,
    alignItems: 'center',
  },
  statusEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  placeholder: {
    padding: 48,
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
