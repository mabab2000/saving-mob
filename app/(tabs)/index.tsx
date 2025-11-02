import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { phoneNumber } = useAuth();

  // Format phone number for display
  const formatPhoneForDisplay = (phone: string | null) => {
    if (!phone) return '';
    // For Rwanda numbers (+250123456789), show +250****6789
    if (phone.startsWith('+250') && phone.length >= 13) {
      return `+250****${phone.slice(-3)}`;
    }
    return phone.length > 10 ? `${phone.slice(0, 4)}****${phone.slice(-3)}` : phone;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>SAVING</ThemedText>
        {phoneNumber && (
          <ThemedText style={styles.welcomeText}>
            Welcome, {formatPhoneForDisplay(phoneNumber)}
          </ThemedText>
        )}
      </ThemedView>

      {/* Main Content */}
      <ThemedView style={styles.content}>
        {/* Profile Image Section */}
        <ThemedView style={styles.profileSection}>
          <View style={styles.imageContainer}>
            <Image
              source={require('@/assets/images/image.jpg')}
              style={styles.profileImage}
              contentFit="cover"
            />
          </View>
          
          {/* Money Display */}
          <ThemedView style={styles.moneySection}>
            <ThemedText style={styles.currencyText}>Total Balance</ThemedText>
            <ThemedText style={[styles.moneyAmount, { color: colors.primary }]}>
              5,000 RWF
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.quickActions}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          
          <ThemedView style={styles.actionGrid}>
            <ThemedView style={[styles.actionCard, { borderColor: colors.icon + '20' }]}>
              <ThemedView style={styles.actionContent}>
                <Ionicons name="analytics" size={32} color={colors.savings} />
                <ThemedText style={styles.actionText}>History</ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={[styles.actionCard, { borderColor: colors.icon + '20' }]}>
              <ThemedView style={styles.actionContent}>
                <Ionicons name="card" size={32} color={colors.warning} />
                <ThemedText style={styles.actionText}>Loans</ThemedText>
                <ThemedText style={[styles.loanAmount, { color: colors.warning }]}>
                  400 RWF
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Recent Transactions */}
        <ThemedView style={styles.transactionsSection}>
          <ThemedText style={styles.sectionTitle}>Recent Transactions</ThemedText>
          
          <ThemedView style={[styles.transactionCard, { borderColor: colors.icon + '15' }]}>
            <ThemedView style={[styles.transactionIcon, { backgroundColor: colors.icon + '15' }]}>
              <Ionicons name="add-circle" size={24} color={colors.income} />
            </ThemedView>
            <ThemedView style={styles.transactionDetails}>
              <ThemedText style={styles.transactionTitle}>Deposit</ThemedText>
              <ThemedText style={styles.transactionDate}>Today, 2:30 PM</ThemedText>
            </ThemedView>
            <ThemedText style={[styles.transactionAmount, { color: colors.income }]}>
              +1,500 RWF
            </ThemedText>
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
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  imageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75, // 50% border radius
  },
  moneySection: {
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  moneyAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  quickActions: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    width: (screenWidth - 52) / 2, // Account for padding and gap
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionContent: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  loanAmount: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  transactionsSection: {
    marginBottom: 40,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
