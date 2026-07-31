import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import transactionService from '../services/transactionService';
import cardService from '../services/cardService';
import userService from '../services/authService'; // Və ya authService (İstifadəçi məlumatını almaq üçün)
import LoadingSpinner from '../components/LoadingSpinner';
import { RefreshCw, ArrowLeft, ArrowUpRight, ArrowDownLeft, CreditCard, Inbox } from 'lucide-react';

export const TransactionsPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCardNumber, setSelectedCardNumber] = useState('');

  // 1. İstifadəçi məlumatını və kartları yükləyirik
  useEffect(() => {
    const fetchData = async () => {
      try {
        // İstifadəçi ad və soyadını alırıq
        if (userService?.getProfile) {
          const user = await userService.getProfile();
          setCurrentUser(user);
        } else if (userService?.getCurrentUser) {
          const user = await userService.getCurrentUser();
          setCurrentUser(user);
        }

        const cardData = await cardService.getMyCards();
        setCards(Array.isArray(cardData) ? cardData : []);
      } catch (err) {
        console.error('Məlumatları yükləyərkən xəta:', err);
      }
    };
    fetchData();
  }, []);

  // 2. Tranzaksiyaları yükləyirik
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const txData = await transactionService.getTransactions({
        cardNumber: selectedCardNumber
      });
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (err) {
      console.error('Əməliyyat tarixçəsini yükləyərkən xəta:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedCardNumber]);

  // Tarixlərə görə qruplaşdırma
  const groupTransactionsByDate = (txList) => {
    const groups = {};
    txList.forEach((tx) => {
      const rawDate = tx.createdAt || tx.timestamp || tx.date;
      if (!rawDate) return;

      const dateObj = new Date(rawDate);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      const dateStr = `${day}.${month}.${year}`;

      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(tx);
    });
    return groups;
  };

  // Əmrin verilən MƏNTİQİ: 
  // Göndərən ad və soyad (birinci tərəf) Login olan adamdırsa -> ÇIXAÇDIR (-)
  // Başqa adamdırsa -> MƏDAXİLDİR (+)
  const checkIsDeposit = (tx) => {
    if (!currentUser) {
      // Əgər istifadəçi hələ yüklənməyibsə, tx.senderName ilə fallback edirik
      return false;
    }

    const currentFullName = `${currentUser.name || ''} ${currentUser.surname || ''}`.trim().toLowerCase();
    const senderFullName = String(tx.senderName || '').trim().toLowerCase();

    // Əgər Göndərən adı mənə eynidirsə -> Məxaricdir (-), başqası göndəribsə -> Mədaxildir (+)
    if (senderFullName && currentFullName && senderFullName === currentFullName) {
      return false; // Məxaric (-)
    }

    // Əgər birinci tərəf başqasıdırsa, deməli pul gəlib
    if (senderFullName && currentFullName && senderFullName !== currentFullName) {
      return true; // Mədaxil (+)
    }

    return false;
  };

  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '1.5rem 1rem',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        maxWidth: '720px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Üst Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#ffffff',
              border: '1px solid #e9ecef',
              borderRadius: '12px',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={20} style={{ color: '#212529' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Əməliyyat Tarixçəsi
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '2px 0 0 0' }}>
              Bütün giriş və çıxış əməliyyatları
            </p>
          </div>
        </div>

        <button
          onClick={loadTransactions}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            background: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Kart Seçimi Dropdown */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <CreditCard size={20} />
        </div>

        <div style={{ flex: 1 }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.725rem',
              fontWeight: '700',
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}
          >
            Kart seçin
          </label>
          <select
            value={selectedCardNumber}
            onChange={(e) => setSelectedCardNumber(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: '10px',
              border: '1px solid #d1d5db',
              backgroundColor: '#f9fafb',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#111827',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Bütün Kartlar (Hamısı)</option>
            {cards.map((card) => {
              const fullNumber = card.cardNumber || '';
              const lastFour = fullNumber.length >= 4 ? fullNumber.slice(-4) : '****';
              return (
                <option key={card.id || fullNumber} value={fullNumber}>
                  {card.cardType || 'Kart'} (•••• {lastFour})
                </option>
              );
            })}
          </select>
        </div>
      </section>

      {/* Tranzaksiyalar Siyahısı */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '1.25rem',
          minHeight: '350px',
          position: 'relative',
          border: '1px solid #e5e7eb'
        }}
      >
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.75)',
              borderRadius: '20px',
              zIndex: 10
            }}
          >
            <LoadingSpinner size="medium" />
          </div>
        )}

        {!loading &&
          Object.keys(groupedTransactions).map((dateStr) => (
            <div key={dateStr} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    backgroundColor: '#991b1b',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}
                >
                  {dateStr}
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#f3f4f6' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {groupedTransactions[dateStr].map((tx) => {
                  const isDeposit = checkIsDeposit(tx);
                  const dateObj = new Date(tx.createdAt || tx.timestamp || tx.date);
                  const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

                  let transactionTitle = tx.description;
                  if (tx.senderName && tx.receiverName) {
                    transactionTitle = `${tx.senderName} ➔ ${tx.receiverName}`;
                  } else if (!transactionTitle) {
                    transactionTitle = isDeposit ? 'Mədaxil' : 'Köçürmə';
                  }

                  return (
                    <div
                      key={tx.id || Math.random()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        borderBottom: '1px solid #f3f4f6'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: isDeposit ? '#ecfdf5' : '#fff1f2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isDeposit ? '#059669' : '#dc2626'
                          }}
                        >
                          {isDeposit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                            {transactionTitle}
                          </p>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {timeStr}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: isDeposit ? '#16a34a' : '#111827'
                          }}
                        >
                          {isDeposit ? '+' : '-'}{Math.abs(tx.amount).toFixed(2)} AZN
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        {!loading && transactions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
            <Inbox size={40} style={{ marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, fontWeight: '500' }}>Heç bir əməliyyat tapılmadı</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default TransactionsPage;