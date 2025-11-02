import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isVerified: boolean;
  phoneNumber: string | null;
  userId: string | null;
  accessToken: string | null;
  userInfo: any | null;
  isLoading: boolean;
  setVerified: (phoneNumber: string, userId?: string) => Promise<void>;
  setLoggedIn: (accessToken: string, userInfo: any) => Promise<void>;
  logout: () => Promise<void>;
  logoutCompletely: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [verifiedStatus, storedPhoneNumber, storedUserId, storedAccessToken, storedUserInfo] = await Promise.all([
        AsyncStorage.getItem('isUserVerified'),
        AsyncStorage.getItem('userPhoneNumber'),
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('userInfo')
      ]);

      if (verifiedStatus === 'true' && storedPhoneNumber) {
        setIsVerified(true);
        setPhoneNumber(storedPhoneNumber);
        setUserId(storedUserId);
        setAccessToken(storedAccessToken);
        setUserInfo(storedUserInfo ? JSON.parse(storedUserInfo) : null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setVerified = async (phone: string, userIdParam?: string) => {
    try {
      await AsyncStorage.setItem('isUserVerified', 'true');
      await AsyncStorage.setItem('userPhoneNumber', phone);
      if (userIdParam) {
        await AsyncStorage.setItem('userId', userIdParam);
      }
      setIsVerified(true);
      setPhoneNumber(phone);
      setUserId(userIdParam || null);
    } catch (error) {
      console.error('Error setting verification status:', error);
      throw error;
    }
  };

  const setLoggedIn = async (token: string, userInfoData: any) => {
    try {
      await AsyncStorage.setItem('accessToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfoData));
      setAccessToken(token);
      setUserInfo(userInfoData);
    } catch (error) {
      console.error('Error setting login status:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Dashboard logout: Only remove user session data, keep phone number
      await AsyncStorage.multiRemove(['userId', 'accessToken', 'userInfo']);
      setUserId(null);
      setAccessToken(null);
      setUserInfo(null);
      // Keep isVerified and phoneNumber for easy re-login
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const logoutCompletely = async () => {
    try {
      // Complete logout: Remove everything including phone number
      await AsyncStorage.multiRemove(['isUserVerified', 'userPhoneNumber', 'userId', 'accessToken', 'userInfo']);
      setIsVerified(false);
      setPhoneNumber(null);
      setUserId(null);
      setAccessToken(null);
      setUserInfo(null);
    } catch (error) {
      console.error('Error during complete logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isVerified, 
        phoneNumber, 
        userId,
        accessToken,
        userInfo,
        isLoading, 
        setVerified, 
        setLoggedIn,
        logout,
        logoutCompletely
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}