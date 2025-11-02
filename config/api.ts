// API Configuration for different environments
const CONFIG = {
  development: {
    API_BASE_URL: 'https://saving-api.mababa.app/api', // Your deployed API
    SERVER_BASE_URL: 'https://saving-api.mababa.app', // Server base URL for static files
    API_TIMEOUT: 10000, // 10 seconds
  },
  production: {
    API_BASE_URL: 'https://saving-api.mababa.app/api',
    SERVER_BASE_URL: 'https://saving-api.mababa.app',
    API_TIMEOUT: 15000, // 15 seconds
  },
};

// Determine environment (you can change this or use environment variables)
const ENVIRONMENT = 'development'; // Change to 'production' when deploying

export const API_CONFIG = CONFIG[ENVIRONMENT];

// Export individual values for easier access
export const { API_BASE_URL, SERVER_BASE_URL, API_TIMEOUT } = API_CONFIG;

// Network configuration
export const NETWORK_CONFIG = {
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};