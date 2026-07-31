import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Smartphone, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Loader2 ,
  ChevronRight
} from 'lucide-react';
import { cardService } from '../services/cardService';
import { accountService } from '../services/accountService';
import { transferService } from '../services/transferService';

const OPERATORS = [
  { id: 'azercell', name: 'Azercell', color: '#8b5cf6', bg: '#f5f3ff', prefixes: ['050', '051', '010'] },
  { id: 'bakcell', name: 'Bakcell', color: '#ef4444', bg: '#fef2f2', prefixes: ['055', '099'] },
  { id: 'nar', name: 'Nar Mobile', color: '#f97316', bg: '#fff7ed', prefixes: ['070', '077'] },
];

const MobilePaymentsPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('select'); // 'select' | 'details' | 'success'
  const [selectedOp, setSelectedOp] = useState(null);
  
  // Nömrə hissəsi: Prefiks və qalan 7 rəqəm
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [phoneSuffix, setPhoneSuffix] = useState('');
  const [amount, setAmount] = useState('');
  
  // Dinamik Kart və Hesab Stateləri
  const [userCards, setUserCards] = useState([]);
  const [selectedCardNumber, setSelectedCardNumber] = useState('');
  const [cardsLoading, setCardsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Səhifə yüklənəndə Kartları və Hesabları paralel gətirmək
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

        const accountMap = {};
        accounts.forEach(acc => {
          accountMap[acc.id] = acc;
        });

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

  // Operator seçiləndə susmaya görə ilk prefiksi təyin edirik
  const handleSelectOp = (op) => {
    setSelectedOp(op);
    if (op.prefixes && op.prefixes.length > 0) {
      setSelectedPrefix(op.prefixes[0]);
    } else {
      setSelectedPrefix('');
    }
    setPhoneSuffix('');
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

  // Mobil Rabitə Ödənişinin İcrası (Withdraw)
  const handlePayment = async (e) => {
    e.preventDefault();
    const fullPhone = `${selectedPrefix}${phoneSuffix.trim()}`;
    const payAmount = parseFloat(amount);
    const selectedCard = userCards.find(c => c.cardNumber === selectedCardNumber);

    if (!selectedCard) {
      setError('Ödəniş kartı seçilməyib.');
      return;
    }

    // Prefiks daxil olmaqla ümumi 10 rəqəm yoxlanışı (məs: 070 + 1234567 = 10 rəqəm)
    if (!/^\d+$/.test(phoneSuffix) || phoneSuffix.length !== 7) {
      setError(`Düzgün mobil nömrə daxil edin (${selectedPrefix} gələn 7 rəqəm).`);
      return;
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
      setError(err?.response?.data?.message || 'Ödəniş icra olunmadı. Yenidən cəhd edin.');
    }
  };

  const fullPhoneNumber = `${selectedPrefix}${phoneSuffix}`;

  return (
    <div style={pageStyle}>
      {/* Başlıq Barı */}
      <div style={headerStyle}>
        <button onClick={() => step === 'select' ? navigate('/payments') : setStep('select')} style={backBtn}>
          <ArrowLeft size={20} />
        </button>
        <h3>{selectedOp ? selectedOp.name : 'Mobil Rabitə Ödənişi'}</h3>
      </div>

      {/* ================= STEP 1: OPERATOR SEÇİMİ ================= */}
      {step === 'select' && (
        <div>
          <p style={subTitleStyle}>Operatoru seçin</p>
          {OPERATORS.map(op => (
            <div key={op.id} onClick={() => handleSelectOp(op)} style={itemCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...iconBox, backgroundColor: op.bg }}>
                  <Smartphone size={22} color={op.color} />
                </div>
                <span style={{ fontWeight: '600' }}>{op.name}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#868e96' }}>
                 <ChevronRight size={18} color="#adb5bd" />
                {/* {op.prefixes.join(', ')} */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= STEP 2: NÖMRƏ, MƏBLƏĞ VƏ KART SEÇİMİ ================= */}
      {step === 'details' && (
        <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Mobil Nömrə (Prefiks Seçimi + 7 Rəqəm Inputu) */}
          <div>
            <label style={labelStyle}>Mobil Nömrə</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Operatorun Prefiks Dropdown-u */}
              <select 
                value={selectedPrefix} 
                onChange={(e) => setSelectedPrefix(e.target.value)}
                style={selectPrefixStyle}
              >
                {selectedOp?.prefixes.map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>

              {/* Nömrənin qalan 7 rəqəmi */}
              <input 
                type="tel" 
                maxLength={7}
                placeholder="1234567" 
                value={phoneSuffix} 
                onChange={e => setPhoneSuffix(e.target.value.replace(/\D/g, ''))} 
                style={inputStyle} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.75rem', color: '#6c757d' }}>
              <span>Tam nömrə: <b>{fullPhoneNumber || '...'}</b></span>
              <span>{phoneSuffix.length}/7 rəqəm</span>
            </div>
          </div>

          {/* Məbləğ Seçimi Və Inputu */}
          <div>
            <label style={labelStyle}>Məbləğ (₼)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {[2, 5, 10, 20].map(val => (
                <button 
                  key={val} 
                  type="button" 
                  onClick={() => setAmount(val.toString())} 
                  style={{
                    ...chipBtn,
                    backgroundColor: amount === val.toString() ? '#0e5af1' : '#f1f3f5',
                    color: amount === val.toString() ? '#fff' : '#333'
                  }}
                >
                  {val} ₼
                </button>
              ))}
            </div>
            <input 
              type="number" 
              placeholder="Fərqli məbləğ" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              style={inputStyle} 
            />
          </div>

          {/* Ödəniş Kartı Və Bağlı Olduğu Hesabın Balansı */}
          <div>
            <label style={labelStyle}>Ödəniş Kartı</label>
            
            {cardsLoading ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6c757d' }}>
                <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto' }} />
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Kartlar və balanslar yüklənir...</p>
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
                          <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>
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
            {loading ? 'Ödənilir...' : 'Ödənişi Tamamla'}
          </button>
        </form>
      )}

      {/* ================= STEP 3: UĞURLU ÖDƏNİŞ ================= */}
      {step === 'success' && (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <CheckCircle2 size={60} color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <h4>Balans Artırıldı!</h4>
          <p style={{ color: '#6c757d' }}><b>{fullPhoneNumber}</b> nömrəsinə <b>{amount} ₼</b> yükləndi.</p>
          <button onClick={() => navigate('/payments')} style={primaryBtn}>Ödənişlərə qayıt</button>
        </div>
      )}
    </div>
  );
};

const  pageStyle = { 
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
  color: '#6c757d', // Əvvəlki solğun rəng daha oxunaqlı rənglə əvəzləndi
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

const selectPrefixStyle = { 
  width: '95px', 
  padding: '12px 8px', 
  borderRadius: '10px', 
  border: '1px solid #ced4da', 
  fontSize: '0.95rem', 
  background: '#f8f9fa', 
  color: '#212529',
  outline: 'none', 
  fontWeight: '600', 
  cursor: 'pointer',
  textAlign: 'center'
};

const inputStyle = { 
  flex: 1, 
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
  padding: '10px 8px', 
  border: 'none', 
  borderRadius: '10px', 
  fontWeight: '600', 
  fontSize: '0.9rem',
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
export default MobilePaymentsPage;