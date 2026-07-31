import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/users/login', { email, password });
    // Əgər token response.data.token və ya oxşar gəlirsə:
    const token = response.data?.token || response.data?.accessToken || response.data;
    if (typeof token === 'string') {
      localStorage.setItem('banking_token', token);
      localStorage.setItem('token', token); // Hər iki ehtimal üçün
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

  // getCurrentUser: async () => {
  //   try {
  //     // Backend-dən cari istifadəçi məlumatlarını çəkmək
  //     const response = await api.get('/api/users/me');
  //     return response.data;
  //   } catch (err) {
  //     console.warn("Backend unavailable, fetching from LocalStorage");
  //     const user = localStorage.getItem('banking_user');
  //     return user ? JSON.parse(user) : null;
  //   }
  // },

  getCurrentUser: async () => {
    // Backend-də /api/users/me olmadığı üçün birbaşa LocalStorage-dən götürürük
    const user = localStorage.getItem('banking_user');
    return user ? JSON.parse(user) : null;
  },

  // Profile Məlumatlarını Yeniləmək
  updateProfile: async (profileData) => {
    try {
      // Backend DTO formatına uyğun: name, surname, email
      const payload = {
        name: profileData.firstName,
        surname: profileData.lastName,
        email: profileData.email
      };

      const response = await api.put('/api/users/me', payload);
      
      // Local storage-i da sinxronlaşdıraq
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

  logout: async (token) => {
    try {
      await api.post('/api/users/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('banking_token')}`
        }
      });
    } catch (err) {
      console.error("Logout failed on backend", err);
    }
  }
};

export default authService;