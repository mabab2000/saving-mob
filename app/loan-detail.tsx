import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/contexts/ThemeContext';
import { getLoansData, LoansDataResponse, LoanRecord } from '@/services/api';

export default function LoanDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userId, accessToken } = useAuth();
  const [loansData, setLoansData] = useState<LoansDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch loans data when component loads
  useEffect(() => {
    if (userId) {
      fetchLoansData();
    }
  }, [userId]);

  const fetchLoansData = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const data = await getLoansData(userId, accessToken || undefined);
      setLoansData(data);
    } catch (error) {
      console.error('Error fetching loans data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleViewPayment = (loanId: string) => {
    router.push({
      pathname: '/payment-detail',
      params: { loanId }
    });
  };

  const formatMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getLoanStatus = (deadline: string): 'active' | 'overdue' => {
    const deadlineDate = new Date(deadline);
    const currentDate = new Date();
    return deadlineDate < currentDate ? 'overdue' : 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.warning;
      case 'overdue':
        return colors.error;
      case 'paid':
        return colors.success;
      default:
        return colors.text;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'overdue':
        return 'Overdue';
      case 'paid':
        return 'Paid';
      default:
        return status;
    }
  };

  const renderLoanItem = ({ item }: { item: LoanRecord }) => {
    const status = getLoanStatus(item.deadline);
    return (
      <ThemedView style={[styles.tableRow, { borderBottomColor: colors.icon + '40' }]}>
        <ThemedText style={[styles.dateCell, { color: colors.text }]}>
          {formatMonthYear(item.issued_date)}
        </ThemedText>
        <ThemedText style={[styles.dateCell, { color: colors.text }]}>
          {formatMonthYear(item.deadline)}
        </ThemedText>
        <ThemedText style={[styles.amountCell, { color: colors.warning }]}>
          {item.amount.toLocaleString()} RWF
        </ThemedText>
        <ThemedText style={[styles.statusCell, { color: getStatusColor(status) }]}>
          {getStatusText(status)}
        </ThemedText>
        <Pressable 
          style={styles.viewButton}
          onPress={() => handleViewPayment(item.id)}
        >
          <Ionicons name="eye" size={16} color={colors.primary} />
        </Pressable>
      </ThemedView>
    );
  };

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
          Loan Details
        </ThemedText>
        <ThemedView style={styles.placeholder} />
      </ThemedView>

      {/* Summary Card */}
      <ThemedView style={[styles.summaryCard, { borderColor: colors.warning }]}>
        <ThemedView style={styles.summaryHeader}>
          <Ionicons name="card" size={32} color={colors.warning} />
          <ThemedText style={[styles.summaryTitle, { color: colors.warning }]}>Current Loan</ThemedText>
        </ThemedView>
        <ThemedText style={[styles.summaryAmount, { color: colors.warning }]}>
          {isLoading ? 'Loading...' : loansData ? `${loansData.total_amount?.toLocaleString()} RWF` : '0 RWF'}
        </ThemedText>
      </ThemedView>

      {/* Table Header */}
      <ThemedView style={[styles.tableHeader, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.headerCell, { color: colors.text }]}>Issue Date</ThemedText>
        <ThemedText style={[styles.headerCell, { color: colors.text }]}>Deadline</ThemedText>
        <ThemedText style={[styles.headerCell, { color: colors.text }]}>Amount</ThemedText>
        <ThemedText style={[styles.headerCell, { color: colors.text }]}>Status</ThemedText>
        <ThemedText style={[styles.headerCell, { color: colors.text }]}>View</ThemedText>
      </ThemedView>

      {/* Loans List */}
      <FlatList
        data={loansData?.loans || []}
        renderItem={renderLoanItem}
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
  deadlineText: {
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
    alignItems: 'center',
  },
  dateCell: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
  },
  amountCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  viewButton: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
});