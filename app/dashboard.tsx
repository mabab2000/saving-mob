import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/contexts/ThemeContext';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userInfo, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(tabs)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerContent}>
          <ThemedView>
            <ThemedText style={styles.headerTitle}>Dashboard</ThemedText>
            <ThemedText style={styles.welcomeText}>
              Welcome back, {userInfo?.username || 'User'}!
            </ThemedText>
          </ThemedView>
          <Pressable 
            style={[styles.logoutButton, { backgroundColor: colors.error + '20' }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
          </Pressable>
        </ThemedView>
      </ThemedView>

      {/* Main Cards Section */}
      <ThemedView style={styles.content}>
        <ThemedView style={styles.cardsContainer}>
          {/* Total Saving Card */}
          <ThemedView style={[styles.card, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
            <ThemedView style={styles.cardHeader}>
              <Ionicons name="trending-up" size={40} color={colors.primary} />
              <ThemedText style={[styles.cardTitle, { color: colors.primary }]}>TOTAL SAVING</ThemedText>
            </ThemedView>
            <ThemedView style={styles.cardContent}>
              <ThemedText style={[styles.cardAmount, { color: colors.primary }]}>
                25,340 RWF
              </ThemedText>
              <ThemedText style={styles.cardSubtext}>Lifetime Savings</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Current Loans Card */}
          <ThemedView style={[styles.card, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '30' }]}>
            <ThemedView style={styles.cardHeader}>
              <Ionicons name="card" size={40} color={colors.warning} />
              <ThemedText style={[styles.cardTitle, { color: colors.warning }]}>CURRENT LOAN</ThemedText>
            </ThemedView>
            <ThemedView style={styles.cardContent}>
              <ThemedText style={[styles.cardAmount, { color: colors.warning }]}>
                8,500 RWF
              </ThemedText>
              <ThemedText style={styles.cardSubtext}>Active Loan Balance</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Penalty Card */}
          <ThemedView style={[styles.card, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}>
            <ThemedView style={styles.cardHeader}>
              <Ionicons name="warning" size={40} color={colors.error} />
              <ThemedText style={[styles.cardTitle, { color: colors.error }]}>PENALTY</ThemedText>
            </ThemedView>
            <ThemedView style={styles.cardContent}>
              <ThemedText style={[styles.cardAmount, { color: colors.error }]}>
                1,200 RWF
              </ThemedText>
              <ThemedText style={styles.cardSubtext}>Late Payment Fees</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  logoutButton: {
    padding: 12,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    gap: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 28,
    width: '100%',
    minHeight: 180,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  cardAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
    lineHeight: 56,
  },
  cardSubtext: {
    fontSize: 18,
    opacity: 0.7,
    fontWeight: '500',
  },
});