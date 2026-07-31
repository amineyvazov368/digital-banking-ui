import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const NotificationContext = createContext();
const API_URL = 'http://localhost:8080';

export const NotificationProvider = ({ children, userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // useCallback istifadə edirik ki, funksiya hər dəfə yenidən yaranmasın
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/notifications/unread-count?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const count = typeof response.data === 'object' ? response.data.count : response.data;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Bildiriş sayı gətirilərkən xəta yarandı:", error);
    }
  }, [userId]);

  useEffect(() => {
    // 1. İlk dəfə yüklenende çağırır
    fetchUnreadCount();

    // 2. Hər 5 saniyədən bir arxa fonda avtomatik yoxlayır (Polling)
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 5000); // 5000ms = 5 saniyə

    // Cleanup: Komponent silindikdə intervalı təmizləyirik
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};