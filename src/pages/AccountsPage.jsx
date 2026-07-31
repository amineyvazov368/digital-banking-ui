import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';
import AccountCard from '../components/AccountCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { Plus, Info, AlertTriangle, RefreshCw } from 'lucide-react';

export const AccountsPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mobil ekran təyini üçün responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountService.getMyAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Hesablar yüklənərkən xəta baş verdi:', err);
      setError('Hesabları yükləyərkən xəta baş verdi. Zəhmət olmasa internet bağlantınızı və ya yenidən daxil olduğunuzu yoxlayın.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div 
      className="page-container" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '1.25rem' : '1.75rem', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: isMobile ? '1rem' : '1.5rem',
        paddingBottom: isMobile ? '5rem' : '1.5rem', // Mobil BottomNavbar üçün aşağıdan boşluq
        boxSizing: 'border-box',
        width: '100%'
      }}
    >
      
      {/* Başlıq Hissəsi */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div>
          <h2 style={{ 
            fontSize: isMobile ? '1.3rem' : '1.5rem', 
            fontWeight: 800, 
            color: '#FFFFFF', 
            margin: 0 
          }}>
            Bank Hesablarım
          </h2>
          <p style={{ 
            fontSize: isMobile ? '0.8rem' : '0.875rem', 
            color: '#94A3B8', 
            marginTop: '0.25rem' 
          }}>
            Cari, yığım və depozit hesablarınızı idarə edin.
          </p>
        </div>

        {/* Düymələr bloku - Mobildə tam enli olur */}
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem',
          flexDirection: isMobile ? 'row' : 'row',
          width: isMobile ? '100%' : 'auto'
        }}>
          <div style={{ flex: isMobile ? 1 : 'initial' }}>
            <Button 
              variant="secondary" 
              onClick={fetchAccounts} 
              icon={RefreshCw}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Yenilə
            </Button>
          </div>
          <div style={{ flex: isMobile ? 1 : 'initial' }}>
            <Button 
              variant="primary" 
              onClick={() => navigate('/accounts/create')} 
              icon={Plus}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Yeni Hesab Aç
            </Button>
          </div>
        </div>
      </div>

      {/* Xəta Mesajı */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          padding: isMobile ? '1rem' : '1.25rem',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderRadius: '16px',
          color: '#F87171'
        }}>
          <AlertTriangle size={22} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: isMobile ? '0.825rem' : '0.9rem', fontWeight: 500, lineHeight: 1.4 }}>
            {error}
          </span>
        </div>
      )}

      {/* Hesablar Grid Siyahısı */}
      {!error && (
        accounts.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile 
              ? '1fr' 
              : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: isMobile ? '1rem' : '1.25rem',
            width: '100%'
          }}>
            {accounts.map((acc) => (
              <AccountCard key={acc.id || acc.accountNumber} account={acc} />
            ))}
          </div>
        ) : (
          <div style={{
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            textAlign: 'center',
            padding: isMobile ? '2.5rem 1.25rem' : '4rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              width: isMobile ? '52px' : '64px',
              height: isMobile ? '52px' : '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B'
            }}>
              <Info size={isMobile ? 26 : 32} />
            </div>
            <div>
              <h4 style={{ 
                color: '#F8FAFC', 
                fontSize: isMobile ? '1.05rem' : '1.15rem', 
                fontWeight: 700, 
                marginBottom: '0.4rem' 
              }}>
                Aktiv hesab tapılmadı
              </h4>
              <p style={{ 
                color: '#94A3B8', 
                fontSize: isMobile ? '0.825rem' : '0.9rem', 
                maxWidth: '400px', 
                margin: '0 auto',
                lineHeight: 1.4
              }}>
                Bank əməliyyatlarına başlamaq və yeni kartlar almaq üçün cari və ya yığım hesabı açın.
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => navigate('/accounts/create')} 
              icon={Plus}
              style={{ width: isMobile ? '100%' : 'auto', maxWidth: '280px', justifyContent: 'center' }}
            >
              Hesab Aç
            </Button>
          </div>
        )
      )}
    </div>
  );
};

export default AccountsPage;