import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  QrCode, 
  Wallet, 
  Grid, 
  X 
} from 'lucide-react';
import MoreServicesModal from './MoreServicesModal'; // Yaratdığımız modalı import edirik

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [showQrModal, setShowQrModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path) => location.pathname === path;
  const activeColor = '#0e5af1';
  const inactiveColor = '#868e96';

  if (!isMobile) return null;

  return (
    <>
      {/* ---------- BOTTOM NAVBAR ---------- */}
      <nav style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: '#ffffff', 
        display: 'flex', 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        padding: '0.6rem 0', 
        borderTop: '1px solid #f1f3f5', 
        zIndex: 1000, 
        boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' 
      }}>
        {/* 1. Əsas */}
        <button onClick={() => navigate('/')} style={buttonStyle}>
          <Home size={20} color={isActive('/') ? activeColor : inactiveColor} />
          <span style={{ fontSize: '0.7rem', color: isActive('/') ? activeColor : inactiveColor, fontWeight: isActive('/') ? '600' : 'normal' }}>
            Əsas
          </span>
        </button>

        {/* 2. Məhsullar */}
        <button onClick={() => navigate('/products')} style={buttonStyle}>
          <Package size={20} color={isActive('/products') ? activeColor : inactiveColor} />
          <span style={{ fontSize: '0.7rem', color: isActive('/products') ? activeColor : inactiveColor, fontWeight: isActive('/products') ? '600' : 'normal' }}>
            Məhsullar
          </span>
        </button>

        {/* 3. QR */}
        <button onClick={() => setShowQrModal(true)} style={buttonStyle}>
          <QrCode size={20} color={inactiveColor} />
          <span style={{ fontSize: '0.7rem', color: inactiveColor }}>QR</span>
        </button>

        {/* 4. Ödənişlər */}
        <button onClick={() => navigate('/payments')} style={buttonStyle}>
          <Wallet size={20} color={isActive('/payments') ? activeColor : inactiveColor} />
          <span style={{ fontSize: '0.7rem', color: isActive('/payments') ? activeColor : inactiveColor, fontWeight: isActive('/payments') ? '600' : 'normal' }}>
            Ödənişlər
          </span>
        </button>

        {/* 5. Daha çox */}
        <button onClick={() => setShowMoreModal(true)} style={buttonStyle}>
          <Grid size={20} color={showMoreModal ? activeColor : inactiveColor} />
          <span style={{ fontSize: '0.7rem', color: showMoreModal ? activeColor : inactiveColor, fontWeight: showMoreModal ? '600' : 'normal' }}>
            Daha çox
          </span>
        </button>
      </nav>

      {/* ---------- QR MODAL ---------- */}
      {showQrModal && (
        <div style={overlayStyle} onClick={() => setShowQrModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#1a1a1a' }}>QR ilə ödə</h3>
              <button onClick={() => setShowQrModal(false)} style={closeButtonStyle}>
                <X size={20} color="#495057" />
              </button>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ 
                width: '180px', 
                height: '180px', 
                margin: '0 auto 1.5rem auto', 
                border: `2px dashed ${activeColor}`, 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(14, 90, 241, 0.05)'
              }}>
                <QrCode size={100} color={activeColor} />
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#495057' }}>
                Kameranı kassa və ya terminaldakı <b>QR koda</b> yaxınlaşdırın
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------- DAHA ÇOX MODAL (Kənardan gələn komponent) ---------- */}
      <MoreServicesModal 
        isOpen={showMoreModal} 
        onClose={() => setShowMoreModal(false)} 
      />
    </>
  );
};

// Yalnız istifadə olunan stillər saxlanıldı
const buttonStyle = { background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer', flex: 1 };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 2000, backdropFilter: 'blur(3px)' };
const modalStyle = { backgroundColor: '#ffffff', width: '100%', maxWidth: '500px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '1.2rem', boxShadow: '0 -10px 25px rgba(0,0,0,0.1)' };
const modalHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f3f5' };
const closeButtonStyle = { background: '#f1f3f5', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };

export default BottomNavbar;