import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Flame, 
  Zap, 
  Droplet, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cardService } from '../services/cardService';
import { transferService } from '../services/transferService';
import { accountService } from '../services/accountService'; // Hesab servisini daxil edirik

// Kommunal alt-kateqoriyaları
const UTILITY_PROVIDERS = [
  { id: 'azeriqaz', name: 'Azəriqaz', icon: Flame, color: '#f97316', bg: '#fff7ed' },
  { id: 'azerisq', name: 'Azərişıq', icon: Zap, color: '#eab308', bg: '#fefce8' },
  { id: 'azersu', name: 'Azərsu / Sukanal', icon: Droplet, color: '#0284c7', bg: '#f0f9ff' },
];

const UtilityPaymentPage = () => {
  const navigate = useNavigate();

  // Mərhələ idarəetməsi: 'select-provider' | 'enter-details' | 'confirm-payment' | 'success'
  const [step, setStep] = useState('select-provider');
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  // Forma stateləri
  const [userType, setUserType] = useState('ehali'); // 'ehali' | 'qeyri-ehali'
  const [subscriberCode, setSubscriberCode] = useState('');
  const [amount, setAmount] = useState('');
  
  // Dinamik Kart və Hesab Stateləri
  const [userCards, setUserCards] = useState([]);
  const [selectedCardNumber, setSelectedCardNumber] = useState('');
  const [cardsLoading, setCardsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Kartları və Hesabları parallel çəkib balansı kartla birləşdirmək
  useEffect(() => {
    const fetchData = async () => {
      setCardsLoading(true);
      try {
        // Həm kartları, həm də hesabları eyni anda çəkirik
        const [cardsResponse, accountsResponse] = await Promise.allSettled([
          cardService.getMyCards(),
          accountService.getMyAccounts()
        ]);

        const cards = cardsResponse.status === 'fulfilled' ? cardsResponse.value || [] : [];
        const accounts = accountsResponse.status === 'fulfilled' ? accountsResponse.value || [] : [];

        // Hesabları ID-yə görə sürətli axtarış üçün Map/Dictionary şəklinə salırıq
        const accountMap = {};
        accounts.forEach(acc => {
          accountMap[acc.id] = acc;
        });

        // Yalnız aktiv kartları götürürük və balansı hesabla birləşdiririk
        const activeCardsWithBalance = cards
          .filter(c => c.cardStatus === 'ACTIVE')
          .map(card => {
            const matchedAccount = accountMap[card.accountId];
            return {
              ...card,
              // Əgər hesab tapılsa onun balansını, yoxdursa kartın öz balansını (və ya 0) istifadə edirik
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
        setError('Məlumatları gətirmək mümkün olmadı.');
      } finally {
        setCardsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Təminatçı seçildikdə
  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider);
    setStep('enter-details');
    setError('');
  };

  // Abunəçi kodunu təyin olunmuş qaydalara (9 rəqəm) əsasən yoxlamaq
  const handleVerifySubscriber = (e) => {
    e.preventDefault();
    const cleanCode = subscriberCode.trim();

    if (!/^\d+$/.test(cleanCode)) {
      setError('Abunəçi kodu yalnız rəqəmlərdən ibarət olmalıdır');
      return;
    }

    if (cleanCode.length !== 9) {
      setError('Abunəçi kodu dəqiq 9 rəqəmdən ibarət olmalıdır');
      return;
    }

    setError('');
    setStep('confirm-payment');
  };

  // Kart Nömrəsini maskalamaq üçün köməkçi funksiya
  const formatCardNumber = (number) => {
    if (!number) return '';
    return `${number.slice(0, 4)} •••• •••• ${number.slice(-4)}`;
  };

  // Valyuta simvolu göstərmək üçün
  const getCurrencySymbol = (curr) => {
    if (curr === 'AZN') return '₼';
    if (curr === 'USD') return '$';
    if (curr === 'EUR') return '€';
    return curr || '₼';
  };

  // 3. Withdraw Servisi ilə Ödəniş İcrası
  const handleExecutePayment = async () => {
    const payAmount = parseFloat(amount);
    const selectedCard = userCards.find(c => c.cardNumber === selectedCardNumber);

    if (!selectedCard) {
      setError('Zəhmət olmasa ödəniş üçün kart seçin');
      return;
    }

    if (!payAmount || payAmount <= 0) {
      setError('Düzgün məbləğ daxil edin');
      return;
    }

    // Kartın bağlı olduğu hesabın balansını yoxlayırıq
    if (selectedCard.accountBalance < payAmount) {
      setError('Hesabın balansında kifayət qədər vəsait yoxdur');
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
      setError(err?.response?.data?.message || 'Ödəniş zamanı xəta baş verdi. Yenidən cəhd edin.');
    }
  };

  return (
    <div style={containerStyle}>
      {/* Başlıq Barı */}
      <div style={headerStyle}>
        <button 
          onClick={() => step === 'select-provider' ? navigate(-1) : setStep('select-provider')} 
          style={backButtonStyle}
        >
          <ArrowLeft size={20} color="#1a1a1a" />
        </button>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
          {selectedProvider ? selectedProvider.name : 'Kommunal Ödənişlər'}
        </h2>
      </div>

      {/* ================= STEP 1: XİDMƏT SEÇİMİ ================= */}
      {step === 'select-provider' && (
        <div>
          <p style={subHeaderStyle}>Ödəniş etmək istədiyiniz xidməti seçin</p>
          {UTILITY_PROVIDERS.map((provider) => {
            const Icon = provider.icon;
            return (
              <div 
                key={provider.id} 
                onClick={() => handleSelectProvider(provider)}
                style={cardStyle}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ ...iconBoxStyle, backgroundColor: provider.bg }}>
                    <Icon size={22} color={provider.color} />
                  </div>
                  <span style={{ fontWeight: '600', fontSize: '0.95rem', color: '#1a1a1a' }}>
                    {provider.name}
                  </span>
                </div>
                <ChevronRight size={18} color="#adb5bd" />
              </div>
            );
          })}
        </div>
      )}

      {/* ================= STEP 2: ABUNƏÇİ MƏLUMATLARININ DAXİL EDİLMƏSİ ================= */}
      {step === 'enter-details' && (
        <form onSubmit={handleVerifySubscriber} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={labelStyle}>Abunəçi Tipi</label>
            <div style={toggleContainerStyle}>
              <button
                type="button"
                onClick={() => setUserType('ehali')}
                style={{
                  ...toggleButtonStyle,
                  backgroundColor: userType === 'ehali' ? '#0e5af1' : 'transparent',
                  color: userType === 'ehali' ? '#fff' : '#495057',
                }}
              >
                Əhali
              </button>
              <button
                type="button"
                onClick={() => setUserType('qeyri-ehali')}
                style={{
                  ...toggleButtonStyle,
                  backgroundColor: userType === 'qeyri-ehali' ? '#0e5af1' : 'transparent',
                  color: userType === 'qeyri-ehali' ? '#fff' : '#495057',
                }}
              >
                Qeyri-Əhali
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Abunəçi Kodu (9 rəqəmli)</label>
            <input 
              type="text" 
              maxLength={9}
              value={subscriberCode}
              onChange={(e) => setSubscriberCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Məs: 100239482"
              style={inputStyle}
            />
            <span style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '4px', display: 'block' }}>
              {subscriberCode.length}/9 rəqəm
            </span>
          </div>

          {error && <div style={errorStyle}><AlertCircle size={16} /> {error}</div>}

          <button type="submit" style={primaryButtonStyle}>
            Davam et
          </button>
        </form>
      )}

      {/* ================= STEP 3: MƏBLƏĞ VƏ KART SEÇİMİ (PAYMENT) ================= */}
      {step === 'confirm-payment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={summaryBoxStyle}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Xidmət:</span>
              <div style={{ fontWeight: '600' }}>{selectedProvider.name} ({userType === 'ehali' ? 'Əhali' : 'Qeyri-Əhali'})</div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Abunəçi Kodu:</span>
              <div style={{ fontWeight: '600' }}>{subscriberCode}</div>
            </div>
          </div>

          {/* Kart Seçimi Və Bağlı Olduğu Hesabın Balansı */}
          <div>
            <label style={labelStyle}>Ödəniş Ediləcək Kart</label>
            
            {cardsLoading ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6c757d' }}>
                <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto' }} />
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Kartlar və balanslar yüklənir...</p>
              </div>
            ) : userCards.length === 0 ? (
              <div style={errorStyle}>Aktiv kart tapılmadı.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {userCards.map((card) => {
                  const isSelected = selectedCardNumber === card.cardNumber;
                  return (
                    <div 
                      key={card.id || card.cardNumber}
                      onClick={() => setSelectedCardNumber(card.cardNumber)}
                      style={{
                        ...cardSelectStyle,
                        borderColor: isSelected ? '#0e5af1' : '#f1f3f5',
                        backgroundColor: isSelected ? '#f4f7ff' : '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CreditCard size={20} color={isSelected ? '#0e5af1' : '#6c757d'} />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                            {card.cardType} ({card.cardForm})
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#868e96' }}>
                            {formatCardNumber(card.cardNumber)}
                          </div>
                        </div>
                      </div>

                      {/* Bağlı olduğu hesabın balansı */}
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

          {/* Ödəniləcək Məbləğ */}
          <div>
            <label style={labelStyle}>Ödəniş Məbləği (₼)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={{ ...inputStyle, fontSize: '1.2rem', fontWeight: 'bold' }}
            />
          </div>

          {error && <div style={errorStyle}><AlertCircle size={16} /> {error}</div>}

          <button 
            type="button" 
            onClick={handleExecutePayment} 
            disabled={loading || cardsLoading || userCards.length === 0}
            style={{
              ...primaryButtonStyle,
              opacity: (loading || cardsLoading || userCards.length === 0) ? 0.7 : 1,
              cursor: (loading || cardsLoading || userCards.length === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Ödəniş icra olunur...' : 'Ödənişi Təsdiqlə'}
          </button>
        </div>
      )}

      {/* ================= STEP 4: UĞURLU ÖDƏNİŞ ================= */}
      {step === 'success' && (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Ödəniş Uğurla Tamamlandı!</h3>
          <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <b>{amount} ₼</b> məbləğində ödənişiniz <b>{selectedProvider.name}</b> xidmətinə (Abunəçi: <b>{subscriberCode}</b>) köçürüldü.
          </p>

          <button 
            onClick={() => navigate('/payments')} 
            style={primaryButtonStyle}
          >
            Ödənişlərə Qayıt
          </button>
        </div>
      )}
    </div>
  );
};

/* --- STİLLER --- */
const containerStyle = {
  padding: '1rem',
  paddingBottom: '80px',
  maxWidth: '600px',
  margin: '0 auto',
  fontFamily: 'sans-serif'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '1.5rem'
};

const backButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center'
};

const subHeaderStyle = {
  fontSize: '0.85rem',
  color: '#868e96',
  marginBottom: '1rem'
};

const cardStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.9rem',
  backgroundColor: '#ffffff',
  borderRadius: '14px',
  marginBottom: '0.6rem',
  cursor: 'pointer',
  border: '1px solid #f1f3f5',
  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
};

const iconBoxStyle = {
  width: '42px',
  height: '42px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  color: '#495057',
  marginBottom: '0.4rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.8rem',
  borderRadius: '10px',
  border: '1px solid #ced4da',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box'
};

const toggleContainerStyle = {
  display: 'flex',
  backgroundColor: '#f1f3f5',
  padding: '4px',
  borderRadius: '10px'
};

const toggleButtonStyle = {
  flex: 1,
  padding: '0.6rem',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.85rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const primaryButtonStyle = {
  width: '100%',
  padding: '0.9rem',
  backgroundColor: '#0e5af1',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '0.95rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '0.5rem'
};

const cardSelectStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.8rem',
  borderRadius: '12px',
  border: '1.5px solid #f1f3f5',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const summaryBoxStyle = {
  backgroundColor: '#f8f9fa',
  padding: '0.9rem',
  borderRadius: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  border: '1px solid #e9ecef'
};

const errorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: '#fa5252',
  fontSize: '0.8rem',
  fontWeight: '500'
};

export default UtilityPaymentPage;