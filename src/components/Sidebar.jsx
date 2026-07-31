import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import MoreServicesModal from './MoreServicesModal';
import { 
  LayoutDashboard, 
  Wallet, 
  History, 
  LogOut,
  Infinity,
  Package,
  Grid,
  CreditCard // 1. Kredit üçün ikon əlavə olundu
} from 'lucide-react';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showMoreModal, setShowMoreModal] = useState(false);

  const handleLogout = async () => {
    if (logout) await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tarixçə', path: '/transactions', icon: History },
    { name: 'Məhsullar', path: '/products', icon: Package },
    { name: 'Kredit', path: '/credit', icon: CreditCard }, // 2. Məhsulların altına əlavə olundu
    { name: 'Ödənişlər', path: '/payments', icon: Wallet },
  ];

  const sidebarStyle = {
    width: '260px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 100,
    transition: 'transform 0.3s ease',
  };

  const activeLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.8rem 1rem',
    borderRadius: '12px',
    color: isActive ? '#ffffff' : '#475569',
    backgroundColor: isActive ? '#0e5af1' : 'transparent',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.95rem',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
    border: 'none',
    outline: 'none'
  });

  return (
    <>
      {/* SIDEBAR CONTAINER */}
      <div 
        style={{
          ...sidebarStyle,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        className="sidebar-container"
      >
        {/* Brand Logo */}
        <div style={{
          padding: '1.5rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid #f1f5f9',
          flexShrink: 0
        }}>
          <div style={{
            backgroundColor: '#0e5af1',
            color: '#fff',
            borderRadius: '12px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(14, 90, 241, 0.25)',
          }}>
            <Infinity size={22} />
          </div>
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            letterSpacing: '-0.5px',
            color: '#0e5af1' 
          }}>
            A_BANK
          </span>
        </div>

        {/* Nav List */}
        <nav style={{
          flex: 1,
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          overflowY: 'auto'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.path} 
                to={item.path} 
                style={activeLinkStyle}
                onClick={() => {
                  if (window.innerWidth <= 1024 && toggleSidebar) toggleSidebar(false);
                }}
              >
                <Icon size={20} />
                {item.name}
              </NavLink>
            );
          })}

          {/* "Daha çox" Düyməsi */}
          <button
            onClick={() => setShowMoreModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.8rem 1rem',
              borderRadius: '12px',
              color: showMoreModal ? '#0e5af1' : '#475569',
              backgroundColor: showMoreModal ? '#f1f5f9' : 'transparent',
              border: 'none',
              outline: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.15s ease',
            }}
          >
            <Grid size={20} />
            Daha çox
          </button>
        </nav>

        {/* User Profile & Logout */}
        <div style={{
          padding: '1.25rem 1rem',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: '#ffffff',
          flexShrink: 0
        }}>
          {user && (
            <div 
              onClick={() => navigate('/profile')} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#0e5af1',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                {user?.surname ? user.surname.charAt(0).toUpperCase() : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {user?.name || 'User'} {user?.surname || ''}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {user?.email || ''}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#fef2f2',
              color: '#ef4444',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* MODAL KOMPONENTİ */}
      <MoreServicesModal 
        isOpen={showMoreModal} 
        onClose={() => setShowMoreModal(false)} 
      />
    </>
  );
};

export default Sidebar;