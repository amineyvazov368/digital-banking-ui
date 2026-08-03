// api.js
import axios from 'axios';
const RENDER_API_URL = 'https://digital-banking-api-2m78.onrender.com/api';

const api = axios.create({
  // SƏNİN KODUN — Sadəcə baseURL-ə Vite mühit dəyişənini əlavə etdik:
  
  baseURL: import.meta.env.VITE_API_BASE_URL || RENDER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Sənin öz orijinal kodun (TOXUNULMADI)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('banking_token') || localStorage.getItem('token');
    
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const isAuthRequest = config.url.includes('/login') || config.url.includes('/register');
      
      if (!isAuthRequest) {
        console.warn("Diqqət: Backend-ə göndərilməyə Authorization Token tapılmadı!");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`API Xətası (${error.response.status}):`, error.config.url);
    }
    return Promise.reject(error);
  }
);

export default api;