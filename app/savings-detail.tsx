import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/contexts/ThemeContext';
import { getSavingsData, SavingsDataResponse, SavingRecord } from '@/services/api';

export default function SavingsDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userId, accessToken } = useAuth();
  const [savingsData, setSavingsData] = useState<SavingsDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch savings data when component loads
  useEffect(() => {
    if (userId) {
      fetchSavingsData();
    }
  }, [userId]);

  const fetchSavingsData = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const data = await getSavingsData(userId, accessToken || undefined);
      setSavingsData(data);
    } catch (error) {
      console.error('Error fetching savings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const renderSavingItem = ({ item }: { item: SavingRecord }) => (
    <ThemedView style={[styles.tableRow, { borderBottomColor: colors.icon + '40' }]}>
      <ThemedText style={[styles.dateCell, { color: colors.text }]}>
        {new Date(item.created_at).toLocaleDateString()}
      </ThemedText>
      <ThemedText style={[styles.amountCell, { color: colors.primary }]}>
        {item.amount.toLocaleString()} RWF
      </ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ThemedView style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
          Savings Details
        </ThemedText>
        <ThemedView style={styles.placeholder} />
      </ThemedView>

      {/* Summary Card */}
      <ThemedView style={[styles.summaryCard, { borderColor: colors.primary }]}>
        <ThemedView style={styles.summaryHeader}>
          <Ionicons name="trending-up" size={32} color={colors.primary} />
          <ThemedText style={[styles.summaryTitle, { color: colors.primary }]}>Total Savings</ThemedText>
        </ThemedView>
        <ThemedText style={[styles.summaryAmount, { color: colors.primary }]}>
          {isLoading ? 'Loading...' : savingsData ? `${savingsData.total_amount?.toLocaleString()} RWF` : '0 RWF'}
        </ThemedText>
      </ThemedView>

      {/* Table Header */}
      <ThemedView style={[styles.tableHeader, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.headerCell, { color: colors.text }]}>Date</ThemedText>
        <ThemedText style={[styles.headerCell, { color: colors.text }]}>Amount</ThemedText>
      </ThemedView>

      {/* Savings List */}
      <FlatList
        data={savingsData?.savings || []}
        renderItem={renderSavingItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E5E5',
  },
  headerCell: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  dateCell: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  amountCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});