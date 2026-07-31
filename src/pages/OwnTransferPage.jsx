import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cardService from '../services/cardService';
import transferService from '../services/transferService';
import accountService from '../services/accountService';
import Select from '../components/Select';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { ArrowLeft, RefreshCw, Send, ShieldCheck, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

export const OwnTransferPage = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [sourceCardNumber, setSourceCardNumber] = useState('');
  const [destinationCardNumber, setDestinationCardNumber] = useState('');
  const [amount, setAmount] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Kartları və onlara bağlı Account Balanslarını dinamik yükləyən funksiya
  const fetchUserCards = async () => {
    try {
      const res = await cardService.getMyCards();
      const finalCards = res && res.data ? res.data : res;

      if (Array.isArray(finalCards) && finalCards.length > 0) {
        const cardsWithDynamicBalance = await Promise.all(
          finalCards.map(async (card) => {
            let balance = 0;
            if (card.accountId) {
              try {
                const accountRes = await accountService.getAccountById(card.accountId);
                const accountData = accountRes && accountRes.data ? accountRes.data : accountRes;
                balance = accountData && accountData.balance != null ? accountData.balance : 0;
              } catch (accErr) {
                console.warn(`Account ${card.accountId} üçün balans oxunmadı.`, accErr);
              }
            }
            return {
              ...card,
              balance
            };
          })
        );

        setCards(cardsWithDynamicBalance);

        // Varsayılan olaraq 1-ci kartı mənbə, 2-ci kartı isə hədəf seçirik (əgər varsa)
        const firstCardNo = cardsWithDynamicBalance[0]?.cardNumber || '';
        const secondCardNo = cardsWithDynamicBalance[1]?.cardNumber || '';
        
        setSourceCardNumber(firstCardNo);
        if (secondCardNo) {
          setDestinationCardNumber(secondCardNo);
        }
        setError('');
      } else {
        setError('Köçürmə etmək üçün ən azı 2 aktiv kartınız olmalıdır.');
      }
    } catch (err) {
      console.error("Kartları yükləyərkən xəta:", err);
      setError('Kart məlumatlarını yükləmək mümkün olmadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCards();
  }, []);

  // Aktiv seçilmiş kartlar
  const activeSource = cards.find(card => card.cardNumber === sourceCardNumber);
  const activeDestination = cards.find(card => card.cardNumber === destinationCardNumber);

  // Mənbə kartlar üçün opsiyalar
  const sourceCardOptions = cards.map(card => ({
    value: card.cardNumber,
    label: `${card.cardType || 'Kart'} (**** ${card.cardNumber?.slice(-4)}) - ₼${card.balance}`
  }));

  // Hədəf kartlar üçün opsiyalar (Çıxarılan kart siyahıdan çıxarıla da bilər, və ya validasiya ilə tutula bilər)
  const destinationCardOptions = cards
    .filter(card => card.cardNumber !== sourceCardNumber)
    .map(card => ({
      value: card.cardNumber,
      label: `${card.cardType || 'Kart'} (**** ${card.cardNumber?.slice(-4)}) - ₼${card.balance}`
    }));

  // Mənbə kart dəyişdikdə hədəf kart eyni qalmasın deyə avtomatik update
  const handleSourceChange = (e) => {
    const selectedSource = e.target.value;
    setSourceCardNumber(selectedSource);
    
    if (selectedSource === destinationCardNumber) {
      const nextAvailable = cards.find(c => c.cardNumber !== selectedSource);
      setDestinationCardNumber(nextAvailable ? nextAvailable.cardNumber : '');
    }
  };

  const handleValidateForm = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const parsedAmount = parseFloat(amount);

    if (!sourceCardNumber) {
      return setError('Zəhmət olmasa, vəsait çıxarılacaq kartı seçin.');
    }
    if (!destinationCardNumber) {
      return setError('Zəhmət olmasa, vəsait mədaxil olunacaq kartı seçin.');
    }
    if (sourceCardNumber === destinationCardNumber) {
      return setError('Göndərən və qəbul edən kart eyni ola bilməz.');
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return setError('Zəhmət olmasa, düzgün məbləğ daxil edin.');
    }
    if (activeSource && activeSource.balance < parsedAmount) {
      return setError(`Balansınızda kifayət qədər vəsait yoxdur. (Mövcud: ₼${activeSource.balance})`);
    }

    setIsConfirmOpen(true);
  };

  const handleExecuteTransfer = async () => {
    setIsConfirmOpen(false);
    setError('');
    setSubmitting(true);

    try {
      // Backend servisinizə uyğun endpoint
      await transferService.sendTransfer({
        sourceAccount: sourceCardNumber,
        destinationAccount: destinationCardNumber,
        amount
      });

      setSuccess('Şəxsi kartlarınız arasında köçürmə uğurla tamamlandı!');
      setAmount('');
      
      // Balansları dərhal yeniləyirik
      await fetchUserCards();

      setTimeout(() => {
        navigate('/transactions');
      }, 1800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Köçürmə zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f4f7f6',
      padding: 'clamp(1rem, 5vw, 3rem)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Top Header Section */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: '#ffffff',
        padding: '1.25rem',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(29, 52, 54, 0.05)',
        border: '1px solid rgba(233, 236, 239, 0.6)'
      }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            background: '#ffffff',
            border: '1px solid #e9ecef',
            borderRadius: '14px',
            minWidth: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <ArrowLeft size={22} color="#495057" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a1d20', margin: 0, letterSpacing: '-0.5px' }}>
            Öz Kartlarım Arasında Köçürmə
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#747d8c', margin: '0.2rem 0 0 0', lineHeight: '1.4' }}>
            Şəxsi kartlarınız arasında anında və komissiyasız köçürmə edin
          </p>
        </div>
      </header>

      {/* Main Transfer Form */}
      <section style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: 'clamp(1.5rem, 5vw, 2.25rem)',
        boxShadow: '0 12px 30px rgba(29, 52, 54, 0.06)',
        border: '1px solid rgba(233, 236, 239, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#2f3542', margin: 0 }}>
            Hesablar Arası Keçid
          </h2>
          <RefreshCw size={20} color="#a4b0be" />
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fff5f5',
            color: '#e03131',
            border: '1px solid #ffc9c9',
            padding: '1rem',
            borderRadius: '14px',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#ebfbee',
            color: '#2b8a3e',
            border: '1px solid #b2f2bb',
            padding: '1rem',
            borderRadius: '14px',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        <form onSubmit={handleValidateForm} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* MƏNBƏ KART */}
          <div>
            <Select
              label="Çıxarılacaq Kart"
              value={sourceCardNumber}
              onChange={handleSourceChange}
              options={sourceCardOptions}
              required
            />
            {activeSource && (
              <div style={{
                fontSize: '0.85rem',
                color: '#57606f',
                marginTop: '0.5rem',
                textAlign: 'right',
                backgroundColor: '#f8f9fa',
                padding: '0.5rem 0.75rem',
                borderRadius: '10px',
                display: 'inline-block',
                float: 'right',
                border: '1px solid #eee'
              }}>
                Mövcud balans: <strong style={{ color: '#2ed573', fontSize: '0.95rem' }}>₼{activeSource.balance}</strong>
              </div>
            )}
            <div style={{ clear: 'both' }}></div>
          </div>

          {/* HƏDƏF KART */}
          <div>
            <Select
              label="Mədaxil Ediləcək Kart"
              value={destinationCardNumber}
              onChange={(e) => setDestinationCardNumber(e.target.value)}
              options={destinationCardOptions}
              required
            />
            {activeDestination && (
              <div style={{
                fontSize: '0.85rem',
                color: '#57606f',
                marginTop: '0.5rem',
                textAlign: 'right',
                backgroundColor: '#f8f9fa',
                padding: '0.5rem 0.75rem',
                borderRadius: '10px',
                display: 'inline-block',
                float: 'right',
                border: '1px solid #eee'
              }}>
                Cari balans: <strong style={{ color: '#1e90ff', fontSize: '0.95rem' }}>₼{activeDestination.balance}</strong>
              </div>
            )}
            <div style={{ clear: 'both' }}></div>
          </div>

          {/* MƏBLƏĞ */}
          <Input
            label="Məbləğ (AZN)"
            type="number"
            inputMode="decimal"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />

          <Button
            type="submit"
            disabled={submitting || cards.length < 2}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '16px',
              backgroundColor: submitting ? '#fab1a0' : '#ff4757',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '1.05rem',
              border: 'none',
              cursor: submitting || cards.length < 2 ? 'not-allowed' : 'pointer',
              marginTop: '1rem',
              boxShadow: submitting ? 'none' : '0 6px 20px rgba(255, 71, 87, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              minHeight: '54px',
              transition: 'all 0.2s ease',
              letterSpacing: '0.3px'
            }}
          >
            {submitting ? (
              <div className="spinner" style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            ) : (
              <Send size={19} />
            )}
            {submitting ? 'Gözləyin...' : 'Daxili Köçürməni Et'}
          </Button>
        </form>
      </section>

      {/* Security Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e9ecef',
        borderRadius: '20px',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 5px 15px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          backgroundColor: '#fff5f5',
          padding: '0.75rem',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShieldCheck size={26} color="#ff4757" style={{ flexShrink: 0 }} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1a1d20', fontWeight: '700' }}>
            Anında Əməliyyat
          </h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#747d8c', lineHeight: '1.4' }}>
            Öz hesablarınız arasındakı keçidlər anında icra olunur və heç bir komissiya tutulmur.
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleExecuteTransfer}
        title="Daxili Köçürməni Təsdiqləyin"
        confirmText="Təsdiqlə"
        cancelText="Ləğv et"
        message={`**** ${sourceCardNumber.slice(-4)} kartınızdan **** ${destinationCardNumber.slice(-4)} kartınıza ₼${amount} məbləğində köçürmə etmək istədiyinizdən əminsiniz?`}
      />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OwnTransferPage;