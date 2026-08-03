import api from './api';

export const adminService = {
  getAllUsers: async (search = '', status = 'ALL') => {
    const params = {};
    if (search) params.search = search;
    if (status && status !== 'ALL') params.status = status;

    const response = await api.get('/api/admin/users', { params });
    return response.data;
  },

  blockUser: async (userId) => {
    const response = await api.patch(`/api/admin/users/${userId}/block`);
    return response.data;
  },

  activateUser: async (userId) => {
    const response = await api.patch(`/api/admin/users/${userId}/activate`);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/api/admin/users/${userId}`, userData);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  getUserSummary: async () => {
    const response = await api.get('/api/admin/users/summary');
    return response.data;
  }
};

export default adminService;