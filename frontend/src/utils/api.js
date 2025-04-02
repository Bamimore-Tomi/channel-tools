// frontend/src/utils/api.js
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized or 403 Forbidden errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (error.response.data.message === 'Invalid or expired token') {
        // Clear localStorage and redirect to login if token is invalid
        localStorage.removeItem('token');
        window.location.href = '/auth';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;