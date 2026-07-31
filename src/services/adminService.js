import api from './api';

export const adminService = {
  // 1. Bütün istifadəçiləri gətirmək (Axtarış və Filtr ilə)
  getAllUsers: async (search = '', status = 'ALL') => {
    const params = {};
    if (search) params.search = search;
    if (status && status !== 'ALL') params.status = status;

    const response = await api.get('/api/admin/users', { params });
    return response.data;
  },

  // 2. İstifadəçini Bloklamaq (PATCH /api/admin/users/{id}/block)
  blockUser: async (userId) => {
    const response = await api.patch(`/api/admin/users/${userId}/block`);
    return response.data;
  },

  // 3. İstifadəçini Aktivləşdirmək (PATCH /api/admin/users/{id}/activate)
  activateUser: async (userId) => {
    const response = await api.patch(`/api/admin/users/${userId}/activate`);
    return response.data;
  },

  // 4. İstifadəçini Silmək (DELETE /api/admin/users/{id})
  deleteUser: async (userId) => {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
  },

  // 5. İstifadəçi məlumatlarını redaktə etmək (PUT /api/admin/users/{id})
  updateUser: async (userId, userData) => {
    const response = await api.put(`/api/admin/users/${userId}`, userData);
    return response.data;
  },

  // 6. Tək bir istifadəçini ID ilə gətirmək (GET /api/admin/users/{id})
  getUserById: async (userId) => {
    const response = await api.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  // 7. Statistik Məlumatları Gətirmək (GET /api/admin/users/summary)
  getUserSummary: async () => {
    const response = await api.get('/api/admin/users/summary');
    return response.data;
  }
};

export default adminService;