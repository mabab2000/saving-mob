import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/contexts/ThemeContext';
import { getPenaltiesData, PenaltiesDataResponse, PenaltyRecord } from '@/services/api';

export default function PenaltiesDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userId, accessToken } = useAuth();
  const [penaltiesData, setPenaltiesData] = useState<PenaltiesDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch penalties data when component loads
  useEffect(() => {
    if (userId) {
      fetchPenaltiesData();
    }
  }, [userId]);

  const fetchPenaltiesData = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const data = await getPenaltiesData(userId, accessToken || undefined);
      setPenaltiesData(data);
    } catch (error) {
      console.error('Error fetching penalties data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const formatDateDDMMYYYY = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid':
        return colors.error;
      case 'paid':
        return colors.success;
      default:
        return colors.text;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'unpaid':
        return 'Unpaid';
      case 'paid':
        return 'Paid';
      default:
        return status;
    }
  };

  const renderPenaltyItem = ({ item }: { item: PenaltyRecord }) => (
    <ThemedView style={[styles.tableRow, { borderBottomColor: colors.icon + '40' }]}>
      <ThemedText style={[styles.dateCell, { color: colors.text }]}>
        {formatDateDDMMYYYY(item.created_at)}
      </ThemedText>
      <ThemedText style={[styles.reasonCell, { color: colors.text }]} numberOfLines={2}>
        {item.reason}
      </ThemedText>
      <ThemedText style={[styles.amountCell, { color: colors.error }]}>
        {item.amount.toLocaleString()} RWF
      </ThemedText>
      <ThemedText style={[styles.statusCell, { color: getStatusColor(item.status) }]}>
        {getStatusText(item.status)}
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
          Penalties Details
        </ThemedText>
        <ThemedView style={styles.placeholder} />
      </ThemedView>

      {/* Summary Card */}
      <ThemedView style={[styles.summaryCard, { borderColor: colors.error }]}>
        <ThemedView style={styles.summaryHeader}>
          <Ionicons name="warning" size={32} color={colors.error} />
          <ThemedText style={[styles.summaryTitle, { color: colors.error }]}>Penalties Overview</ThemedText>
        </ThemedView>
        <ThemedView style={styles.summaryStats}>
          <ThemedView style={styles.statItem}>
            <ThemedText style={[styles.statAmount, { color: colors.error }]}>
              {isLoading ? 'Loading...' : penaltiesData ? `${penaltiesData.total_unpaid?.toLocaleString()} RWF` : '0 RWF'}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.text }]}>
              Unpaid ({penaltiesData?.penalties?.filter(p => p.status === 'unpaid').length || 0})
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={[styles.statAmount, { color: colors.success }]}>
              {isLoading ? 'Loading...' : penaltiesData ? `${penaltiesData.total_paid?.toLocaleString()} RWF` : '0 RWF'}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.text }]}>
              Paid ({penaltiesData?.penalties?.filter(p => p.status === 'paid').length || 0})
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Table Header */}
      <ThemedView style={[styles.tableHeader, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.headerCell, { color: colors.text }]}>Date</ThemedText>
        <ThemedText style={[styles.headerCell, { color: colors.text }]}>Reason</ThemedText>
        <ThemedText style={[styles.headerCell, { color: colors.text }]}>Amount</ThemedText>
        <ThemedText style={[styles.headerCell, { color: colors.text }]}>Status</ThemedText>
      </ThemedView>

      {/* Penalties List */}
      <FlatList
        data={penaltiesData?.penalties || []}
        renderItem={renderPenaltyItem}
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
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
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
    fontSize: 12,
    textAlign: 'center',
  },
  reasonCell: {
    flex: 1.5,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 4,
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
});