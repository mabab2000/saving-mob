import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
  isVerified: boolean;
  phoneNumber: string | null;
  userId: string | null;
  isLoading: boolean;
  setVerified: (phoneNumber: string, userId?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [verifiedStatus, storedPhoneNumber, storedUserId] = await Promise.all([
        AsyncStorage.getItem('isUserVerified'),
        AsyncStorage.getItem('userPhoneNumber'),
        AsyncStorage.getItem('userId')
      ]);

      if (verifiedStatus === 'true' && storedPhoneNumber) {
        setIsVerified(true);
        setPhoneNumber(storedPhoneNumber);
        setUserId(storedUserId);
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

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['isUserVerified', 'userPhoneNumber', 'userId']);
      setIsVerified(false);
      setPhoneNumber(null);
      setUserId(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isVerified, 
        phoneNumber, 
        userId,
        isLoading, 
        setVerified, 
        logout 
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