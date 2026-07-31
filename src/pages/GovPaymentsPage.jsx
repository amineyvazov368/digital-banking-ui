import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Landmark, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 ,
  ChevronRight
} from 'lucide-react';
import { cardService } from '../services/cardService';
import { accountService } from '../services/accountService';
import { transferService } from '../services/transferService';

const GOV_SERVICES = [
  { id: 'dyp', name: 'DYP Yol Cərimələri', type: 'plate_fin', color: '#ef4444', bg: '#fef2f2' },
  { id: 'vergi', name: 'Vergilər (VÖEN)', type: 'voen', color: '#0284c7', bg: '#f0f9ff' },
  { id: 'sigorta', name: 'İcbari Sığorta', type: 'fin', color: '#10b981', bg: '#ecfdf5' },
];

const PRESET_AMOUNTS = [20, 40, 50, 100];

const GovPaymentsPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('select'); // 'select' | 'details' | 'success'
  const [selectedService, setSelectedService] = useState(null);

  // Forma Sahələri
  const [fin, setFin] = useState('');
  const [plate, setPlate] = useState('');
  const [voen, setVoen] = useState('');
  const [amount, setAmount] = useState('');

  // Dinamik Kart və Hesab Stateləri
  const [userCards, setUserCards] = useState([]);
  const [selectedCardNumber, setSelectedCardNumber] = useState('');
  const [cardsLoading, setCardsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Aktiv Kartları və Bağlı Olduqları Hesabların Balansını Yükləmək
  useEffect(() => {
    const fetchData = async () => {
      setCardsLoading(true);
      try {
        const [cardsResponse, accountsResponse] = await Promise.allSettled([
          cardService.getMyCards(),
          accountService.getMyAccounts()
        ]);

        const cards = cardsResponse.status === 'fulfilled' ? cardsResponse.value || [] : [];
        const accounts = accountsResponse.status === 'fulfilled' ? accountsResponse.value || [] : [];

        // Hesabları ID üzrə map edirik
        const accountMap = {};
        accounts.forEach(acc => {
          accountMap[acc.id] = acc;
        });

        // Aktiv kartları süzüb hesabdakı balansla birləşdiririk
        const activeCardsWithBalance = cards
          .filter(c => c.cardStatus === 'ACTIVE')
          .map(card => {
            const matchedAccount = accountMap[card.accountId];
            return {
              ...card,
              accountBalance: matchedAccount ? matchedAccount.balance : (card.balance || 0),
              currency: matchedAccount ? matchedAccount.currency : 'AZN'
            };
          });

        setUserCards(activeCardsWithBalance);
        
        if (activeCardsWithBalance.length > 0) {
          setSelectedCardNumber(activeCardsWithBalance[0].cardNumber);
        }
      } catch (err) {
        console.error('Məlumatlar yüklənərkən xəta:', err);
        setError('Kart siyahısını yükləmək mümkün olmadı.');
      } finally {
        setCardsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelect = (service) => {
    setSelectedService(service);
    setStep('details');
    setError('');
  };

  const formatCardNumber = (number) => {
    if (!number) return '';
    return `${number.slice(0, 4)} •••• •••• ${number.slice(-4)}`;
  };

  const getCurrencySymbol = (curr) => {
    if (curr === 'AZN') return '₼';
    if (curr === 'USD') return '$';
    if (curr === 'EUR') return '€';
    return curr || '₼';
  };

  // 2. Dövlət Ödənişinin İcrası (Withdraw)
  const handleCheckAndPay = async (e) => {
    e.preventDefault();
    const payAmount = parseFloat(amount);
    const selectedCard = userCards.find(c => c.cardNumber === selectedCardNumber);

    if (!selectedCard) {
      setError('Ödəniş kartı seçilməyib.');
      return;
    }

    // Xidmət növünə uyğun sahələrin validasiyası
    if (selectedService.type === 'plate_fin') {
      if (!plate.trim()) {
        setError('Avtomobilin dövlət nişanını daxil edin.');
        return;
      }
      if (!fin.trim()) {
        setError('Şəxsiyyət vəsiqəsinin FİN kodunu daxil edin.');
        return;
      }
    } else if (selectedService.type === 'voen') {
      if (!voen.trim()) {
        setError('VÖEN kodunu daxil edin.');
        return;
      }
    } else if (selectedService.type === 'fin') {
      if (!fin.trim()) {
        setError('Şəxsiyyət vəsiqəsinin FİN kodunu daxil edin.');
        return;
      }
    }

    if (!payAmount || payAmount <= 0) {
      setError('Düzgün ödəniş məbləği daxil edin.');
      return;
    }

    if (selectedCard.accountBalance < payAmount) {
      setError('Seçilən kartın bağlı olduğu hesabda kifayət qədər vəsait yoxdur.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await transferService.withdraw({
        sourceAccount: selectedCard.cardNumber,
        amount: payAmount
      });

      setLoading(false);
      setStep('success');
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || 'Dövlət ödənişi icra olunmadı. Yenidən cəhd edin.');
    }
  };

  return (
    <div style={pageStyle}>
      {/* Başlıq Barı */}
      <div style={headerStyle}>
        <button 
          onClick={() => step === 'select' ? navigate('/payments') : setStep('select')} 
          style={backBtn}
        >
          <ArrowLeft size={20} />
        </button>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#212529', margin: 0 }}>
          {selectedService ? selectedService.name : 'Dövlət Ödənişləri'}
        </h3>
      </div>

      {/* ================= STEP 1: XİDMƏT SEÇİMİ ================= */}
      {step === 'select' && (
        <div>
          <p style={subTitleStyle}>Xidmət növünü seçin</p>
          {GOV_SERVICES.map(s => (
            <div key={s.id} onClick={() => handleSelect(s)} style={itemCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...iconBox, backgroundColor: s.bg }}>
                  <Landmark size={22} color={s.color} />
                </div>
                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{s.name}</span>
              </div>
               <ChevronRight size={18} color="#adb5bd" />
            </div>
          ))}
        </div>
      )}

      {/* ================= STEP 2: REKVIZITLƏR, MƏBLƏĞ VƏ KART SEÇİMİ ================= */}
      {step === 'details' && (
        <form onSubmit={handleCheckAndPay} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* DYP: Nişan vƏ FİN */}
          {selectedService.type === 'plate_fin' && (
            <>
              <div>
                <label style={labelStyle}>Avtomobil Dövlət Nişanı</label>
                <input 
                  type="text" 
                  placeholder="Məs: 90-AA-000" 
                  value={plate} 
                  onChange={e => setPlate(e.target.value.toUpperCase())} 
                  style={inputStyle} 
                />
              </div>
              <div>
                <label style={labelStyle}>Şəxsiyyət Vəsiqəsinin FİN Kodu</label>
                <input 
                  type="text" 
                  placeholder="Məs: 7ABC123" 
                  value={fin} 
                  onChange={e => setFin(e.target.value.toUpperCase())} 
                  style={inputStyle} 
                />
              </div>
            </>
          )}

          {/* VÖEN */}
          {selectedService.type === 'voen' && (
            <div>
              <label style={labelStyle}>VÖEN Kodu</label>
              <input 
                type="text" 
                placeholder="10 xanalı VÖEN daxil edin" 
                value={voen} 
                onChange={e => setVoen(e.target.value)} 
                style={inputStyle} 
              />
            </div>
          )}

          {/* Sığorta: Yalnız FİN */}
          {selectedService.type === 'fin' && (
            <div>
              <label style={labelStyle}>Şəxsiyyət Vəsiqəsinin FİN Kodu</label>
              <input 
                type="text" 
                placeholder="Məs: 7ABC123" 
                value={fin} 
                onChange={e => setFin(e.target.value.toUpperCase())} 
                style={inputStyle} 
              />
            </div>
          )}

          {/* Məbləğ Inputu Və Chips */}
          <div>
            <label style={labelStyle}>Ödəniləcək Məbləğ (₼)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {PRESET_AMOUNTS.map(val => (
                <button 
                  key={val} 
                  type="button" 
                  onClick={() => setAmount(val.toString())} 
                  style={{
                    ...chipBtn,
                    backgroundColor: amount === val.toString() ? '#0e5af1' : '#f1f3f5',
                    color: amount === val.toString() ? '#ffffff' : '#343a40'
                  }}
                >
                  {val} ₼
                </button>
              ))}
            </div>
            <input 
              type="number" 
              placeholder="0.00" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              style={inputStyle} 
            />
          </div>

          {/* Kart Seçimi və Dinamik Hesab Balansı */}
          <div>
            <label style={labelStyle}>Ödəniş Kartı</label>
            
            {cardsLoading ? (
              <div style={{ textAlign: 'center', padding: '1.2rem', color: '#6c757d' }}>
                <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto' }} />
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Kartlar yüklənir...</p>
              </div>
            ) : userCards.length === 0 ? (
              <div style={errorStyle}>Aktiv kart tapılmadı.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {userCards.map(card => {
                  const isSelected = selectedCardNumber === card.cardNumber;
                  return (
                    <div 
                      key={card.id || card.cardNumber} 
                      onClick={() => setSelectedCardNumber(card.cardNumber)} 
                      style={{
                        ...cardSelectStyle,
                        borderColor: isSelected ? '#0e5af1' : '#e9ecef',
                        backgroundColor: isSelected ? '#f4f7ff' : '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CreditCard size={20} color={isSelected ? '#0e5af1' : '#6c757d'} />
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#212529' }}>
                            {card.cardType} ({card.cardForm})
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#868e96' }}>
                            {formatCardNumber(card.cardNumber)}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: isSelected ? '#0e5af1' : '#1a1a1a' }}>
                          {Number(card.accountBalance).toFixed(2)} {getCurrencySymbol(card.currency)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#868e96' }}>
                          Hesab №{card.accountId}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && <div style={errorStyle}><AlertCircle size={16} /> {error}</div>}

          <button 
            type="submit" 
            disabled={loading || cardsLoading || userCards.length === 0} 
            style={{
              ...primaryBtn,
              opacity: (loading || cardsLoading || userCards.length === 0) ? 0.7 : 1,
              cursor: (loading || cardsLoading || userCards.length === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'İcra olunur...' : 'Ödənişi Tamamla'}
          </button>
        </form>
      )}

      {/* ================= STEP 3: UĞURLU ÖDƏNİŞ ================= */}
      {step === 'success' && (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <CheckCircle2 size={60} color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#212529' }}>Ödəniş Uğurla İcra Olundu!</h4>
          <p style={{ color: '#6c757d', margin: '0.5rem 0 1.5rem' }}>
            <b>{amount} ₼</b> məbləğində dövlət ödənişiniz sistemi qeydə alındı.
          </p>
          <button onClick={() => navigate('/payments')} style={primaryBtn}>
            Ödənişlərə qayıt
          </button>
        </div>
      )}
    </div>
  );
};

// CSS Style Obyektləri
const pageStyle = { 
  maxWidth: '520px', 
  margin: '0 auto', 
  padding: '1.25rem 1rem', 
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  color: '#212529'
};

const headerStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '1rem', 
  marginBottom: '1.5rem' 
};

const backBtn = { 
  border: 'none', 
  background: '#f1f3f5', 
  borderRadius: '50%', 
  padding: '10px', 
  cursor: 'pointer', 
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s'
};

const subTitleStyle = { 
  fontSize: '0.875rem', 
  fontWeight: '500',
  color: '#6c757d', 
  marginBottom: '1rem' 
};

const itemCardStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  padding: '14px 16px', 
  borderRadius: '14px', 
  border: '1px solid #e9ecef', 
  backgroundColor: '#ffffff',
  marginBottom: '12px', 
  cursor: 'pointer',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

const iconBox = { 
  width: '44px', 
  height: '44px', 
  borderRadius: '12px', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  flexShrink: 0
};

const labelStyle = { 
  display: 'block', 
  fontSize: '0.85rem', 
  fontWeight: '600', 
  color: '#343a40', 
  marginBottom: '8px' 
};

const inputStyle = { 
  width: '100%', 
  padding: '12px 14px', 
  borderRadius: '10px', 
  border: '1px solid #ced4da', 
  fontSize: '0.95rem', 
  outline: 'none', 
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s'
};

const chipBtn = { 
  flex: 1, 
  minWidth: '60px',
  padding: '10px 8px', 
  border: 'none', 
  borderRadius: '10px', 
  fontWeight: '600', 
  fontSize: '0.85rem',
  cursor: 'pointer', 
  transition: 'all 0.2s ease' 
};

const cardSelectStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  padding: '14px', 
  borderRadius: '12px', 
  border: '2px solid', 
  cursor: 'pointer', 
  transition: 'all 0.2s ease' 
};

const primaryBtn = { 
  width: '100%', 
  padding: '14px', 
  background: '#0e5af1', 
  color: '#ffffff', 
  border: 'none', 
  borderRadius: '12px', 
  fontWeight: '600', 
  fontSize: '1rem', 
  cursor: 'pointer', 
  marginTop: '12px',
  boxShadow: '0 4px 12px rgba(14, 90, 241, 0.25)',
  transition: 'opacity 0.2s'
};

const errorStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px', 
  color: '#e03131', 
  fontSize: '0.85rem', 
  fontWeight: '500',
  background: '#fff5f5', 
  border: '1px solid #ffe3e3',
  padding: '10px 14px', 
  borderRadius: '10px' 
};

export default GovPaymentsPage;