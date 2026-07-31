import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cardService from '../services/cardService';
import transferService from '../services/transferService';
import accountService from '../services/accountService';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { ArrowLeft, ArrowRightLeft, Send, ShieldCheck, User, CreditCard, AlertCircle,CheckCircle } from 'lucide-react';
import transactionService from '../services/transactionService';

export const TransferPage = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceCardNumber, setSourceCardNumber] = useState('');
  const [destinationCardNumber, setDestinationCardNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [fetchingRecipient, setFetchingRecipient] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        const firstCardNo = cardsWithDynamicBalance[0].cardNumber || '';
        setSourceCardNumber(firstCardNo);
        setError('');
      } else {
        setError('Köçürmə etmək üçün aktiv kartınız tapılmadı.');
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


  useEffect(() => {
    const cleanCardNo = destinationCardNumber.trim().replace(/\s+/g, '');

    if (cleanCardNo.length < 16) {
      setRecipientName('');
      return;
    }

    const fetchRecipientOwner = async () => {
      setFetchingRecipient(true);
      try {
        // Birbaşa yaratdığımız backend endpoint-ə müraciət edirik
        const res = await cardService.getCardOwnerByNumber(cleanCardNo);

        if (res && res.ownerFullName) {
          setRecipientName(res.ownerFullName);
        } else {
          setRecipientName('');
        }
      } catch (err) {
        console.error('Kart sahibi oxunarkən xəta:', err);
        setRecipientName('');
      } finally {
        setFetchingRecipient(false);
      }
    };

    fetchRecipientOwner();
  }, [destinationCardNumber]);

  const activeSource = cards.find(card => card.cardNumber === sourceCardNumber);

  const handleValidateForm = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const parsedAmount = parseFloat(amount);

    if (!sourceCardNumber) {
      return setError('Zəhmət olmasa, göndərən kartı seçin.');
    }
    if (!destinationCardNumber.trim()) {
      return setError('Zəhmət olmasa, qəbul edənin kart nömrəsini daxil edin.');
    }
    if (sourceCardNumber === destinationCardNumber.trim()) {
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
      await transferService.sendTransfer({
        sourceAccount: sourceCardNumber,
        destinationAccount: destinationCardNumber.trim(),
        amount
      });

      setSuccess('Köçürmə uğurla tamamlandı!');
      setAmount('');
      setDestinationCardNumber('');
      setRecipientName('');
      fetchUserCards();

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

  const cardOptions = cards.map(card => ({
    value: card.cardNumber,
    label: `${card.cardType || 'Kart'} (**** ${card.cardNumber?.slice(-4)}) - ₼${card.balance}`
  }));

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f4f7f6', // Daha yumşaq fon rəngi
      padding: 'clamp(1rem, 5vw, 3rem)', // Responsiv padding artırıldı
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem', // Elementlər arası məsafə artırıldı
      maxWidth: '600px', // Bir az daha geniş, rahat görünüş
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' // Sistem şriftləri
    }}>
      {/* Top Header Section */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: '#ffffff',
        padding: '1.25rem',
        borderRadius: '20px', // Daha yumru künclər
        boxShadow: '0 10px 25px rgba(29, 52, 54, 0.05)', // Daha müasir, yumşaq kölgə
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
            transition: 'all 0.2s ease', // Hamar keçid
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        // Hover effekti üçün javascript lazımdır, inline style ilə çətindir.
        // Amma dizayn olaraq belə daha qəşəngdir.
        >
          <ArrowLeft size={22} color="#495057" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a1d20', margin: 0, letterSpacing: '-0.5px' }}>
            Kartdan Karta Köçürmə
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#747d8c', margin: '0.2rem 0 0 0', lineHeight: '1.4' }}>
            İstənilən bank kartına təhlükəsiz və anında vəsait köçürün
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
            Köçürmə Məlumatları
          </h2>
          <CreditCard size={20} color="#a4b0be" />
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
          {/* Qeyd: Select, Input və Button komponentlərinin daxili stillərini də
          bu yeni dizayna uyğunlaşdırmağınız tövsiyə olunur (məsələn, border-radius: 12px, padding, border color).
          Mən burada yalnız onların ətrafındakı layout-u idarə edirəm. */}
          <div>
            <Select
              label="Çıxarılacaq Kart"
              value={sourceCardNumber}
              onChange={(e) => setSourceCardNumber(e.target.value)}
              options={cardOptions}
              required
            // Komponentin stili varsa, bunları əlavə edin: borderRadius: '12px', borderColor: '#e0e6ed', padding: '12px'
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

          <div>
            <Input
              label="Qəbul Edənin Kart Nömrəsi"
              type="text"
              inputMode="numeric"
              value={destinationCardNumber}
              onChange={(e) => setDestinationCardNumber(e.target.value)}
              placeholder="4165 XXXX XXXX XXXX"
              maxLength={16}
              required
            // Komponentin stili varsa, bunları əlavə edin: borderRadius: '12px', borderColor: '#e0e6ed', padding: '12px'
            />
            {fetchingRecipient ? (
              <div style={{ fontSize: '0.8rem', color: '#868e96', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div className="spinner" style={{ width: 12, height: 12, border: '2px solid #ddd', borderTopColor: '#e31e24', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Axtarılır...
              </div>
            ) : recipientName ? (
              <div style={{
                fontSize: '0.85rem',
                color: '#1e3718',
                fontWeight: '600',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#e6fffa',
                padding: '0.6rem',
                borderRadius: '10px',
                border: '1px solid #b2f2bb'
              }}>
                <User size={15} color="#2ecc71" /> Qəbul edən: {recipientName}
              </div>
            ) : null}
          </div>

          <Input
            label="Məbləğ (AZN)"
            type="number"
            inputMode="decimal"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          // Komponentin stili varsa, bunları əlavə edin: borderRadius: '12px', borderColor: '#e0e6ed', padding: '12px', fontSize: '1.1rem', fontWeight: '600'
          />

          <Button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '16px', // Daha yumru
              backgroundColor: submitting ? '#fab1a0' : '#ff4757', // Daha müasir qırmızı
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '1.05rem',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              marginTop: '1rem',
              boxShadow: submitting ? 'none' : '0 6px 20px rgba(255, 71, 87, 0.3)', // Daha canlı kölgə
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
            {submitting ? 'Gözləyin...' : 'Köçürməni Tamamla'}
          </Button>
        </form>
      </section>

      {/* Security Banner */}
      <div style={{
        backgroundColor: '#ffffff', // Tünd qırmızı fon yerinə ağ fon
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
            3D Secure Təhlükəsizlik
          </h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#747d8c', lineHeight: '1.4' }}>
            Bütün əməliyyatlar meynəlxalq təhlükəsizlik standartlarına uyğun şifrələnir.
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleExecuteTransfer}
        title="Köçürməni Təsdiqləyin"
        confirmText="Bəli, Göndər"
        cancelText="Ləğv et"
        // Message hissəsini də ConfirmDialog daxilində daha qəşəng stilləndirmək olar
        message={`${recipientName ? `${recipientName} (${destinationCardNumber})` : destinationCardNumber} kartına ₼${amount} məbləğində köçürmə etmək istədiyinizdən əminsiniz?`}
      />

      {/* Spinner üçün CSS animation (əgər global CSS-inizdə yoxdursa) */}
      <style>{`
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `}</style>
    </div>
  );
};

export default TransferPage;