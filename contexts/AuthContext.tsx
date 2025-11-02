import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
  isVerified: boolean;
  phoneNumber: string | null;
  isLoading: boolean;
  setVerified: (phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [verifiedStatus, storedPhoneNumber] = await Promise.all([
        AsyncStorage.getItem('isUserVerified'),
        AsyncStorage.getItem('userPhoneNumber')
      ]);

      if (verifiedStatus === 'true' && storedPhoneNumber) {
        setIsVerified(true);
        setPhoneNumber(storedPhoneNumber);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setVerified = async (phone: string) => {
    try {
      await AsyncStorage.setItem('isUserVerified', 'true');
      await AsyncStorage.setItem('userPhoneNumber', phone);
      setIsVerified(true);
      setPhoneNumber(phone);
    } catch (error) {
      console.error('Error setting verification status:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['isUserVerified', 'userPhoneNumber']);
      setIsVerified(false);
      setPhoneNumber(null);
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