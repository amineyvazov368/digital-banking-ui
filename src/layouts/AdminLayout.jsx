import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ArrowLeftRight, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Globe,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Landmark
} from 'lucide-react';
import api from '../services/api';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/api/admin/notifications'),
        api.get('/api/admin/notifications/unread-count')
      ]);
      setNotifications(listRes.data || []);
      setUnreadCount(countRes.data || 0);
    } catch (err) {
      console.error("Bildirişlər yüklənərkən xəta baş verdi:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBellClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setNotifDropdownOpen(prev => {
      const next = !prev;
      if (next) fetchNotifications();
      return next;
    });
  };

  const handleNavigateToAll = () => {
    setNotifDropdownOpen(false);
    navigate('/admin/notifications');
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('banking_token');
    try {
      await api.post('/api/users/logout', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Logout failed on backend", err);
    } finally {
      localStorage.removeItem('banking_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/api/admin/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Oxunmuş kimi işarələnə bilmədi:", err);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'İstifadəçilər', href: '/admin/users', icon: Users },
    { name: 'Hesablar və Kartlar', href: '/admin/cards', icon: CreditCard },
    { name: 'Kreditlər', href: '/admin/credit', icon: Landmark },
    { name: 'Tranzaksiyalar', href: '/admin/transactions', icon: ArrowLeftRight },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex relative font-sans">
      
      {/* MOBILE OVERLAY FOR SIDEBAR */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300
          ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${sidebarOpen ? 'md:w-64' : 'md:w-20'}
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          {(sidebarOpen || mobileMenuOpen) && (
            <div className="flex items-center gap-2 font-bold text-lg text-white">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black">
                B
              </div>
              <span>BankAdmin</span>
            </div>
          )}

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white mx-auto cursor-pointer"
            title={sidebarOpen ? "Menyunu bağla" : "Menyunu aç"}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-3 border-b border-slate-800/60">
          <button
            onClick={() => {
              navigate('/');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all duration-200 border border-emerald-500/20 cursor-pointer"
            title="Əsas Sayta Keç"
          >
            <Globe size={20} className="shrink-0" />
            {(sidebarOpen || mobileMenuOpen) && <span>Əsas Sayta Keç</span>}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                title={!sidebarOpen ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {(sidebarOpen || mobileMenuOpen) && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 shrink-0">
          <button 
            onClick={handleLogout}
            title={!sidebarOpen ? "Çıxış edin" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut size={20} className="shrink-0" />
            {(sidebarOpen || mobileMenuOpen) && <span>Çıxış edin</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarOpen ? 'md:ml-64' : 'md:ml-20'
      }`}>
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Menyunu Aç"
            >
              <Menu size={24} />
            </button>

            <h1 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
              İdarəetmə Paneli
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* NOTIFICATION SECTION */}
            <div className="relative">
              <button 
                type="button"
                onClick={handleBellClick}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer select-none active:scale-95"
                title="Bildirişlər"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse pointer-events-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN & OVERLAY */}
              {notifDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-slate-900/20 sm:bg-transparent"
                    onClick={() => setNotifDropdownOpen(false)}
                  />

                  <div className="
                    fixed inset-x-4 top-20 max-h-[80vh] sm:max-h-none sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2
                    w-auto sm:w-96 bg-white rounded-2xl shadow-2xl sm:shadow-xl border border-slate-100 
                    z-50 overflow-hidden flex flex-col transition-all duration-150
                  ">
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
                        className="sm:hidden text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="overflow-y-auto max-h-[60vh] sm:max-h-80 divide-y divide-slate-100">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((n) => (
                          <div 
                            key={n.id} 
                            className={`p-3.5 sm:p-3 transition-colors flex items-start justify-between gap-3 ${
                              !n.read ? 'bg-blue-50/40 font-semibold' : 'bg-white'
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

                            {!n.read && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg shrink-0 cursor-pointer"
                                title="Oxunmuş et"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400">
                          Bildiriş tapılmadı
                        </div>
                      )}
                    </div>

                    <button 
                      type="button"
                      onClick={handleNavigateToAll}
                      className="p-3 bg-slate-50 hover:bg-slate-100 text-center text-xs font-bold text-blue-600 flex items-center justify-center gap-1.5 border-t border-slate-100 transition-colors shrink-0 w-full cursor-pointer"
                    >
                      <span>Bütün bildirişlərə bax</span>
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-2 sm:pl-4">
              <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full font-bold flex items-center justify-center shrink-0">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-800">Admin User</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
            </div>

          </div>
        </header>

        <main className="p-4 sm:p-6 flex-1 overflow-x-hidden">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;