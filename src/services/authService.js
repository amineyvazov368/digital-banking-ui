// authService.js
import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/users/login', { email, password });
    // Əgər token response.data.token və ya oxşar gəlirsə:
    const token = response.data?.token || response.data?.accessToken || response.data;
   if (token) {
    localStorage.setItem('banking_token', token);
    localStorage.setItem('token', token);
  }
    return response.data; 
  },

  register: async (registerData) => {
    const data = registerData?.firstName ? registerData : registerData[0] || registerData;

    const payload = {
      name: data.firstName || data.name,
      surname: data.lastName || data.surname,
      email: data.email,
      password: data.password
    };

    const response = await api.post('/api/users/register', payload);
    return response.data;
  },

  getCurrentUser: async () => {
    // LocalStorage-dən cari istifadəçini götürürük
    const user = localStorage.getItem('banking_user');
    return user ? JSON.parse(user) : null;
  },

  // Profile Məlumatlarını Yeniləmək
  updateProfile: async (profileData) => {
    try {
      const payload = {
        name: profileData.firstName,
        surname: profileData.lastName,
        email: profileData.email
      };

      const response = await api.put('/api/users/me', payload);
      
      // Local storage-i sinxronlaşdıraq
      const currentUser = JSON.parse(localStorage.getItem('banking_user') || '{}');
      const updatedUser = { ...currentUser, ...payload };
      localStorage.setItem('banking_user', JSON.stringify(updatedUser));
      
      return response.data;
    } catch (err) {
      console.warn("Backend unavailable, updating local state mock");
      const currentUser = JSON.parse(localStorage.getItem('banking_user') || '{}');
      const updatedUser = { 
        ...currentUser, 
        name: profileData.firstName, 
        surname: profileData.lastName, 
        email: profileData.email 
      };
      localStorage.setItem('banking_user', JSON.stringify(updatedUser));
      return updatedUser;
    }
  },

  // Şifrəni Yeniləmək
  updatePassword: async (passwordData) => {
    try {
      const response = await api.patch('/api/users/change-password', {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      return response.data;
    } catch (err) {
      console.warn("Backend error during password change");
      throw err;
    }
  },

  logout: async () => {
    try {
      // api.js avtomatik Bearer token-i əlavə etdiyi üçün manual header yazmağa gərək yoxdur
      await api.post('/api/users/logout', {});
    } catch (err) {
      console.error("Logout failed on backend", err);
    }
  }
};

export default authService;