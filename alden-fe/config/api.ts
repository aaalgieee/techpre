// API Configuration
// Change this to your backend URL
export const API_CONFIG = {
  // For development - make sure your backend is running on this URL
  BASE_URL: 'http://localhost:8000/api',
  
  // For production, you would change this to your deployed backend URL
  // BASE_URL: 'https://your-deployed-backend.com/api',
  
  // For local development with physical device, use your computer's IP
  // BASE_URL: 'http://192.168.1.XXX:8000/api',
  
  // Timeout settings
  TIMEOUT: 10000, // 10 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
};

// Helper function to get the full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Environment-specific settings
export const getEnvironmentConfig = () => {
  // You can add environment detection logic here
  const isDevelopment = __DEV__;
  
  return {
    isDevelopment,
    baseUrl: API_CONFIG.BASE_URL,
    enableLogging: isDevelopment,
  };
}; 