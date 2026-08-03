import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const NotificationContext = createContext();
const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://digital-banking-api-2m78.onrender.com';

export const NotificationProvider = ({ children, userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);

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