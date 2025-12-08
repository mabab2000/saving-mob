import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export class FCMService {
  /**
   * Request permission for notifications and get FCM token
   * Returns null if running in Expo Go or if permissions are denied
   */
  static async getFCMToken(): Promise<string | null> {
    try {
      // Check if we're running in Expo Go
      if (Constants.appOwnership === 'expo') {
        console.log('Running in Expo Go - FCM tokens not supported. Use development build for full functionality.');
        return null;
      }

      // Request permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('FCM permission not granted');
        return null;
      }

      // Get push token for FCM
      const token = await Notifications.getExpoPushTokenAsync();
      
      console.log('Expo Push Token obtained:', token.data ? 'Success' : 'Failed');
      return token.data;
    } catch (error) {
      console.log('FCM token generation not available in current environment:', (error as Error)?.message);
      return null;
    }
  }

  /**
   * Check if FCM is available and working
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Check if we're running in Expo Go
      if (Constants.appOwnership === 'expo') {
        return false;
      }
      
      await Notifications.getPermissionsAsync();
      return true;
    } catch (error) {
      console.log('FCM not available in current environment');
      return false;
    }
  }
}