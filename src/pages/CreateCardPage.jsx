import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';
import cardService from '../services/cardService';
import Select from '../components/Select';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, CreditCard, Shield, Plus } from 'lucide-react';

export const CreateCardPage = () => {
  const navigate = useNavigate();
  
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  
  // State-lər yeni Enum strukturlarına tam uyğunlaşdırıldı
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [cardType, setCardType] = useState('DEBIT');    // Enum: DEBIT, VIRTUAL, CREDIT
  const [cardForm, setCardForm] = useState('PHYSICAL'); // Enum: PHYSICAL, VIRTUAL
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Ekran ölçüsünü izləmək və mobil responsivliyi təmin etmək üçün state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 576);
    window.addEventListener('resize', handleResize);
    
    const loadAccounts = async () => {
      try {
        const response = await accountService.getMyAccounts();
        const data = response.data || response || [];
        setAccounts(data);
        
        if (data.length > 0) {
          setSelectedAccountId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load accounts for card order', err);
      } finally {
        setLoadingAccounts(false);
      }
    };
    
    loadAccounts();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAccountId) {
      setError('Zəhmət olmasa kartın bağlanacağı aktiv bir hesab seçin.');
      return;
    }

    setError('');
    setSubmitting(true);
    
    try {
      // Backend DTO: { cardType: "DEBIT", cardForm: "PHYSICAL" }
      await cardService.createCard(selectedAccountId, {
        cardType,
        cardForm
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Kart sifarişi zamanı xəta baş verdi. Limitləri yoxlayın.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAccounts) return <LoadingSpinner />;

  return (
    <div className="page-container" style={{ 
      maxWidth: '600px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.25rem', 
      margin: '0 auto', 
      padding: isMobile ? '0.5rem' : '1.5rem' 
    }}>
      <div>
        <Button variant="secondary" onClick={() => navigate('/dashboard')} icon={ArrowLeft}>
          Geri
        </Button>
      </div>

      <div className="glass-card" style={{ 
        padding: isMobile ? '1.25rem' : '2rem', 
        backgroundColor: '#fff', 
        borderRadius: '16px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
      }}>
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e9ecef', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, color: '#212529', letterSpacing: '-0.5px' }}>
            Yeni Bank Kartı Sifarişi
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#868e96', marginTop: '0.25rem' }}>
            Kart növünü və bağlanacağı bank hesabını müəyyən edin.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fff5f5',
            color: '#e31e24',
            border: '1px solid #ffe3e3',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {/* Mobil Uyumlu İdarəetmə Paneli (Flex-direction mobildə column olur) */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'stretch' : 'center', 
          backgroundColor: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '12px', 
          marginBottom: '1.25rem',
          border: '1px dashed #ced4da',
          gap: isMobile ? '0.75rem' : '0.5rem'
        }}>
          <span style={{ fontSize: '0.85rem', color: '#495057', fontWeight: 500, textAlign: isMobile ? 'center' : 'left' }}>
            {accounts.length === 0 ? 'Aktiv hesabınız yoxdur.' : 'Başqa bir valyutada yeni hesab istəyirsiniz?'}
          </span>
          <Button 
            variant="outline" 
            size="small"
            onClick={() => navigate('/accounts/create')} 
            icon={Plus}
            style={{ 
              fontSize: '0.8rem', 
              padding: '0.5rem 0.75rem', 
              borderColor: '#e31e24', 
              color: '#e31e24',
              justifyContent: 'center'
            }}
          >
            Yeni Hesab Aç
          </Button>
        </div>

        {accounts.length > 0 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <Select
              label="Bağlanacaq Hesab (Source Account)"
              name="accountId"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              options={accounts.map(acc => ({
                value: acc.id,
                label: `${acc.accountNumber} - Balans: ${acc.balance?.toFixed(2)} ${acc.currency || 'AZN'}`
              }))}
              required
            />

            <Select
              label="Kart Növü (Card Type)"
              name="cardType"
              value={cardType}
              onChange={(e) => setCardType(e.target.value)}
              options={[
                { value: 'DEBIT', label: 'Debet Kart (Debit)' },
                { value: 'CREDIT', label: 'Kredit Kartı (Credit)' },
                { value: 'CASHBACK', label: 'CASHBACK Kart (CASHBACK)' }
              ]}
              required
            />

            <Select
              label="Kart Forması (Card Form)"
              name="cardForm"
              value={cardForm}
              onChange={(e) => setCardForm(e.target.value)}
              options={[
                { value: 'PHYSICAL', label: 'Plastik Kart (Physical)' },
                { value: 'VIRTUAL', label: 'Rəqəmsal Kart (Virtual)' }
              ]}
              required
            />

            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '10px',
              padding: '1rem',
              fontSize: '0.8rem',
              color: '#6c757d',
              marginBottom: '0.5rem',
              lineHeight: '1.5',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <Shield size={20} style={{ color: '#e31e24', flexShrink: 0 }} />
              <div>
                <strong>Təhlükəsiz Sifariş:</strong><br />
                Hər bir hesab üzrə maksimum 3 aktiv kart limitiniz mövcuddur. Kartlarınız 3D Secure təhlükəsizlik protokolu ilə tam qorunur.
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              style={{ 
                width: '100%', 
                padding: '0.875rem', 
                backgroundColor: '#e31e24', 
                borderColor: '#e31e24', 
                color: '#fff',
                justifyContent: 'center'
              }}
              icon={CreditCard}
            >
              Kartı Sifariş Et
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateCardPage;