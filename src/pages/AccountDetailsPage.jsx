import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';
import cardService from '../services/cardService';
import transactionService from '../services/transactionService';
import LoadingSpinner from '../components/LoadingSpinner';
import TransactionTable from '../components/TransactionTable';
import Button from '../components/Button';
import { 
  ArrowLeft, Send, Landmark, ShieldCheck, 
  Trash2, CreditCard, Plus, AlertCircle, Copy, Check, Lock
} from 'lucide-react';

export const AccountDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [copied, setCopied] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Hesab məlumatlarını çək
        const accData = await accountService.getAccountById(id);
        setAccount(accData);

        // 2. Hesaba aid kartları gətir (cardService.getCardsByAccount)
        try {
          const cardsData = await cardService.getCardsByAccount(id);
          setCards(Array.isArray(cardsData) ? cardsData : []);
        } catch (cErr) {
          console.warn('Kartlar yüklənərkən xəta:', cErr);
          setCards([]);
        }

        // 3. Əgər hesab nömrəsi varsa, Tranzaksiyaları çək
        if (accData?.accountNumber) {
          try {
            const txData = await transactionService.getTransactions({ accountNumber: accData.accountNumber });
            setTransactions(Array.isArray(txData) ? txData : []);
          } catch (tErr) {
            console.warn('Əməliyyatlar yüklənərkən xəta:', tErr);
            setTransactions([]);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Hesab məlumatları tapılmadı və ya sistemdə xəta baş verdi.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAllData();
  }, [id]);

  // Hesabı Bağlamaq / Silmək (Backend Endpoint: PATCH /api/accounts/{accountId}/close)
  const handleCloseAccount = async () => {
    try {
      setClosing(true);
      await accountService.closeAccount(id);
      setIsCloseModalOpen(false);
      navigate('/accounts');
    } catch (err) {
      alert('Hesab bağlanarkən xəta baş verdi. Zəhmət olmasa balansı sıfırladığınızdan və ya aktiv öhdəliklərin olmadığından əmin olun.');
      console.error(err);
    } finally {
      setClosing(false);
    }
  };

  const copyAccountNumber = () => {
    if (account?.accountNumber) {
      navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error || !account) {
    return (
      <div className="page-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Button variant="secondary" onClick={() => navigate('/accounts')} icon={ArrowLeft}>
          Hesablara Qayıt
        </Button>
        <div style={{
          marginTop: '2rem',
          padding: '2.5rem',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '20px',
          textAlign: 'center',
          color: '#F87171'
        }}>
          <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{error || 'Seçilmiş hesab tapılmadı.'}</h3>
        </div>
      </div>
    );
  }

  const currencySymbol = account.currency === 'USD' ? '$' : account.currency === 'EUR' ? '€' : '₼';

  return (
    <div 
      className="page-container" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '1.25rem' : '2rem', 
        maxWidth: '1100px', 
        margin: '0 auto', 
        padding: isMobile ? '1rem' : '1.5rem',
        paddingBottom: isMobile ? '5.5rem' : '1.5rem', // Mobil navbar üçün alt boşluq
        boxSizing: 'border-box',
        width: '100%'
      }}
    >
      
      {/* Navigation & Delete Bar */}
      <div style={{ 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center', 
        gap: '0.75rem',
        width: '100%'
      }}>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/accounts')} 
          icon={ArrowLeft}
          style={{ 
            fontSize: isMobile ? '0.8rem' : '0.875rem', 
            padding: isMobile ? '0.5rem 0.8rem' : '0.6rem 1.2rem',
            flex: isMobile ? '1' : 'initial',
            justifyContent: 'center'
          }}
        >
          {isMobile ? 'Qayıt' : 'Hesablara Qayıt'}
        </Button>
        
        <button 
          onClick={() => setIsCloseModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: isMobile ? '0.5rem 0.8rem' : '0.6rem 1.2rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#F87171',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: isMobile ? '0.8rem' : '0.875rem',
            transition: 'all 0.2s ease',
            flex: isMobile ? '1' : 'initial'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
        >
          <Trash2 size={16} /> Hesabı Bağla
        </button>
      </div>

      {/* Hesab Banneri */}
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        borderRadius: isMobile ? '18px' : '24px',
        padding: isMobile ? '1.25rem' : '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: isMobile ? '1.25rem' : '2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '4px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              display: 'inline-block'
            }}>
              {account.accountType || account.type || 'CHECKING'} Account
            </span>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '0.5rem', 
              marginTop: '0.85rem',
              flexWrap: 'wrap' 
            }}>
              <h1 style={{ 
                fontSize: isMobile ? '1.25rem' : '1.6rem', 
                fontWeight: 800, 
                color: '#FFFFFF', 
                letterSpacing: '0.5px', 
                margin: 0, 
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                {account.accountNumber}
              </h1>
              <button 
                onClick={copyAccountNumber}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: copied ? '#34D399' : '#94A3B8',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  flexShrink: 0
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: isMobile ? '0.75rem' : '1.25rem', 
            marginTop: '1.25rem', 
            color: '#94A3B8', 
            fontSize: isMobile ? '0.78rem' : '0.85rem' 
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34D399' }}>
              <ShieldCheck size={16} /> Status: {account.status || 'ACTIVE'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Landmark size={16} /> Valyuta: {account.currency || 'AZN'}
            </span>
          </div>
        </div>

        {/* Balans və Köçürmə Düyməsi */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justify: 'center',
          alignItems: 'flex-start',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          padding: isMobile ? '1rem' : '1.5rem',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
            Mövcud Balans
          </span>
          <div style={{ 
            fontSize: isMobile ? '1.8rem' : '2.4rem', 
            fontWeight: 800, 
            color: '#FFFFFF', 
            margin: '0.2rem 0 1rem 0', 
            letterSpacing: '-0.5px' 
          }}>
            {currencySymbol} {Number(account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>

          <Button 
            variant="primary" 
            onClick={() => navigate('/transfer', { state: { sourceAccountNumber: account.accountNumber } })}
            icon={Send}
            style={{ width: '100%', padding: '0.75rem', fontSize: isMobile ? '0.85rem' : '0.95rem', justifyContent: 'center' }}
          >
            Bu Hesabdan Köçürmə Et
          </Button>
        </div>
      </div>

      {/* Hesaba Bağlı Kartlar */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '0.75rem' : '0'
        }}>
          <div>
            <h3 style={{ fontSize: isMobile ? '1.05rem' : '1.2rem', fontWeight: 700, color: '#F8FAFC', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="#3B82F6" /> Hesaba Bağlı Kartlar ({cards.length})
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
              Bu hesabın balansına birbaşa bağlı olan plastik və rəqəmsal kartlar
            </p>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/cards/create?accountId=${id}`)} 
            icon={Plus}
            style={{ 
              fontSize: '0.8rem', 
              width: isMobile ? '100%' : 'auto', 
              justify: 'center' 
            }}
          >
            Yeni Kart Aç
          </Button>
        </div>

        {cards.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {cards.map((card) => (
              <div 
                key={card.id} 
                onClick={() => navigate(`/cards/${card.id}`)}
                style={{
                  background: card.cardType === 'VISA' 
                    ? 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)' 
                    : 'linear-gradient(135deg, #3F1D38 0%, #0F172A 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#93C5FD', letterSpacing: '1px' }}>
                    {card.cardType || 'CARD'}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: card.cardStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: card.cardStatus === 'ACTIVE' ? '#34D399' : '#F87171'
                  }}>
                    {card.cardStatus || 'ACTIVE'}
                  </span>
                </div>

                <div style={{ fontSize: isMobile ? '1.05rem' : '1.15rem', fontWeight: 700, color: '#FFF', letterSpacing: '2px', fontFamily: 'monospace', marginBottom: '1rem' }}>
                  {card.cardNumber ? card.cardNumber.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.75rem' }}>
                  <span>{card.cardForm || 'PLASTIC'}</span>
                  <span>Bitmə müddəti: {card.expiryDate || '12/28'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: isMobile ? '1.5rem 1rem' : '2rem',
            backgroundColor: 'rgba(30, 41, 59, 0.3)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            textAlign: 'center',
            color: '#94A3B8',
            fontSize: '0.85rem'
          }}>
            Bu hesaba bağlı heç bir aktiv bank kartı tapılmadı.
          </div>
        )}
      </section>

      {/* Əməliyyat Çıxarışı */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: isMobile ? '1.05rem' : '1.2rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
          Hesab Çıxarışı (Tranzaksiyalar)
        </h3>
        <div style={{
          backgroundColor: 'rgba(226, 227, 231, 0.6)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: isMobile ? '0.5rem' : '1rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <TransactionTable transactions={transactions} />
        </div>
      </section>

      {/* Hesab Silmə Modalı */}
      {isCloseModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#1E293B',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: isMobile ? '1.25rem' : '2rem',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#F87171', marginBottom: '1rem' }}>
              <AlertCircle size={24} style={{ flexShrink: 0 }} />
              <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 700, margin: 0 }}>Hesabı bağlamağa əminsiniz?</h3>
            </div>
            <p style={{ color: '#94A3B8', fontSize: isMobile ? '0.825rem' : '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              <strong style={{ color: '#FFF' }}>{account.accountNumber}</strong> nömrəli hesabı bağlamaq üzrəsiniz. Hesabı bağlamazdan əvvəl balansı sıfırlamalısınız.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexDirection: isMobile ? 'column' : 'row' }}>
              <Button 
                variant="secondary" 
                onClick={() => setIsCloseModalOpen(false)}
                style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
              >
                Ləğv Et
              </Button>
              <button
                onClick={handleCloseAccount}
                disabled={closing}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  backgroundColor: '#DC2626',
                  color: '#FFF',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: closing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                {closing ? 'Bağlanılır...' : 'Bəli, Hesabı Bağla'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountDetailsPage;