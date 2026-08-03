// adminCardService.js
import api from './api';

export const adminCardService = {
  getAllCards: async () => {
    const response = await api.get('/api/admin/cards');
    return response.data;
  },

  activateCard: async (cardId, userId) => {
    // Backend @RequestParam Long userId gözlədiyi üçün params daxilində göndəririk
    const response = await api.patch(`/api/admin/cards/${cardId}/activate`, {}, {
      params: { userId }
    });
    return response.data;
  },

  blockCard: async (cardId, userId) => {
    const response = await api.patch(`/api/admin/cards/${cardId}/block`, {}, {
      params: { userId }
    });
    return response.data;
  },

  deleteCard: async (cardId, userId) => {
    const response = await api.delete(`/api/admin/cards/${cardId}`, {
      params: { userId }
    });
    return response.data;
  }
};

export default adminCardService;