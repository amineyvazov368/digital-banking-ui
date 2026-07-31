import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  CheckCheck, 
  Trash2, 
  Filter 
} from 'lucide-react';
import api from '../../services/api';

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/admin/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Bildirişlər yüklənərkən xəta baş verdi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/admin/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Oxunmuş kimi işarələnə bilmədi:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/admin/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error("Bütün bildirişlər oxunmuş kimi işarələnə bilmədi:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/admin/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Bildiriş silinə bilmədi:", err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead && !n.read;
    if (filter === 'FLAGGED') return n.type === 'FLAGGED';
    return true;
  });

  const unreadNotificationsCount = notifications.filter(n => !n.read && !n.isRead).length;

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 px-1 sm:px-0">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Bell size={22} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">Admin Bildirişləri</h1>
            <p className="text-xs text-slate-400 mt-0.5">Sistem xəbərdarlıqları və təsdiq gözləyən köçürmələr</p>
          </div>
        </div>

        {/* Mark All Read Button */}
        {unreadNotificationsCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors shrink-0 w-full sm:w-auto"
          >
            <CheckCheck size={16} />
            <span>Hamısını oxunmuş et</span>
          </button>
        )}
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <Filter size={16} className="text-slate-400 mr-1 shrink-0" />
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            filter === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
          }`}
        >
          Bütün Bildirişlər ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            filter === 'UNREAD' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
          }`}
        >
          Oxunmamış ({unreadNotificationsCount})
        </button>
      </div>

      {/* NOTIFICATION LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
            Yüklənir...
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => {
            const isRead = item.read ?? item.isRead;
            return (
              <div 
                key={item.id}
                className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 ${
                  isRead ? 'bg-white border-slate-100' : 'bg-blue-50/40 border-blue-100 shadow-xs'
                }`}
              >
                {/* ICON & MAIN CONTENT */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-xl shrink-0 mt-0.5">
                    <Bell size={18} className="sm:w-5 sm:h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">{item.title}</h3>
                      <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 shrink-0">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">{item.message}</p>
                  </div>
                </div>

                {/* ACTION BUTTONS (Oxunmuş et / Sil) */}
                <div className="flex items-center justify-end gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100/80">
                  {!isRead && (
                    <button 
                      onClick={() => markAsRead(item.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-medium transition-colors"
                      title="Oxunmuş kimi işarələ"
                    >
                      <CheckCircle2 size={16} />
                      <span className="sm:hidden">Oxunmuş et</span>
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(item.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={16} />
                    <span className="sm:hidden">Sil</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-8 sm:p-12 text-center rounded-2xl border border-slate-100">
            <Bell size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">Bildiriş tapılmadı</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminNotificationsPage;