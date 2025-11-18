import axios from 'axios';

// Get API URL from environment variable or use default
// In production, you MUST set VITE_API_URL in Vercel environment variables
// Example: VITE_API_URL=https://your-backend.railway.app/api
const getApiUrl = () => {
  // Check if VITE_API_URL is set (for production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production without env var, show error
  if (import.meta.env.PROD) {
    console.error('VITE_API_URL is not set! Please set it in Vercel environment variables.');
    // Return empty string to show error clearly
    return '';
  }
  
  // Development: use localhost
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

// Show warning if API URL is not set in production
if (import.meta.env.PROD && !API_URL) {
  console.error('⚠️ API URL is not configured! Please set VITE_API_URL in Vercel environment variables.');
  // Store in localStorage to show error in UI
  localStorage.setItem('api_config_error', 'true');
} else {
  localStorage.removeItem('api_config_error');
}

const api = axios.create({
  baseURL: API_URL || 'http://localhost:5000/api', // Fallback for type safety
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

