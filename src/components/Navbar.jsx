import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, User, CheckCircle2, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';

export const Navbar = ({ toggleSidebar, sidebarOpen, pageTitle = 'Dashboard' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const { unreadCount, setUnreadCount, fetchUnreadCount } = useNotification();

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/notifications?userId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      let data = response.data;
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (data && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else if (data && Array.isArray(data.data)) {
        setNotifications(data.data);
      } else {
        setNotifications([]);
      }

      if (fetchUnreadCount) fetchUnreadCount();
    } catch (error) {
      console.error("Bildirişlər gətirilərkən xəta yarandı:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  // Düyməyə klikləyəndə işləyən rahat funksiya
  const handleBellClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    setNotifDropdownOpen(prev => {
      const nextState = !prev;
      if (nextState) {
        fetchNotifications();
      }
      return nextState;
    });
  };

  const handleMarkAsRead = async (notification, e) => {
    e.stopPropagation();
    const isAlreadyRead = notification.read || notification.isRead;
    if (isAlreadyRead) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/notifications/${notification.id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotifications(prev =>
        prev.map(item =>
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

  const renderResponsiveTitle = () => {
    if (pageTitle.toLowerCase().includes('dashboard overview') || pageTitle.toLowerCase().includes('overview')) {
      return (
        <>
          <span className="sm:hidden">Dashboard</span>
          <span className="hidden sm:inline">{pageTitle}</span>
        </>
      );
    }
    return pageTitle;
  };

  return (
    <header className="h-[70px] bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
      
      {/* Page Title & Hamburger */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={() => toggleSidebar(!sidebarOpen)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          title="Menyunu dəyiş"
        >
          <Menu size={22} />
        </button>
        
        <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight truncate">
          {renderResponsiveTitle()}
        </h1>
      </div>

      {/* Search / Notifications / Profile */}
      <div className="flex items-center gap-2.5 sm:gap-5 shrink-0">
        
        {/* Search Bar */}
        <div className="relative hidden md:flex items-center">
          <Search size={16} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Axtarış edin..."
            className="bg-slate-100/70 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all w-48 lg:w-56"
          />
        </div>

        {/* NOTIFICATION CONTAINER */}
        <div className="relative z-50">
          <button 
            type="button"
            onClick={handleBellClick}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer select-none active:scale-95"
            title="Bildirişlər"
          >
            <Bell size={18} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* DROPDOWN & OVERLAY */}
          {notifDropdownOpen && (
            <>
              {/* KƏNARA KLİKLƏMƏ ÜÇÜN BÜTÜN EKRANI ÖRTƏN ŞƏFFAF TƏBƏQƏ */}
              {/* Həm mobil/planşet, həm desktop üçün kənara basanda pəncərəni bağlayır */}
              <div 
                className="fixed inset-0 z-40 bg-slate-900/20 md:bg-transparent"
                onClick={() => setNotifDropdownOpen(false)}
              />

              {/* DROPDOWN PƏNCƏRƏSİ */}
              <div className="
                fixed inset-x-4 top-20 max-h-[80vh]
                md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:max-h-none
                w-auto md:w-96 bg-white rounded-2xl shadow-2xl md:shadow-xl border border-slate-100 
                z-50 overflow-hidden flex flex-col transition-all duration-150
              ">
                
                {/* HEADER */}
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-blue-400" />
                    <span className="font-semibold text-sm">Bildirişlər</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} yeni
                      </span>
                    )}
                  </div>

                  <button 
                    type="button"
                    onClick={() => setNotifDropdownOpen(false)}
                    className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* BİLDİRİŞ SİYAHISI */}
                <div className="overflow-y-auto max-h-[60vh] md:max-h-80 divide-y divide-slate-100">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((n) => {
                      const isRead = n.read || n.isRead;
                      return (
                        <div 
                          key={n.id} 
                          className={`p-3.5 sm:p-3 transition-colors flex items-start justify-between gap-3 ${
                            !isRead ? 'bg-blue-50/40 font-semibold' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-snug">{n.message}</p>
                              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                          </div>

                          {!isRead && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkAsRead(n, e)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg shrink-0"
                              title="Oxunmuş et"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Bildiriş tapılmadı
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <Link 
                  to="/notifications"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 text-center text-xs font-bold text-blue-600 flex items-center justify-center gap-1.5 border-t border-slate-100 transition-colors shrink-0"
                >
                  <span>Bütün bildirişlərə bax</span>
                  <ExternalLink size={14} />
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-2.5 sm:pl-4 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
            {user ? (
              `${user.name ? user.name.charAt(0).toUpperCase() : ''}${user.surname ? user.surname.charAt(0).toUpperCase() : ''}`
            ) : (
              <User size={14} />
            )}
          </div>
          {user && (
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block">
              Salam, {user.name || 'İstifadəçi'}
            </span>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;