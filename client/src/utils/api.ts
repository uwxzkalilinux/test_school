import axios from 'axios';

// Get API URL from environment variable or use default
// In production on Vercel, API is on same domain as frontend
const getApiUrl = () => {
  // Check if VITE_API_URL is set (for custom backend)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production, use same domain (Vercel serverless functions)
  if (import.meta.env.PROD) {
    // Use current origin + /api (Vercel serverless functions)
    return `${window.location.origin}/api`;
  }
  
  // Development: use localhost
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

// Remove error flag if API URL is configured
localStorage.removeItem('api_config_error');

const api = axios.create({
  baseURL: API_URL,
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
