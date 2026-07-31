import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BottomNavbar from '../components/BottomNavbar';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar automatically on route changes in mobile viewports
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Determine current page title from pathname
  const getPageTitle = (path) => {
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/accounts')) {
      if (path.includes('/create')) return 'Open New Account';
      if (path.split('/').length > 2) return 'Account Ledger Details';
      return 'My Bank Accounts';
    }
    if (path.startsWith('/cards')) {
      if (path.includes('/create')) return 'Order New Card';
      return 'My Credit & Debit Cards';
    }
    if (path === '/transfer') return 'Money Transfer Portal';
    if (path === '/transactions') return 'History Ledger';
    if (path === '/profile') return 'User Profile Settings';
    return 'Digital Banking';
  };

  return (
    <div className="app-container">
      {/* Sidebar overlay backdrop for mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 400,
            backdropFilter: 'blur(3px)'
          }}
        />
      )}

      {/* Navigation Drawer */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />

      {/* Main Panel */}
      <div className="main-content">
        <Navbar 
          toggleSidebar={setSidebarOpen} 
          sidebarOpen={sidebarOpen} 
          pageTitle={getPageTitle(location.pathname)} 
        />
        
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
        <div style={{ marginTop: '30px' }}>
        <BottomNavbar />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
