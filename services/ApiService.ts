const API_BASE_URL = 'http://10.111.71.126:8000/api';

export interface PhoneVerificationResponse {
  exists: boolean;
  message: string;
  user_id?: string;
  phone_number?: string;
}

export class ApiService {
  static async verifyPhone(phoneNumber: string): Promise<PhoneVerificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Phone verification API error:', error);
      throw error;
    }
  }

  // You can add more API methods here as needed
  // static async sendSMS(phoneNumber: string) { ... }
  // static async verifyOTP(phoneNumber: string, otp: string) { ... }
}

export default ApiService;