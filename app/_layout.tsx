import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider, useColorScheme } from '@/contexts/ThemeContext';
import { FCMService } from '@/services/fcm';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutInner() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Setup global notification listeners
    let listeners: any = null;
    try {
      listeners = FCMService.setupNotificationListeners();
    } catch (error) {
      console.log('Failed to setup global notification listeners:', error);
    }
    
    return () => {
      if (listeners) {
        try {
          FCMService.removeNotificationListeners(listeners);
        } catch (error) {
          console.log('Failed to remove global notification listeners:', error);
        }
      }
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="phone-verification" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="savings-detail" options={{ headerShown: false }} />
        <Stack.Screen name="loan-detail" options={{ headerShown: false }} />
        <Stack.Screen name="penalties-detail" options={{ headerShown: false }} />
        <Stack.Screen name="payment-detail" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <RootLayoutInner />
      </AuthProvider>
    </CustomThemeProvider>
  );
}
