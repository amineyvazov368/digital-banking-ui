import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Wallet, 
  MapPin, 
  Store, 
  Headphones, 
  Sparkles, 
  User, 
  Bell, 
  X, 
  ChevronRight 
} from 'lucide-react';

export const MoreServicesModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999,
        backdropFilter: 'blur(6px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#ffffff',
          width: '90%',
          maxWidth: '680px',
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: '20px',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          color: '#1e293b',
          border: '1px solid #f1f5f9'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem', 
          paddingBottom: '0.85rem', 
          borderBottom: '1px solid #e2e8f0' 
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
              Xidmətlər və Bölmələr
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Bütün bank imkanları bir yerdə
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '50%', 
              width: '36px', 
              height: '36px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#64748b', 
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={sectionHeaderStyle}>Maliyyə Vəsaitləri</div>
            <div style={gridStyle}>
              <DesktopCardItem 
                icon={<CreditCard size={20} color="#0e5af1" />} 
                title="Kartlar" 
                desc="Debet və Kredit kartları"
                onClick={() => handleNavigate('/cards')}
              />
              <DesktopCardItem 
                icon={<Wallet size={20} color="#0e5af1" />} 
                title="Hesablar" 
                desc="Cari və Əmanət hesabları"
                onClick={() => handleNavigate('/accounts')}
              />
            </div>
          </div>

          <div>
            <div style={sectionHeaderStyle}>Məhsullar və Dəstək</div>
            <div style={gridStyle}>
              <DesktopCardItem 
                icon={<MapPin size={20} color="#10b981" />} 
                title="Filial və Bankomatlar" 
                desc="Ən yaxın ünvanı tapın"
                onClick={() => handleNavigate('/branches')}
              />
              <DesktopCardItem 
                icon={<Store size={20} color="#f59e0b" />} 
                title="Partnyorlar & Keşbek" 
                desc="Bonus qazanacağınız yerlər"
                onClick={() => handleNavigate('/partners')}
              />
              <DesktopCardItem 
                icon={<Headphones size={20} color="#6366f1" />} 
                title="Bankla Əlaqə" 
                desc="24/7 Dəstək xidməti"
                onClick={() => handleNavigate('/contact')}
              />
              <DesktopCardItem 
                icon={<Sparkles size={20} color="#ec4899" />} 
                title="Kampaniyalar" 
                desc="Xüsusi endirimlər və təkliflər"
                onClick={() => handleNavigate('/campaigns')}
              />
            </div>
          </div>

          <div>
            <div style={sectionHeaderStyle}>Şəxsi Kabinet</div>
            <div style={gridStyle}>
              <DesktopCardItem 
                icon={<User size={20} color="#64748b" />} 
                title="Profil Tənzimləmələri" 
                desc="Məlumatlarınızı yeniləyin"
                onClick={() => handleNavigate('/profile')}
              />
              <DesktopCardItem 
                icon={<Bell size={20} color="#64748b" />} 
                title="Bildiriş Tənzimləmələri" 
                desc="SMS və PUSH xəbərdarlıqlar"
                onClick={() => handleNavigate('/notifications')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Yardımçı Stillər və Komponent
const sectionHeaderStyle = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '0.6rem'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '0.75rem'
};

const DesktopCardItem = ({ icon, title, desc, onClick }) => (
  <div 
    onClick={onClick}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0.85rem 1rem', 
      borderRadius: '12px',
      backgroundColor: '#f8fafc',
      border: '1px solid #f1f5f9',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '10px', 
        backgroundColor: '#ffffff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
        border: '1px solid #e2e8f0',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>{title}</span>
        <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1px' }}>{desc}</span>
      </div>
    </div>
    <ChevronRight size={16} color="#cbd5e1" />
  </div>
);

export default MoreServicesModal;