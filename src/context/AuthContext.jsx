import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize authentication state on start
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem('banking_token');
        const storedUser = localStorage.getItem('banking_user');
        
        // Əgər dəyərlər mövcuddursa və "undefined" deyilsə prosesə davam et
        if (storedToken && storedUser && storedUser !== "undefined") {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Əgər yarımçıq və ya xarab data qalıbsa, təmizləyirik
          localStorage.removeItem('banking_token');
          localStorage.removeItem('banking_user');
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Hər hansı xəta olduqda tətbiqin çökməməsi üçün yaddaşı sıfırlayırıq
        localStorage.removeItem('banking_token');
        localStorage.removeItem('banking_user');
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
  setLoading(true);
  try {
    const data = await authService.login(email, password);
    
    const { userResponseDto, accessToken } = data;

    if (accessToken && userResponseDto) {
      
      const userId = userResponseDto.id || userResponseDto.userId || data.id || data.userId;
      
      const userToSave = {
        ...userResponseDto,
        id: userId
      };

      console.log("Giriş uğurludur! Saxlanılan User:", userToSave);

      localStorage.setItem('banking_token', accessToken);
      localStorage.setItem('banking_user', JSON.stringify(userToSave));
      
      setToken(accessToken);
      setUser(userToSave);

      // SƏHİFƏYƏ ROL VƏ İD İLƏ BİRLİKDƏ TAM OBYEKTİ QAYTARIRIQ:
      return userToSave; 
    } else {
      throw new Error("Invalid response structure from server");
    }
  } catch (error) {
    throw error;
  } finally {
    setLoading(false);
  }
};
  const register = async (registerData) => {
    setLoading(true);
    try {
      const result = await authService.register(registerData);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Backend-ə çıxış sorğusu göndəririk (əgər reallaşdırılıbsa)
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Hər bir halda brauzerdəki məlumatları təmizləyirik
      localStorage.removeItem('banking_token');
      localStorage.removeItem('banking_user');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token, // Token varsa true, yoxdursa false qaytarır
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};