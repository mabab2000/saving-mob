import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { router } from 'expo-router';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class FCMService {
  /**
   * Request permission for notifications and get Expo Push Token
   * Returns the Expo Push Token in format: ExponentPushToken[...]
   */
  static async getFCMToken(): Promise<string | null> {
    try {
      // For testing: Try to get token even in Expo Go, but handle errors gracefully
      if (Constants.appOwnership === 'expo') {
        console.log('Attempting to get push token in Expo Go (may not work in SDK 53+)...');
      }

      // Request permission first
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return null;
      }

      // Get Expo Push Token (works in both Expo Go and production)
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      
      if (token && token.data) {
        console.log('Expo Push Token obtained:', token.data);
        return token.data;
      } else {
        console.log('Failed to get Expo Push Token');
        return null;
      }
    } catch (error) {
      console.log('Push token generation failed (expected in Expo Go SDK 53+):', (error as Error)?.message);
      // Return null instead of throwing error
      return null;
    }
  }

  /**
   * Check if push notifications are available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Always return true to allow token attempt, handle errors in getFCMToken
      return true;
    } catch (error) {
      console.log('Push notifications not available in current environment');
      return false;
    }
  }

  /**
   * Set up notification listeners for handling incoming notifications
   */
  static setupNotificationListeners() {
    try {
      // Check if we're running in Expo Go (SDK 53+ doesn't support push notifications)
      if (Constants.appOwnership === 'expo') {
        console.log('Notification listeners not available in Expo Go.');
        return { notificationListener: null, responseListener: null };
      }

      // Handle notification received while app is foregrounded
      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

      // Handle notification response (when user taps notification)
      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification tapped:', response);
        
        // Handle navigation based on notification data
        const data = response.notification.request.content.data;
        
        if (data?.screen) {
          // Navigate to specific screen based on notification data
          switch (data.screen) {
            case 'savings':
              router.push('/(tabs)/savings');
              break;
            case 'loans':
              router.push('/(tabs)/loans');
              break;
            case 'home':
            default:
              router.push('/(tabs)');
              break;
          }
        } else {
          // Default navigation to home
          router.push('/(tabs)');
        }
      });

      return {
        notificationListener,
        responseListener,
      };
    } catch (error) {
      console.log('Failed to setup notification listeners:', error);
      return { notificationListener: null, responseListener: null };
    }
  }

  /**
   * Clean up notification listeners
   */
  static removeNotificationListeners(listeners: {
    notificationListener: any;
    responseListener: any;
  }) {
    if (listeners.notificationListener) {
      listeners.notificationListener.remove();
    }
    if (listeners.responseListener) {
      listeners.responseListener.remove();
    }
  }
}