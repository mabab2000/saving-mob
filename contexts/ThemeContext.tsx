import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark' | 'system';
type ActiveColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ActiveColorScheme;
  themePreference: ColorScheme;
  setThemePreference: (theme: ColorScheme) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_preference';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ColorScheme>('system');
  const [isLoading, setIsLoading] = useState(true);
  const systemColorScheme = useSystemColorScheme();

  // Determine the active color scheme based on preference
  const colorScheme: ActiveColorScheme = 
    themePreference === 'system' 
      ? (systemColorScheme ?? 'light')
      : themePreference;

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        setThemePreferenceState(savedTheme as ColorScheme);
      } else {
        // Default to 'system' if no preference is saved
        setThemePreferenceState('system');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Default to 'system' on error
      setThemePreferenceState('system');
    } finally {
      setIsLoading(false);
    }
  };

  const setThemePreference = async (theme: ColorScheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setThemePreferenceState(theme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        colorScheme, 
        themePreference, 
        setThemePreference, 
        isLoading 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Backward compatibility hook
export function useColorScheme() {
  const { colorScheme } = useTheme();
  return colorScheme;
}