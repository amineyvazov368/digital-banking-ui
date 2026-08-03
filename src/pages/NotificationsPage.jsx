import React, { useEffect, useState } from 'react';
import api from '../services/api'; // api.js faylınızın yolunu düzgün göstərin
import { 
  Bell, 
  CheckCircle2, 
  Trash2, 
  Filter, 
  Inbox 
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import useAuth from '../hooks/useAuth';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const { setUnreadCount, fetchUnreadCount } = useNotification();

  const userId = user?.id;

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const res = await api.get(`/api/notifications`);

      if (Array.isArray(res.data)) {
        setNotifications(res.data);
      } else if (res.data && Array.isArray(res.data.notifications)) {
        setNotifications(res.data.notifications);
      } else if (res.data && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
      } else {
        setNotifications([]);
      }

      if (fetchUnreadCount) fetchUnreadCount();
    } catch (err) {
      console.error("Backend-ə qoşularkən xəta:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (notification) => {
    const isAlreadyRead = notification.read || notification.isRead;
    if (isAlreadyRead) return;

    try {
      await api.put(`/api/notifications/${notification.id}/read`);

      setNotifications(prev =>
        (Array.isArray(prev) ? prev : []).map(item =>
          item.id === notification.id ? { ...item, isRead: true, read: true } : item
        )
      );

      if (setUnreadCount) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Oxunmuş kimi qeyd edərkən xəta:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (fetchUnreadCount) fetchUnreadCount();
    } catch (err) {
      console.error("Bildiriş silinərkən xəta:", err);
    }
  };

  const filteredNotifications = (Array.isArray(notifications) ? notifications : []).filter(n => {
    const isRead = n.read || n.isRead;
    if (filter === 'UNREAD') return !isRead;
    return true;
  });

  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter(n => !n.read && !n.isRead).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Bildirişləriniz</h1>
            <p className="text-xs text-slate-400 mt-0.5">Hesabınız üzrə yeniliklər və bildirişlər</p>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Filter size={16} className="text-slate-400 mr-1" />
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bütün Bildirişlər ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'UNREAD' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Oxunmamış ({unreadCount})
        </button>
      </div>

      {/* NOTIFICATION LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Yüklənir...</div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => {
            const isRead = item.read || item.isRead;
            return (
              <div 
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
                  isRead ? 'bg-white border-slate-100' : 'bg-blue-50/30 border-blue-100 shadow-sm'
                }`}
              >
                <div className="mt-0.5">
                  <div className={`p-2.5 rounded-xl ${isRead ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-500'}`}>
                    <Bell size={20} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm ${isRead ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>
                      {item.title}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Oxunmuş kimi işarələ"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-100">
            <Inbox size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">Bildiriş tapılmadı</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;