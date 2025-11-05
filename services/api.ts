import { API_BASE_URL, API_TIMEOUT, NETWORK_CONFIG } from '@/config/api';
import { CacheService } from './cache';

export interface PhoneVerificationResponse {
  exists: boolean;
  message: string;
  user_id?: string;
  phone_number?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_info: {
    id: string;
    username: string;
    email: string;
    phone_number: string;
  };
}

export interface CreateSavingRequest {
  user_id: string;
  amount: number;
  description?: string;
}

export interface CreateSavingResponse {
  success: boolean;
  message: string;
  saving_id?: string;
  current_balance?: number;
}

export interface UploadProfilePhotoResponse {
  id: string;
  user_id: string;
  photo: string;
  created_at: string;
  updated_at: string;
}

export interface HomeDataResponse {
  user_id: string;
  image_preview_link: string;
  total_saving: number;
  total_loan: number;
  latest_saving_info: {
    month: number;
    year: number;
    amount: number;
  };
}

export interface DashboardDataResponse {
  user_id: string;
  total_saving: number;
  total_loan: number;
  total_penalties: number;
}

export interface SavingRecord {
  id: string;
  user_id: string;
  amount: number;
  created_at: string;
}

export interface SavingsDataResponse {
  total_amount: number;
  total_saving: number;
  savings: SavingRecord[];
}

export interface LoanRecord {
  id: string;
  user_id: string;
  amount: number;
  issued_date: string;
  deadline: string;
  created_at: string;
  updated_at: string;
}

