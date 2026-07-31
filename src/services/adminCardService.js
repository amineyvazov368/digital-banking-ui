import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin/cards';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminCardService = {
  getAllCards: async () => {
    const response = await api.get('');
    return response.data;
  },

  activateCard: async (cardId, userId) => {
    // Backend @RequestParam Long userId gözlədiyi üçün params daxilində göndəririk
    const response = await api.patch(`/${cardId}/activate`, {}, {
      params: { userId }
    });
    return response.data;
  },

  blockCard: async (cardId, userId) => {
    const response = await api.patch(`/${cardId}/block`, {}, {
      params: { userId }
    });
    return response.data;
  },

  deleteCard: async (cardId, userId) => {
    const response = await api.delete(`/${cardId}`, {
      params: { userId }
    });
    return response.data;
  }
};