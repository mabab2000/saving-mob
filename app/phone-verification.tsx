import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { verifyPhoneNumber } from '@/services/api';

export default function PhoneVerificationScreen() {
  const [phoneNumber, setPhoneNumber] = useState('+250 ');
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { setVerified } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Remove spaces and check if it has exactly 9 digits after +250
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    const rwandaPhoneRegex = /^\+250\d{9}$/;
    
    if (!rwandaPhoneRegex.test(cleanPhone)) {
      Alert.alert('Error', 'Please enter a valid Rwanda phone number (9 digits after +250)');
      return;
    }

    setIsLoading(true);

    try {
      // Call the verification endpoint with clean phone number
      const data = await verifyPhoneNumber(cleanPhone);

      if (data.exists) {
        // Phone number exists and is registered
        await setVerified(cleanPhone, data.user_id);
        
        Alert.alert(
          'Success', 
          `Phone number ${data.message}`,
          [
            { 
              text: 'Continue', 
              onPress: () => {
                setIsLoading(false);
                router.replace('/(tabs)');
              }
            }
          ]
        );
      } else {
        // Phone number not found
        setIsLoading(false);
        Alert.alert(
          'Verification fail', 
          'This phone number is not verfied. Please contact support +250783857284.',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      setIsLoading(false);
      console.error('Phone verification error:', error);
      Alert.alert(
        'Connection Error', 
        'Unable to verify phone number. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-numeric characters except +
    let cleaned = text.replace(/[^\d+]/g, '');
    
    // Always ensure it starts with +250
    if (cleaned.length === 0 || cleaned === '+') {
      return '+250 ';
    }
    
    if (!cleaned.startsWith('+250')) {
      if (cleaned.startsWith('250')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('0')) {
        cleaned = '+250' + cleaned.slice(1);
      } else if (cleaned.length > 0) {
        // If user types digits without country code, prepend +250
        cleaned = '+250' + cleaned.replace(/^\+/, '');
      }
    }
    
    // Ensure we don't go below +250
    if (cleaned.length < 4) {
      return '+250 ';
    }
    
    // Limit to +250 + 9 digits maximum
    if (cleaned.length > 13) {
      cleaned = cleaned.slice(0, 13);
    }
    
    // Format for display: +250 123 456 789
    if (cleaned.length <= 4) return cleaned + ' ';
    if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    if (cleaned.length <= 10) return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10)}`;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="call" size={48} color={colors.primary} />
          </ThemedView>
          <ThemedText style={styles.headerTitle}>Welcome to SAVING</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Enter your registered phone number to access your account. Only verified phone numbers can be used.
          </ThemedText>
        </ThemedView>

        {/* Phone Input Form */}
        <ThemedView style={styles.formContainer}>
          <ThemedView style={[styles.formCard, { borderColor: colors.icon + '20' }]}>
            <ThemedView style={styles.inputSection}>
              <ThemedText style={styles.inputLabel}>Phone Number</ThemedText>
              <ThemedView style={[styles.inputContainer, { borderColor: colors.icon + '30', backgroundColor: colors.background }]}>
                <Ionicons 
                  name="call-outline" 
                  size={20} 
                  color={colors.icon} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  placeholder="+250 123 456 789"
                  placeholderTextColor={colors.icon}
                  keyboardType="phone-pad"
                  autoFocus={true}
                  maxLength={17} // +250 123 456 789 = 17 characters with spaces
                />
              </ThemedView>
              <ThemedText style={styles.helperText}>
                Enter 9 digits after +250 (Rwanda country code)
              </ThemedText>
            </ThemedView>

            {/* Submit Button */}
            <Pressable
              style={[
                styles.submitButton, 
                { 
                  backgroundColor: isLoading ? colors.icon + '50' : colors.primary,
                  opacity: isLoading ? 0.7 : 1
                }
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <ThemedView style={styles.buttonContent}>
                {isLoading ? (
                  <>
                    <ThemedText style={styles.submitButtonText}>Verifying...</ThemedText>
                    <Ionicons name="sync" size={20} color="white" />
                  </>
                ) : (
                  <>
                    <ThemedText style={styles.submitButtonText}>Verify Phone</ThemedText>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </ThemedView>
            </Pressable>
          </ThemedView>
        </ThemedView>

        {/* Security Notice */}
        <ThemedView style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <ThemedText style={styles.securityText}>
            Your phone number is verified against our secure database
          </ThemedText>
        </ThemedView>

        {/* Privacy Notice */}
        <ThemedView style={styles.privacyNotice}>
          <ThemedText style={styles.privacyText}>
            Only registered phone numbers can access the app. 
            Contact support if your number is not recognized.
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
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
  helperText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
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
  privacyNotice: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  privacyText: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 16,
  },
});