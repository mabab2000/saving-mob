import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache keys
const CACHE_KEYS = {
  DASHBOARD: 'dashboard_data',
  SAVINGS: 'savings_data',
  LOANS: 'loans_data',
  PENALTIES: 'penalties_data',
  PAYMENTS: 'payments_data',
  HOME: 'home_data',
} as const;

// Cache expiry time (30 minutes)
const CACHE_EXPIRY = 30 * 60 * 1000;

interface CacheItem<T> {
  data: T;
  timestamp: number;
  userId?: string;
  loanId?: string; // For payments cache
}

export class CacheService {
  // Generic cache set method
  static async setCache<T>(key: string, data: T, userId?: string, loanId?: string): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        userId,
        loanId,
      };
      const cacheKey = userId ? `${key}_${userId}` : key;
      const finalKey = loanId ? `${cacheKey}_${loanId}` : cacheKey;
      await AsyncStorage.setItem(finalKey, JSON.stringify(cacheItem));
      console.log(`Cache set for key: ${finalKey}`);
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  // Generic cache get method
  static async getCache<T>(key: string, userId?: string, loanId?: string): Promise<T | null> {
    try {
      const cacheKey = userId ? `${key}_${userId}` : key;
      const finalKey = loanId ? `${cacheKey}_${loanId}` : cacheKey;
      const cachedData = await AsyncStorage.getItem(finalKey);
      
      if (!cachedData) {
        console.log(`No cache found for key: ${finalKey}`);
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cachedData);
      const now = Date.now();
      
      // Check if cache is expired
      if (now - cacheItem.timestamp > CACHE_EXPIRY) {
        console.log(`Cache expired for key: ${finalKey}`);
        // Don't delete expired cache - keep it for offline fallback
        return null;
      }

      console.log(`Cache hit for key: ${finalKey}`);
      return cacheItem.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  // Get cache data even if expired (for fallback purposes)
  static async getCacheAllowExpired<T>(key: string, userId?: string, loanId?: string): Promise<T | null> {
    try {
      const cacheKey = userId ? `${key}_${userId}` : key;
      const finalKey = loanId ? `${cacheKey}_${loanId}` : cacheKey;
      const cachedData = await AsyncStorage.getItem(finalKey);
      
      if (!cachedData) {
        console.log(`No cache found for key: ${finalKey}`);
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cachedData);
      console.log(`Returning cached data (possibly expired) for key: ${finalKey}`);
      return cacheItem.data;
    } catch (error) {
      console.error('Error getting expired cache:', error);
      return null;
    }
  }

  // Check if cache exists and is valid
  static async isCacheValid(key: string, userId?: string, loanId?: string): Promise<boolean> {
    try {
      const cacheKey = userId ? `${key}_${userId}` : key;
      const finalKey = loanId ? `${cacheKey}_${loanId}` : cacheKey;
      const cachedData = await AsyncStorage.getItem(finalKey);
      
      if (!cachedData) return false;

      const cacheItem: CacheItem<any> = JSON.parse(cachedData);
      const now = Date.now();
      
      return (now - cacheItem.timestamp) <= CACHE_EXPIRY;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }

  // Clear specific cache
  static async clearCache(key: string, userId?: string, loanId?: string): Promise<void> {
    try {
      const cacheKey = userId ? `${key}_${userId}` : key;
      const finalKey = loanId ? `${cacheKey}_${loanId}` : cacheKey;
      await AsyncStorage.removeItem(finalKey);
      console.log(`Cache cleared for key: ${finalKey}`);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Clear all cache
  static async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        Object.values(CACHE_KEYS).some(cacheKey => key.startsWith(cacheKey))
      );
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('All cache cleared');
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }

  // Dashboard cache methods
  static async setDashboardCache(data: any, userId: string): Promise<void> {
    await this.setCache(CACHE_KEYS.DASHBOARD, data, userId);
  }

  static async getDashboardCache(userId: string): Promise<any | null> {
    return await this.getCache(CACHE_KEYS.DASHBOARD, userId);
  }

  // Savings cache methods
  static async setSavingsCache(data: any, userId: string): Promise<void> {
    await this.setCache(CACHE_KEYS.SAVINGS, data, userId);
  }

  static async getSavingsCache(userId: string): Promise<any | null> {
    return await this.getCache(CACHE_KEYS.SAVINGS, userId);
  }

  // Loans cache methods
  static async setLoansCache(data: any, userId: string): Promise<void> {
    await this.setCache(CACHE_KEYS.LOANS, data, userId);
  }

  static async getLoansCache(userId: string): Promise<any | null> {
    return await this.getCache(CACHE_KEYS.LOANS, userId);
  }

  // Penalties cache methods
  static async setPenaltiesCache(data: any, userId: string): Promise<void> {
    await this.setCache(CACHE_KEYS.PENALTIES, data, userId);
  }

  static async getPenaltiesCache(userId: string): Promise<any | null> {
    return await this.getCache(CACHE_KEYS.PENALTIES, userId);
  }

  // Payments cache methods
  static async setPaymentsCache(data: any, loanId: string): Promise<void> {
    await this.setCache(CACHE_KEYS.PAYMENTS, data, undefined, loanId);
  }

  static async getPaymentsCache(loanId: string): Promise<any | null> {
    return await this.getCache(CACHE_KEYS.PAYMENTS, undefined, loanId);
  }

  // Home cache methods
  static async setHomeCache(data: any, userId: string): Promise<void> {
    await this.setCache(CACHE_KEYS.HOME, data, userId);
  }

  static async getHomeCache(userId: string): Promise<any | null> {
    return await this.getCache(CACHE_KEYS.HOME, userId);
  }
}