import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/contexts/ThemeContext';
import { getPaymentsData, PaymentsDataResponse, PaymentRecord } from '@/services/api';

export default function PaymentDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { loanId } = useLocalSearchParams();
  const { accessToken } = useAuth();
  const [paymentsData, setPaymentsData] = useState<PaymentsDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch payments data when component loads
  useEffect(() => {
    if (loanId && typeof loanId === 'string') {
      fetchPaymentsData();
    }
  }, [loanId]);

  const fetchPaymentsData = async () => {
    if (!loanId || typeof loanId !== 'string') return;
    
    try {
      setIsLoading(true);
      const data = await getPaymentsData(loanId, accessToken || undefined);
      setPaymentsData(data);
    } catch (error) {
      console.error('Error fetching payments data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const renderPaymentItem = ({ item }: { item: PaymentRecord }) => (
    <ThemedView style={[styles.tableRow, { borderBottomColor: colors.icon + '40' }]}>
      <ThemedText style={[styles.dateCell, { color: colors.text }]}>
        {new Date(item.created_at).toLocaleDateString()}
      </ThemedText>
      <ThemedText style={[styles.amountCell, { color: colors.primary }]}>
        {item.amount.toLocaleString()} RWF
      </ThemedText>
      <ThemedText style={[styles.statusCell, { color: getStatusColor('completed') }]}>
        {getStatusText('completed')}
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
          Payment History
        </ThemedText>
        <ThemedView style={styles.placeholder} />
      </ThemedView>

      {/* Summary Card */}
      <ThemedView style={[styles.summaryCard, { borderColor: colors.primary }]}>
        <ThemedView style={styles.summaryHeader}>
          <Ionicons name="card" size={32} color={colors.primary} />
          <ThemedText style={[styles.summaryTitle, { color: colors.primary }]}>Total Paid</ThemedText>
        </ThemedView>
        <ThemedText style={[styles.summaryAmount, { color: colors.primary }]}>
          {isLoading ? 'Loading...' : paymentsData ? `${paymentsData.total_amount?.toLocaleString()} RWF` : '0 RWF'}
        </ThemedText>
        <ThemedText style={[styles.subtitleText, { color: colors.text }]}>
          Loan ID: {loanId}
        </ThemedText>
      </ThemedView>

      {/* Table Header */}
      <ThemedView style={[styles.tableHeader, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.headerCell, { color: colors.text }]}>Pay Date</ThemedText>
        <ThemedText style={[styles.headerCell, { color: colors.text }]}>Amount</ThemedText>
        <ThemedText style={[styles.headerCell, { color: colors.text }]}>Status</ThemedText>
      </ThemedView>

      {/* Payments List */}
      <FlatList
        data={paymentsData?.payments || []}
        renderItem={renderPaymentItem}
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
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    opacity: 0.7,
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
    fontSize: 14,
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
  statusCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});