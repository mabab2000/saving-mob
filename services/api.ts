import { API_BASE_URL, API_TIMEOUT, NETWORK_CONFIG } from '@/config/api';

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
  
  console.error('All home data fetch attempts failed:', lastError);
  throw lastError;
};