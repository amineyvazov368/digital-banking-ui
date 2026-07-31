import api from './api';

export const accountService = {
  getAccountsByUserId: async (userId) => {
    try {
      const response = await api.get('/api/accounts', {
        params: userId ? { userId } : {} 
      });
      return response.data || response;
    } catch (error) {
      console.error('Hesablar yüklənərkən xəta baş verdi:', error.message);
      throw error; 
    }
  },

  getMyAccounts: async () => {
    try {
      const response = await api.get('/api/accounts/my-accounts');
      return response.data;
    } catch (error) {
      console.error('Hesabları yükləyərkən xəta yarandı:', error);
      throw error;
    }
  },

  getAccountById: async (id) => {
    if (!id) {
      throw new Error('Hesab ID-si mütləqdir.');
    }
    try {
      const response = await api.get(`/api/accounts/detail/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching account with ID ${id}:`, error);
      throw error;
    }
  },

  createAccount: async (userId, accountData) => {
    if (!userId) {
      throw new Error('Hesab yaratmaq üçün istifadəçi ID-si (userId) mütləqdir.');
    }
    try {
      const payload = {
        userId: parseInt(userId, 10),
        currency: accountData.currency
      };
      const response = await api.post(`/api/accounts/${userId}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },

  // BACKEND-DƏKİ @PatchMapping("/{accountId}/close") ENDPOINT-İ
  closeAccount: async (accountId) => {
    try {
      const response = await api.patch(`/api/accounts/${accountId}/close`);
      return response.data;
    } catch (error) {
      console.error(`Error closing account with ID ${accountId}:`, error);
      throw error;
    }
  }
};

export default accountService;