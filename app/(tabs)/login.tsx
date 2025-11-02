import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const [userId, setUserId] = useState('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSubmit = () => {
    if (!userId.trim()) {
      Alert.alert('Error', 'Please enter your User ID');
      return;
    }
    
    // Here you would typically handle the login logic
    Alert.alert('Success', `Welcome, User ID: ${userId}`, [
      { text: 'OK', onPress: () => setUserId('') }
    ]);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={[styles.scrollContainer, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>Welcome Back</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Sign in to your account</ThemedText>
        </ThemedView>

        {/* Login Form */}
        <ThemedView style={styles.formContainer}>
          <ThemedView style={[styles.formCard, { borderColor: colors.icon + '20' }]}>
            <ThemedView style={styles.inputSection}>
              <ThemedText style={styles.inputLabel}>User ID</ThemedText>
              <ThemedView style={[styles.inputContainer, { borderColor: colors.icon + '30', backgroundColor: colors.background }]}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={colors.icon} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  value={userId}
                  onChangeText={setUserId}
                  placeholder="Enter your User ID"
                  placeholderTextColor={colors.icon}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </ThemedView>
            </ThemedView>

            {/* Submit Button */}
            <Pressable
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <ThemedView style={styles.buttonContent}>
                <ThemedText style={styles.submitButtonText}>Sign In</ThemedText>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </ThemedView>
            </Pressable>

            {/* Additional Options */}
            <ThemedView style={styles.optionsContainer}>
              <Pressable style={styles.optionButton}>
                <Ionicons name="finger-print" size={24} color={colors.primary} />
                <ThemedText style={styles.optionText}>Use Biometric</ThemedText>
              </Pressable>
              
              <ThemedView style={[styles.divider, { backgroundColor: colors.icon + '30' }]} />
              
              <Pressable style={styles.optionButton}>
                <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
                <ThemedText style={styles.optionText}>Forgot User ID?</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Security Notice */}
        <ThemedView style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <ThemedText style={styles.securityText}>
            Your data is protected with bank-level security
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    marginBottom: 40,
  },
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 30,
  },
  inputSection: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
    overflow: 'hidden',
    marginBottom: 30,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsContainer: {
    gap: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: 40,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
});