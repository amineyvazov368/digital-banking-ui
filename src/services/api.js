// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Tokeni həm 'banking_token', həm də 'token' açarı ilə axtarırıq
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('banking_token') || localStorage.getItem('token');
    
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("Diqqət: Backend-ə göndərilməyə Authorization Token tapılmadı!");
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