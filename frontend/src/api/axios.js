import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://civic-monitor.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ensures cookies are sent
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add token if present
api.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('🚫 API Error', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('🌐 Network Error', error.message);
    } else {
      console.error('❌ Request Error', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
