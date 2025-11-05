import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/contexts/ThemeContext';
import { getDashboardData, DashboardDataResponse } from '@/services/api';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userInfo, userId, accessToken } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data when component loads
  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  const fetchDashboardData = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const data = await getDashboardData(userId, accessToken || undefined);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/login');
  };

  const handleSavingsDetail = () => {
    router.push('/savings-detail');
  };

  const handleLoanDetail = () => {
    router.push('/loan-detail');
  };

  const handlePenaltiesDetail = () => {
    router.push('/penalties-detail');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerContent}>
          <Pressable 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <ThemedView style={styles.headerTextContainer}>
            <ThemedText style={styles.headerTitle}>Dashboard</ThemedText>
            <ThemedText style={styles.welcomeText}>
              Welcome back, {userInfo?.username || 'User'}!
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.placeholder} />
        </ThemedView>
      </ThemedView>

      {/* Main Cards Section */}
      <ThemedView style={styles.cardsContainer}>
        {/* Total Saving Card */}
          <Pressable onPress={handleSavingsDetail}>
            <ThemedView style={[styles.card, { borderColor: colors.primary + '30' }]}>
              <ThemedView style={styles.cardHeader}>
                <Ionicons name="trending-up" size={28} color={colors.primary} />
                <ThemedText style={[styles.cardTitle, { color: colors.primary }]}>TOTAL SAVING</ThemedText>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
              </ThemedView>
              <ThemedView style={styles.cardContent}>
                <ThemedText style={[styles.cardAmount, { color: colors.primary }]}>
                  {isLoading ? 'Loading...' : dashboardData ? `${dashboardData.total_saving?.toLocaleString()} RWF` : '0 RWF'}
                </ThemedText>
                <ThemedText style={styles.cardSubtext}>Lifetime Savings</ThemedText>
                <ThemedText style={[styles.viewDetailText, { color: colors.primary }]}>
                  Tap to view details
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </Pressable>

          {/* Current Loans Card */}
          <Pressable onPress={handleLoanDetail}>
            <ThemedView style={[styles.card, { borderColor: colors.warning + '30' }]}>
              <ThemedView style={styles.cardHeader}>
                <Ionicons name="card" size={28} color={colors.warning} />
                <ThemedText style={[styles.cardTitle, { color: colors.warning }]}>CURRENT LOAN</ThemedText>
                <Ionicons name="chevron-forward" size={18} color={colors.warning} />
              </ThemedView>
              <ThemedView style={styles.cardContent}>
                <ThemedText style={[styles.cardAmount, { color: colors.warning }]}>
                  {isLoading ? 'Loading...' : dashboardData ? `${dashboardData.total_loan?.toLocaleString()} RWF` : '0 RWF'}
                </ThemedText>
                <ThemedText style={styles.cardSubtext}>Active Loan Balance</ThemedText>
                <ThemedText style={[styles.viewDetailText, { color: colors.warning }]}>
                  Tap to view details
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </Pressable>

          {/* Penalty Card */}
          <Pressable onPress={handlePenaltiesDetail}>
            <ThemedView style={[styles.card, { borderColor: colors.error + '30' }]}>
              <ThemedView style={styles.cardHeader}>
                <Ionicons name="warning" size={28} color={colors.error} />
                <ThemedText style={[styles.cardTitle, { color: colors.error }]}>PENALTY</ThemedText>
                <Ionicons name="chevron-forward" size={18} color={colors.error} />
              </ThemedView>
              <ThemedView style={styles.cardContent}>
                <ThemedText style={[styles.cardAmount, { color: colors.error }]}>
                  {isLoading ? 'Loading...' : dashboardData ? `${dashboardData.total_penalties?.toLocaleString()} RWF` : '0 RWF'}
                </ThemedText>
                <ThemedText style={styles.cardSubtext}>Late Payment Fees</ThemedText>
                <ThemedText style={[styles.viewDetailText, { color: colors.error }]}>
                  Tap to view details
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </Pressable>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16,
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
  placeholder: {
    width: 40,
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
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    width: '100%',
    minHeight: 110,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    flex: 1,
    marginLeft: 10,
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  cardAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 32,
  },
  cardSubtext: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  viewDetailText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.8,
  },
});