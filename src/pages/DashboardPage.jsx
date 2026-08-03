import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import cardService from '../services/cardService';
import { useNotification } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search,
  Bell,
  User,
  LogOut,
  History,
  Send,
  CreditCard,
  PlusCircle
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotification();
  
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. İstifadəçinin bütün kartlarını backend-dən çəkirik
        let rawCards = [];
        try {
          const cardResponse = await cardService.getMyCards();
          rawCards = cardResponse.data || cardResponse || [];
        } catch (cardErr) {
          console.warn("Kart servisi xətası:", cardErr);
        }

        // 2. Hesab məlumatlarını və balansları sinxronlaşdırırıq
        let updatedCards = [];
        let accountMap = {};

        if (Array.isArray(rawCards) && rawCards.length > 0) {
          updatedCards = await Promise.all(
            rawCards.map(async (card) => {
              const targetAccountId = card.accountId || card.account?.id;
              
              // Əgər kartın daxilində balans artıq varsa, əlavə API sorğusuna ehtiyac yoxdur
              if (card.balance !== undefined && card.balance !== null) {
                return card;
              }

              if (targetAccountId) {
                if (!accountMap[targetAccountId]) {
                  try {
                    const accountData = await accountService.getAccountById(targetAccountId);
                    accountMap[targetAccountId] = accountData;
                  } catch (accErr) {
                    console.error(`Account ID ${targetAccountId} detal xətası:`, accErr);
                  }
                }

                const matchedAccount = accountMap[targetAccountId];
                return {
                  ...card,
                  account: matchedAccount || card.account,
                  balance: matchedAccount ? matchedAccount.balance : (card.balance || 0)
                };
              }
              return card;
            })
          );
        }

        setCards(updatedCards);

        // 3. İlk kartın aid olduğu hesabın son transaksiyalarını gətiririk
        if (rawCards.length > 0) {
          const firstAccId = rawCards[0].accountId || (rawCards[0].account?.id);
          if (firstAccId) {
            try {
              const txData = await transactionService.getTransactions({
                accountId: firstAccId,
                limit: 5
              });
              setTransactions(txData || []);
            } catch (txErr) {
              console.error("Transaksiyaları gətirərkən xəta:", txErr);
            }
          }
        }

      } catch (err) {
        console.error('Dashboard məlumat xətası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('banking_token');
    localStorage.removeItem('token');
    localStorage.removeItem('banking_user');
    navigate('/login');
    window.location.href = '/login';
  };

  if (loading) return <LoadingSpinner />;

  const activeCardsCount = cards.filter(c => c.cardStatus === 'ACTIVE' || !c.cardStatus).length;
  const isCardLimitReached = activeCardsCount >= 9;

  return (
    <div
      className="mobile-dashboard-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        paddingBottom: isMobile ? '80px' : '20px',
        fontFamily: 'sans-serif',
        maxWidth: isMobile ? '600px' : '100%',
        margin: isMobile ? '0 auto' : '0',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <User
          size={20}
          style={{ color: '#6c757d', cursor: 'pointer' }}
          onClick={() => navigate('/profile')}
        />
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#f1f3f5',
          padding: '0.5rem 1rem',
          borderRadius: '20px'
        }}>
          <Search size={16} style={{ color: '#868e96' }} />
          <input
            type="text"
            placeholder="Axtar"
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>

        {/* Bildiriş İkonu */}
        <button
          onClick={() => navigate('/notifications')}
          aria-label="Bildirişlər"
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            outline: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <Bell size={20} style={{ color: '#6c757d' }} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: '#e31e24',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                minWidth: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                boxShadow: '0 0 0 2px #f8f9fa'
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <LogOut
          size={20}
          style={{ color: '#e31e24', cursor: 'pointer' }}
          onClick={handleLogout}
        />
      </header>

      {/* 2. Stories */}
      <section style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: '150px', height: '100px', borderRadius: '16px', background: 'linear-gradient(135deg, #e31e24, #b01217)', color: '#fff', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Yeniliklər</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Kampaniyaları izlə</span>
        </div>
        <div style={{ minWidth: '150px', height: '100px', borderRadius: '16px', background: 'linear-gradient(135deg, #4dabf7, #228be6)', color: '#fff', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Vakansiyalar</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Komandamıza qoşul</span>
        </div>
        <div style={{ minWidth: '150px', height: '100px', borderRadius: '16px', background: 'linear-gradient(135deg, #51cf66, #37b24d)', color: '#fff', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Keşbek</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>30%-dək keşbek qazan</span>
        </div>
      </section>

      {/* 3. İnfo Kartları */}
      <section style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff', padding: '0.5rem 1rem', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#12b886', fontWeight: 'bold', fontSize: '0.85rem' }}>₼</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>ƏDV: 0.00 ₼</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff', padding: '0.5rem 1rem', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#e31e24', fontWeight: 'bold' }}>♥</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Umico</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff', padding: '0.5rem 1rem', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#fab005', fontWeight: 'bold' }}>★</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Keşbek</span>
        </div>
      </section>

      {/* 4. Sürətli Keçidlər */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <button onClick={() => navigate('/transfer')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#fff', border: 'none', borderRadius: '16px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer' }}>
          <Send size={24} style={{ color: '#e31e24' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#343a40' }}>Köçürmə</span>
        </button>
        <button onClick={() => navigate('/payments')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#fff', border: 'none', borderRadius: '16px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer' }}>
          <CreditCard size={24} style={{ color: '#e31e24' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#343a40' }}>Ödənişlər</span>
        </button>
        <button onClick={() => navigate('/transactions')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#fff', border: 'none', borderRadius: '16px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer' }}>
          <History size={24} style={{ color: '#e31e24' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#343a40' }}>Tarixçə</span>
        </button>
      </section>

      {/* 5. Kartlarım Bölməsi */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#212529', margin: 0 }}>Kartlarım</h3>
            {activeCardsCount > 0 && (
              <span style={{ fontSize: '0.7rem', color: '#868e96', backgroundColor: '#e9ecef', padding: '2px 6px', borderRadius: '10px' }}>
                {activeCardsCount}/9
              </span>
            )}
          </div>
          <Link to="/cards" style={{ fontSize: '0.8rem', color: '#e31e24', textDecoration: 'none', fontWeight: 600 }}>Hamısı</Link>
        </div>

        <div
          className="cards-container"
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '1rem',
            overflowX: isMobile ? 'visible' : 'auto',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            alignItems: isMobile ? 'stretch' : 'center'
          }}
        >
          {cards.map((card, index) => {
            const currentCardNumber = card.cardNumber || "0000000000000000";
            const lastFour = currentCardNumber.slice(-4);
            const cardType = card.cardType || card.type || (index % 2 === 0 ? "Visa" : "Mastercard");

            return (
              <div
                key={card.id || index}
                onClick={() => {
                  const targetId = card.id || card.cardId;
                  if (targetId) {
                    navigate(`/cards/${targetId}`);
                  } else {
                    console.error("Kartın ID-si tapılmadı:", card);
                  }
                }}
                style={{
                  width: '100%',
                  minWidth: isMobile ? 'auto' : '280px',
                  backgroundColor: '#fff',
                  borderRadius: '16px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  border: '1px solid #e9ecef',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '55px',
                    height: '35px',
                    borderRadius: '6px',
                    background: cardType.toLowerCase().includes('visa')
                      ? 'linear-gradient(135deg, #1a1f71, #00579f)'
                      : 'linear-gradient(135deg, #ff5f00, #eb001b)',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '4px 6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <span style={{ fontSize: '0.5rem', fontWeight: 'bold', fontStyle: 'italic' }}>
                      {cardType.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '0.55rem', alignSelf: 'flex-end', letterSpacing: '0.5px' }}>•• {lastFour}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#343a40' }}>
                      {card.cardHolder || card.name || `Debet Kart`}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#868e96' }}>
                      {cardType} •• {lastFour}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#212529' }}>
                    {Number(card.balance || 0).toFixed(2)} ₼
                  </span>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => !isCardLimitReached && navigate('/cards/create')}
            disabled={isCardLimitReached}
            style={{
              width: '100%',
              minWidth: isMobile ? 'auto' : '160px',
              height: '69px',
              backgroundColor: isCardLimitReached ? '#e9ecef' : '#fff',
              border: isCardLimitReached ? '1px dashed #ced4da' : '1px dashed #e31e24',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              cursor: isCardLimitReached ? 'not-allowed' : 'pointer',
              color: isCardLimitReached ? '#adb5bd' : '#e31e24',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              padding: '0.5rem',
              boxSizing: 'border-box'
            }}
          >
            <PlusCircle size={20} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {cards.length === 0 ? 'İlk kartını sifariş et' : 'Yeni kart yarat'}
            </span>
          </button>
        </div>
      </section>

      {/* 6. Banner */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '1rem', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#212529' }}>30%-dək keşbek qazan!</span>
          <span style={{ fontSize: '0.75rem', color: '#868e96' }}>Kartı elə indi onlayn sifariş edin.</span>
        </div>
        <div style={{ width: '55px', height: '40px', backgroundColor: '#e31e24', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.8rem', transform: 'rotate(-5deg)' }}>
          KART
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;