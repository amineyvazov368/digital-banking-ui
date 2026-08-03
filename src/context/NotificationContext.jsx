import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api'; 

const NotificationContext = createContext();

export const NotificationProvider = ({ children, userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
    try {
      // api.js artıq Token və BaseURL-i özü idarə edir
      const response = await api.get(`/api/notifications/unread-count`);
      
      const count = typeof response.data === 'object' ? response.data.count : response.data;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Bildiriş sayı gətirilərkən xəta yarandı:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 5000); 

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