export interface LoansDataResponse {
  total_amount: number;
  total_loan: number;
  loans: LoanRecord[];
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  loan_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentsDataResponse {
  total_amount: number;
  total_payments: number;
  payments: PaymentRecord[];
}

export interface PenaltyRecord {
  id: string;
  user_id: string;
  reason: string;
  amount: number;
  status: 'paid' | 'unpaid';
  created_at: string;
  updated_at: string;
}

export interface PenaltiesDataResponse {
  total_paid: number;
  total_unpaid: number;
  penalties: PenaltyRecord[];
}

export const verifyPhoneNumber = async (phoneNumber: string): Promise<PhoneVerificationResponse> => {
  let lastError;
  
  // Retry logic for network failures
  for (let attempt = 1; attempt <= NETWORK_CONFIG.retryAttempts; attempt++) {
    try {
      // Remove +, spaces, and any non-numeric characters to get clean number
      const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
      
      console.log(`Attempting phone verification (attempt ${attempt}/${NETWORK_CONFIG.retryAttempts}):`, {
        url: `${API_BASE_URL}/verify-phone`,
        phoneNumber: cleanPhoneNumber
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(`${API_BASE_URL}/verify-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: cleanPhoneNumber
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Phone verification failed`);
      }

      console.log('Phone verification successful:', data);
      return data;
    } catch (error) {
      lastError = error;
      console.error(`Phone verification attempt ${attempt} failed:`, error);
      
      // If it's the last attempt, don't wait
      if (attempt < NETWORK_CONFIG.retryAttempts) {
        console.log(`Retrying in ${NETWORK_CONFIG.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, NETWORK_CONFIG.retryDelay));
      }
    }
  }
  
  console.error('All phone verification attempts failed:', lastError);
  throw lastError;
};

export const loginById = async (userId: string): Promise<LoginResponse> => {
  let lastError;
  
  // Retry logic for network failures
  for (let attempt = 1; attempt <= NETWORK_CONFIG.retryAttempts; attempt++) {
    try {
      console.log(`Attempting login by ID (attempt ${attempt}/${NETWORK_CONFIG.retryAttempts}):`, {
        url: `${API_BASE_URL}/login-by-id`,
        userId
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(`${API_BASE_URL}/login-by-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Login failed`);
      }

      console.log('Login successful:', data);
      return data;
    } catch (error) {
      lastError = error;
      console.error(`Login attempt ${attempt} failed:`, error);
      
      // If it's the last attempt, don't wait
      if (attempt < NETWORK_CONFIG.retryAttempts) {
        console.log(`Retrying in ${NETWORK_CONFIG.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, NETWORK_CONFIG.retryDelay));
      }
    }
  }
  
  console.error('All login attempts failed:', lastError);
  throw lastError;
};

export const createSaving = async (savingData: CreateSavingRequest): Promise<CreateSavingResponse> => {
  let lastError;
  
  // Retry logic for network failures
  for (let attempt = 1; attempt <= NETWORK_CONFIG.retryAttempts; attempt++) {
    try {
      console.log(`Attempting to create saving (attempt ${attempt}/${NETWORK_CONFIG.retryAttempts}):`, {
        url: `${API_BASE_URL}/create-saving`,
        savingData
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(`${API_BASE_URL}/create-saving`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(savingData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Failed to create saving`);
      }

      console.log('Saving created successfully:', data);
      return data;
    } catch (error) {
      lastError = error;
      console.error(`Create saving attempt ${attempt} failed:`, error);
      
      // If it's the last attempt, don't wait
      if (attempt < NETWORK_CONFIG.retryAttempts) {
        console.log(`Retrying in ${NETWORK_CONFIG.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, NETWORK_CONFIG.retryDelay));
      }
    }
  }
  
  console.error('All create saving attempts failed:', lastError);
  throw lastError;
};

export const uploadProfilePhoto = async (userId: string, imageUri: string, accessToken?: string): Promise<UploadProfilePhotoResponse> => {
  let lastError;
  
  // Retry logic for network failures
  for (let attempt = 1; attempt <= NETWORK_CONFIG.retryAttempts; attempt++) {
    try {
      console.log(`Attempting to upload profile photo (attempt ${attempt}/${NETWORK_CONFIG.retryAttempts}):`, {
        url: `${API_BASE_URL}/profile-photo`,
        userId
      });
      
      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(`${API_BASE_URL}/profile-photo`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type manually for FormData - let fetch set it with boundary
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Profile photo uploaded successfully:', data);
      return data;
    } catch (error) {
      lastError = error;
      console.error(`Profile photo upload attempt ${attempt} failed:`, error);
      
      // If it's the last attempt, don't wait
      if (attempt < NETWORK_CONFIG.retryAttempts) {
        console.log(`Retrying in ${NETWORK_CONFIG.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, NETWORK_CONFIG.retryDelay));
      }
    }
  }
  
  console.error('All profile photo upload attempts failed:', lastError);
  throw lastError;
};

export const getHomeData = async (userId: string, accessToken?: string): Promise<HomeDataResponse> => {
  const cacheKey = 'home_data';
  
  // Try to get cached data first
  const cachedData = await CacheService.getCache<HomeDataResponse>(cacheKey, userId);
  if (cachedData) {
    console.log('Returning cached home data');
    return cachedData;
  }
  
  let lastError;
  
  // Retry logic for network failures
  for (let attempt = 1; attempt <= NETWORK_CONFIG.retryAttempts; attempt++) {
    try {
      console.log(`Attempting to fetch home data (attempt ${attempt}/${NETWORK_CONFIG.retryAttempts}):`, {
        url: `${API_BASE_URL}/home/${userId}`,
        userId
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(`${API_BASE_URL}/home/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Home data fetch failed:', response.status, errorText);
        throw new Error(`Home data fetch failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Home data fetched successfully:', data);
      
      // Cache the successful response
      await CacheService.setCache(cacheKey, data, userId);
      
      return data;
    } catch (error) {
      lastError = error;
      console.error(`Home data fetch attempt ${attempt} failed:`, error);
      
      // If it's the last attempt, don't wait
      if (attempt < NETWORK_CONFIG.retryAttempts) {
        console.log(`Retrying in ${NETWORK_CONFIG.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, NETWORK_CONFIG.retryDelay));
      }
    }
  }
  
  // If all attempts failed, try to return any available cached data as fallback
  console.log('All network attempts failed, checking for any cached home data...');
  const fallbackCachedData = await CacheService.getCacheAllowExpired<HomeDataResponse>(cacheKey, userId);
  if (fallbackCachedData) {
    console.log('Returning expired cached home data as fallback');
    return fallbackCachedData;
  }
  
  console.error('All home data fetch attempts failed:', lastError);
  throw lastError;
};

export const getDashboardData = async (userId: string, accessToken?: string): Promise<DashboardDataResponse> => {
  // Try to get cached data first
  try {
    const cachedData = await CacheService.getDashboardCache(userId);
    if (cachedData) {
      console.log('Using cached dashboard data');
      return cachedData;
    }
  } catch (error) {
    console.error('Error retrieving cached dashboard data:', error);
  }

  let lastError;
  
  // Retry logic for network failures
  for (let attempt = 1; attempt <= NETWORK_CONFIG.retryAttempts; attempt++) {
    try {
      console.log(`Attempting to fetch dashboard data (attempt ${attempt}/${NETWORK_CONFIG.retryAttempts}):`, {
        url: `${API_BASE_URL}/dashboard/${userId}`,
        userId
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(`${API_BASE_URL}/dashboard/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dashboard data fetch failed:', response.status, errorText);
        throw new Error(`Dashboard data fetch failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Dashboard data fetched successfully:', data);
      
      // Cache the successful response
      try {
        await CacheService.setDashboardCache(data, userId);
      } catch (cacheError) {
        console.error('Error caching dashboard data:', cacheError);
      }
      
      return data;
    } catch (error) {
      lastError = error;
      console.error(`Dashboard data fetch attempt ${attempt} failed:`, error);
      
      // If it's the last attempt, don't wait
      if (attempt < NETWORK_CONFIG.retryAttempts) {
        console.log(`Retrying in ${NETWORK_CONFIG.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, NETWORK_CONFIG.retryDelay));
      }
    }
  }
  
  console.error('All dashboard data fetch attempts failed:', lastError);
  
  // If all attempts failed, try to return cached data as fallback
  try {
    const cachedData = await CacheService.getDashboardCache(userId);
    if (cachedData) {
      console.log('API failed, using cached dashboard data as fallback');
      return cachedData;
    }
  } catch (cacheError) {
    console.error('Error retrieving fallback cached data:', cacheError);
  }
  
  throw lastError;
};

export const getSavingsData = async (userId: string, accessToken?: string): Promise<SavingsDataResponse> => {
  // Try to get cached data first
  try {
    const cachedData = await CacheService.getSavingsCache(userId);
    if (cachedData) {
      console.log('Using cached savings data');
      return cachedData;
    }
  } catch (error) {
    console.error('Error retrieving cached savings data:', error);
  }

  let lastError;
  
  // Retry logic for network failures
  for (let attempt = 1; attempt <= NETWORK_CONFIG.retryAttempts; attempt++) {
    try {
      console.log(`Attempting to fetch savings data (attempt ${attempt}/${NETWORK_CONFIG.retryAttempts}):`, {
        url: `${API_BASE_URL}/savings/${userId}`,
        userId
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(`${API_BASE_URL}/savings/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Savings data fetch failed:', response.status, errorText);
        throw new Error(`Savings data fetch failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Savings data fetched successfully:', data);
      
      // Cache the successful response
      try {
        await CacheService.setSavingsCache(data, userId);
      } catch (cacheError) {
        console.error('Error caching savings data:', cacheError);
      }
      
      return data;
    } catch (error) {
      lastError = error;
      console.error(`Savings data fetch attempt ${attempt} failed:`, error);
      
      // If it's the last attempt, don't wait
      if (attempt < NETWORK_CONFIG.retryAttempts) {
        console.log(`Retrying in ${NETWORK_CONFIG.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, NETWORK_CONFIG.retryDelay));
      }
    }
  }
  
  console.error('All savings data fetch attempts failed:', lastError);
  
  // If all attempts failed, try to return cached data as fallback
  try {
    const cachedData = await CacheService.getSavingsCache(userId);
    if (cachedData) {
      console.log('API failed, using cached savings data as fallback');
      return cachedData;
    }
  } catch (cacheError) {
    console.error('Error retrieving fallback cached savings data:', cacheError);
  }
  
  throw lastError;
};

export const getLoansData = async (userId: string, accessToken?: string): Promise<LoansDataResponse> => {
  // Try to get cached data first
  try {
    const cachedData = await CacheService.getLoansCache(userId);
    if (cachedData) {
      console.log('Using cached loans data');
      return cachedData;
    }
  } catch (error) {
    console.error('Error retrieving cached loans data:', error);
  }

  let lastError;
  
  // Retry logic for network failures
  for (let attempt = 1; attempt <= NETWORK_CONFIG.retryAttempts; attempt++) {
    try {
      console.log(`Attempting to fetch loans data (attempt ${attempt}/${NETWORK_CONFIG.retryAttempts}):`, {
        url: `${API_BASE_URL}/loans/${userId}`,
        userId
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(`${API_BASE_URL}/loans/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Loans data fetch failed:', response.status, errorText);
        throw new Error(`Loans data fetch failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Loans data fetched successfully:', data);
      
      // Cache the successful response
      try {
        await CacheService.setLoansCache(data, userId);
      } catch (cacheError) {
        console.error('Error caching loans data:', cacheError);
      }
      
      return data;
    } catch (error) {
      lastError = error;
      console.error(`Loans data fetch attempt ${attempt} failed:`, error);
      
      // If it's the last attempt, don't wait
      if (attempt < NETWORK_CONFIG.retryAttempts) {
        console.log(`Retrying in ${NETWORK_CONFIG.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, NETWORK_CONFIG.retryDelay));
      }
    }
  }
  
  console.error('All loans data fetch attempts failed:', lastError);
  
  // If all attempts failed, try to return cached data as fallback
  try {
    const cachedData = await CacheService.getLoansCache(userId);
    if (cachedData) {
      console.log('API failed, using cached loans data as fallback');
      return cachedData;
    }
  } catch (cacheError) {
    console.error('Error retrieving fallback cached loans data:', cacheError);
  }
  
  throw lastError;
};

export const getPaymentsData = async (loanId: string, accessToken?: string): Promise<PaymentsDataResponse> => {
  // Try to get cached data first
  try {
    const cachedData = await CacheService.getPaymentsCache(loanId);
    if (cachedData) {
      console.log('Using cached payments data');
      return cachedData;
    }
  } catch (error) {
    console.error('Error retrieving cached payments data:', error);
  }

  let lastError;
  
  // Retry logic for network failures
  for (let attempt = 1; attempt <= NETWORK_CONFIG.retryAttempts; attempt++) {
    try {
      console.log(`Attempting to fetch payments data (attempt ${attempt}/${NETWORK_CONFIG.retryAttempts}):`, {
        url: `${API_BASE_URL}/loan-payments/${loanId}`,
        loanId
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(`${API_BASE_URL}/loan-payments/${loanId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payments data fetch failed:', response.status, errorText);
        throw new Error(`Payments data fetch failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Payments data fetched successfully:', data);
      
      // Cache the successful response
      try {
        await CacheService.setPaymentsCache(data, loanId);
      } catch (cacheError) {
        console.error('Error caching payments data:', cacheError);
      }
      
      return data;
    } catch (error) {
      lastError = error;
      console.error(`Payments data fetch attempt ${attempt} failed:`, error);
      
      // If it's the last attempt, don't wait
      if (attempt < NETWORK_CONFIG.retryAttempts) {
        console.log(`Retrying in ${NETWORK_CONFIG.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, NETWORK_CONFIG.retryDelay));
      }
    }
  }
  
  console.error('All payments data fetch attempts failed:', lastError);
  
  // If all attempts failed, try to return cached data as fallback
  try {
    const cachedData = await CacheService.getPaymentsCache(loanId);
    if (cachedData) {
      console.log('API failed, using cached payments data as fallback');
      return cachedData;
    }
  } catch (cacheError) {
    console.error('Error retrieving fallback cached payments data:', cacheError);
  }
  
  throw lastError;
};

export const getPenaltiesData = async (userId: string, accessToken?: string): Promise<PenaltiesDataResponse> => {
  const cacheKey = 'penalties_data';
  
  // Try to get cached data first
  const cachedData = await CacheService.getCache<PenaltiesDataResponse>(cacheKey, userId);
  if (cachedData) {
    console.log('Returning cached penalties data');
    return cachedData;
  }
  
  let lastError;
  
  // Retry logic for network failures
  for (let attempt = 1; attempt <= NETWORK_CONFIG.retryAttempts; attempt++) {
    try {
      console.log(`Attempting to fetch penalties data (attempt ${attempt}/${NETWORK_CONFIG.retryAttempts}):`, {
        url: `${API_BASE_URL}/penalties/${userId}`,
        userId
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(`${API_BASE_URL}/penalties/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Penalties data fetch failed:', response.status, errorText);
        throw new Error(`Penalties data fetch failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Penalties data fetched successfully:', data);
      
      // Cache the successful response
      await CacheService.setCache(cacheKey, data, userId);
      
      return data;
    } catch (error) {
      lastError = error;
      console.error(`Penalties data fetch attempt ${attempt} failed:`, error);
      
      // If it's the last attempt, don't wait
      if (attempt < NETWORK_CONFIG.retryAttempts) {
        console.log(`Retrying in ${NETWORK_CONFIG.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, NETWORK_CONFIG.retryDelay));
      }
    }
  }
  
  // If all attempts failed, try to return any available cached data as fallback
  console.log('All network attempts failed, checking for any cached penalties data...');
  const fallbackCachedData = await CacheService.getCacheAllowExpired<PenaltiesDataResponse>(cacheKey, userId);
  if (fallbackCachedData) {
    console.log('Returning expired cached penalties data as fallback');
    return fallbackCachedData;
  }
  
  console.error('All penalties data fetch attempts failed:', lastError);
  throw lastError;
};