import api from './api'; // api.js faylının nisbi yolunu (path) düzgün yazın

const adminAccountService = {
  getAllAccounts: async () => {
    const response = await api.get('/api/admin/accounts'); 
    return response.data;
  },

  getAccountsByStatus: async (status) => {
    const response = await api.get(`/api/admin/accounts/status/${status}`);
    return response.data;
  },

  activateAccount: async (accountId) => {
    const response = await api.patch(`/api/admin/accounts/${accountId}/activate`);
    return response.data;
  },

  blockAccount: async (accountId) => {
    const response = await api.patch(`/api/admin/accounts/${accountId}/block`);
    return response.data;
  }
};

export default adminAccountService;