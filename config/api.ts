// API Configuration for different environments
const CONFIG = {
  development: {
    API_BASE_URL: 'http://10.111.71.126:8000/api', // Your computer's IP
    API_TIMEOUT: 10000, // 10 seconds
  },
  production: {
    API_BASE_URL: 'https://your-production-api.com/api',
    API_TIMEOUT: 15000, // 15 seconds
  },
};

// Determine environment (you can change this or use environment variables)
const ENVIRONMENT = 'development'; // Change to 'production' when deploying

export const API_CONFIG = CONFIG[ENVIRONMENT];

// Export individual values for easier access
export const { API_BASE_URL, API_TIMEOUT } = API_CONFIG;

// Network configuration
export const NETWORK_CONFIG = {
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};