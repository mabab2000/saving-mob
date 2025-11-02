import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/contexts/ThemeContext';
import { createSaving } from '@/services/api';

interface CreateSavingModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateSavingModal({ visible, onClose, onSuccess }: CreateSavingModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userInfo } = useAuth();

  const handleSubmit = async () => {
    if (!amount.trim()) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0');
      return;
    }

    if (!userInfo?.id) {
      Alert.alert('Error', 'User not logged in. Please login again.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await createSaving({
        user_id: userInfo.id,
        amount: amountNumber,
        description: description.trim() || undefined
      });
      
      Alert.alert(
        'Success!', 
        `Saving created successfully!\nAmount: ${amountNumber} RWF${response.current_balance ? `\nNew Balance: ${response.current_balance} RWF` : ''}`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              setAmount('');
              setDescription('');
              onSuccess();
              onClose();
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Create saving error:', error);
      Alert.alert(
        'Failed to Create Saving', 
        error instanceof Error ? error.message : 'Unable to create saving. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>Create Saving</ThemedText>
          <Pressable 
            style={[styles.closeButton, { backgroundColor: colors.icon + '20' }]}
            onPress={handleClose}
            disabled={loading}
          >
            <Ionicons name="close" size={24} color={colors.icon} />
          </Pressable>
        </ThemedView>

        {/* Form */}
        <ThemedView style={styles.form}>
          {/* Amount Input */}
          <ThemedView style={styles.inputSection}>
            <ThemedText style={styles.inputLabel}>Amount (RWF)</ThemedText>
            <ThemedView style={[styles.inputContainer, { borderColor: colors.icon + '30', backgroundColor: colors.background }]}>
              <Ionicons 
                name="wallet-outline" 
                size={20} 
                color={colors.icon} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount to save"
                placeholderTextColor={colors.icon}
                keyboardType="numeric"
                editable={!loading}
              />
            </ThemedView>
          </ThemedView>

          {/* Description Input */}
          <ThemedView style={styles.inputSection}>
            <ThemedText style={styles.inputLabel}>Description (Optional)</ThemedText>
            <ThemedView style={[styles.inputContainer, { borderColor: colors.icon + '30', backgroundColor: colors.background }]}>
              <Ionicons 
                name="document-text-outline" 
                size={20} 
                color={colors.icon} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={description}
                onChangeText={setDescription}
                placeholder="What are you saving for?"
                placeholderTextColor={colors.icon}
                multiline
                numberOfLines={2}
                editable={!loading}
              />
            </ThemedView>
          </ThemedView>

          {/* Submit Button */}
          <Pressable
            style={[
              styles.submitButton, 
              { 
                backgroundColor: loading ? colors.icon + '50' : colors.success,
                opacity: loading ? 0.7 : 1,
              }
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <ThemedView style={styles.buttonContent}>
              <ThemedText style={[styles.submitButtonText, { color: colorScheme === 'light' ? 'black' : 'white' }]}>
                {loading ? 'Creating Saving...' : 'Create Saving'}
              </ThemedText>
              {!loading && <Ionicons name="add-circle" size={20} color={colorScheme === 'light' ? 'black' : 'white'} />}
              {loading && <Ionicons name="refresh" size={20} color={colorScheme === 'light' ? 'black' : 'white'} />}
            </ThemedView>
          </Pressable>
        </ThemedView>

        {/* Info Notice */}
        <ThemedView style={styles.infoNotice}>
          <Ionicons name="information-circle" size={16} color={colors.primary} />
          <ThemedText style={styles.infoText}>
            Your saving will be added to your account balance
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
});