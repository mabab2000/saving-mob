import { API_BASE_URL, API_TIMEOUT, NETWORK_CONFIG } from '@/config/api';

export interface PhoneVerificationResponse {
  exists: boolean;
  message: string;
  user_id?: string;
  phone_number?: string;
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