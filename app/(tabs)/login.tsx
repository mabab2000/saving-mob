import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/contexts/ThemeContext';
import { loginById } from '@/services/api';

export default function LoginScreen() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [savedUserId, setSavedUserId] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { setLoggedIn } = useAuth();

  // Check biometric availability and saved credentials on component mount
  useEffect(() => {
    checkBiometricAvailability();
    loadSavedCredentials();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const loadSavedCredentials = async () => {
    try {
      // Check if user has previously enabled biometric login
      // First check our biometric-specific key
      let savedId = await AsyncStorage.getItem('biometric_user_id');
      
      // If not found, check the existing userId from AuthContext
      if (!savedId) {
        savedId = await AsyncStorage.getItem('userId');
      }
      
      console.log('Biometric login - checking saved credentials:', { savedId });
      
      if (savedId) {
        setSavedUserId(savedId);
        console.log('Biometric login - found saved user ID:', savedId.substring(0, 8) + '...');
      } else {
        console.log('Biometric login - no saved credentials found');
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  const saveBiometricCredentials = async (userIdToSave: string) => {
    try {
      // Save to biometric-specific key for future use
      await AsyncStorage.setItem('biometric_user_id', userIdToSave);
      console.log('Biometric login - saved user ID for future biometric use:', userIdToSave.substring(0, 8) + '...');
    } catch (error) {
      console.error('Error saving biometric credentials:', error);
    }
  };

  const handleBiometricLogin = async () => {
    console.log('Biometric login attempt - checking prerequisites...', {
      biometricAvailable,
      savedUserId,
      loading
    });

    if (!biometricAvailable) {
      Alert.alert(
        'Biometric Not Available',
        'Biometric authentication is not available on this device or not set up.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!savedUserId) {
      console.log('Biometric login - no saved user ID found');
      Alert.alert(
        'No Saved Credentials',
        'Please log in with your User ID first to enable biometric authentication.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      console.log('Biometric login - starting authentication...');
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your SAVING account',
        fallbackLabel: 'Use User ID instead',
        cancelLabel: 'Cancel',
      });

      console.log('Biometric authentication result:', result);

      if (result.success) {
        console.log('Biometric authentication successful, logging in with saved ID:', savedUserId.substring(0, 8) + '...');
        
        // Use saved user ID for login
        const response = await loginById(savedUserId);
        await setLoggedIn(response.access_token, response.user_info);
        
        Alert.alert(
          'Success', 
          `Welcome back, ${response.user_info.username}!`,
          [{ 
            text: 'Continue', 
            onPress: () => router.replace('/dashboard')
          }]
        );
      } else {
        console.log('Biometric authentication cancelled or failed:', result);
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      Alert.alert(
        'Authentication Failed',
        'Unable to authenticate with biometrics. Please try again or use your User ID.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userId.trim()) {
      Alert.alert('Error', 'Please enter your User ID');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the login API
      const response = await loginById(userId.trim());
      
      // Store the login data
      await setLoggedIn(response.access_token, response.user_info);
      
      // Ask if user wants to enable biometric login for future
      if (biometricAvailable && !savedUserId) {
        Alert.alert(
          'Enable Biometric Login?',
          'Would you like to use biometric authentication for faster login next time?',
          [
            { text: 'Not Now', style: 'cancel' },
            { 
              text: 'Enable', 
              onPress: async () => {
                await saveBiometricCredentials(userId.trim());
                setSavedUserId(userId.trim());
              }
            }
          ]
        );
      }
      
      // Show success message
      Alert.alert(
        'Success', 
        `Welcome back, ${response.user_info.username}!`,
        [
          { 
            text: 'Continue', 
            onPress: () => {
              // Navigate to dashboard
              router.replace('/dashboard');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed', 
        error instanceof Error ? error.message : 'Unable to sign in. Please check your User ID and try again.'
      );
    } finally {
      setLoading(false);
    }
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
              style={[
                styles.submitButton, 
                { 
                  backgroundColor: loading ? colors.icon + '50' : colors.primary,
                  opacity: loading ? 0.7 : 1,
                }
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <ThemedView style={styles.buttonContent}>
                <ThemedText style={[styles.submitButtonText, { color: colorScheme === 'light' ? 'black' : 'white' }]}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </ThemedText>
                {!loading && <Ionicons name="arrow-forward" size={20} color={colorScheme === 'light' ? 'black' : 'white'} />}
                {loading && <Ionicons name="refresh" size={20} color={colorScheme === 'light' ? 'black' : 'white'} />}
              </ThemedView>
            </Pressable>

            {/* Additional Options */}
            <ThemedView style={styles.optionsContainer}>
              <Pressable 
                style={[
                  styles.optionButton,
                  !biometricAvailable && styles.disabledOption
                ]}
                onPress={handleBiometricLogin}
                disabled={!biometricAvailable || loading}
              >
                <Ionicons 
                  name="finger-print" 
                  size={24} 
                  color={biometricAvailable ? colors.primary : colors.icon} 
                />
                <ThemedText style={[
                  styles.optionText,
                  !biometricAvailable && { color: colors.icon, opacity: 0.5 }
                ]}>
                  {!biometricAvailable 
                    ? 'Biometric Not Available' 
                    : savedUserId 
                      ? 'Use Biometric Login' 
                      : 'Setup Biometric Login'
                  }
                </ThemedText>
                {savedUserId && (
                  <ThemedText style={[styles.savedUserHint, { color: colors.icon }]}>
                    (ID: {savedUserId.substring(0, 8)}...)
                  </ThemedText>
                )}
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
  disabledOption: {
    opacity: 0.5,
  },
  savedUserHint: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
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