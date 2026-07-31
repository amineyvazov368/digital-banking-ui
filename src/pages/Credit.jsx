import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  takeCreditApi, 
  payCreditApi, 
  getUserAccountsApi, 
  getMyCreditsApi 
} from '../services/creditService';
import { 
  CreditCard, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Calculator, 
  Wallet, 
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';

export const Credit = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('take'); // 'take' və ya 'pay'

  // Data States
  const [accounts, setAccounts] = useState([]);
  const [myCredits, setMyCredits] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Take Credit Form State
  const [takeData, setTakeData] = useState({
    accountId: '',
    amount: '',
    termMonths: 12,
  });

  // Pay Credit Form State
  const [payData, setPayData] = useState({
    accountId: '',
    creditId: '',
    amount: '',
  });

  // Status & Modal States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, actionType: null });

  // Məlumatların çəkilməsi
  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [accsRes, credsRes] = await Promise.allSettled([
        getUserAccountsApi(),
        getMyCreditsApi(),
      ]);

      if (accsRes.status === 'fulfilled') {
        const accList = accsRes.value || [];
        setAccounts(accList);
        if (accList.length > 0) {
          setTakeData((prev) => ({ ...prev, accountId: accList[0].id }));
          setPayData((prev) => ({ ...prev, accountId: accList[0].id }));
        }
      }

      if (credsRes.status === 'fulfilled') {
        const credList = credsRes.value || [];
        const activeCreds = credList.filter((c) => c.status === 'ACTIVE');
        setMyCredits(credList);
        if (activeCreds.length > 0) {
          setPayData((prev) => ({ ...prev, creditId: activeCreds[0].id }));
        }
      }
    } catch (err) {
      console.error('Məlumatların çəkilməsində xəta:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Kalkulyator hesabla
  const calculateEstimatedPayment = () => {
    const amt = parseFloat(takeData.amount) || 0;
    const months = parseInt(takeData.termMonths) || 12;
    if (amt <= 0) return 0;

    const interest = amt * 0.12;
    const total = amt + interest;
    return (total / months).toFixed(2);
  };

  // 1. Kredit Götürmək Form Submit
  const handleTakeSubmit = (e) => {
    e.preventDefault();
    if (!takeData.accountId || !takeData.amount || takeData.amount <= 0) {
      setMessage({ type: 'error', text: 'Zəhmət olmasa düzgün məbləğ və hesab seçin!' });
      return;
    }
    setConfirmModal({ show: true, actionType: 'take' });
  };

  // 2. Kredit Ödəmək Form Submit
  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (!payData.accountId || !payData.creditId || !payData.amount || payData.amount <= 0) {
      setMessage({ type: 'error', text: 'Zəhmət olmasa düzgün məlumatları daxil edin!' });
      return;
    }
    setConfirmModal({ show: true, actionType: 'pay' });
  };

  // Təsdiqlənmiş əməliyyatı icra etmək (API İstəyi)
  const executeConfirmedAction = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    const action = confirmModal.actionType;
    setConfirmModal({ show: false, actionType: null });

    try {
      if (action === 'take') {
        await takeCreditApi(takeData.accountId, takeData.amount, takeData.termMonths);
        setMessage({ type: 'success', text: 'Kredit müraciəti uğurla təsdiqləndi!' });
        setTakeData({ accountId: accounts[0]?.id || '', amount: '', termMonths: 12 });
      } else if (action === 'pay') {
        await payCreditApi(payData.accountId, payData.creditId, payData.amount);
        setMessage({ type: 'success', text: 'Ödəniş uğurla həyata keçirildi!' });
        setPayData((prev) => ({ ...prev, amount: '' }));
      }
      loadInitialData();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Əməliyyat zamanı xəta baş verdi!',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedAccountForTake = accounts.find((a) => String(a.id) === String(takeData.accountId));
  const selectedAccountForPay = accounts.find((a) => String(a.id) === String(payData.accountId));
  const selectedCreditForPay = myCredits.find((c) => String(c.id) === String(payData.creditId));
  const activeCreditsList = myCredits.filter((c) => c.status === 'ACTIVE');

  return (
    <div style={styles.container}>
      {/* Mobil Responsivlik üçün dinamik Media Query CSS */}
      <style>{`
        @media (max-width: 640px) {
          .credit-header {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 1.25rem !important;
            gap: 1.25rem !important;
          }
          .credit-my-btn {
            width: 100% !important;
            justify-content: center !important;
          }
          .credit-tab-container {
            width: 100% !important;
          }
          .credit-tab-btn {
            flex: 1 !important;
            justify-content: center !important;
            padding: 0.75rem 0.5rem !important;
            font-size: 0.85rem !important;
          }
          .credit-radio-grid {
            grid-template-columns: 1fr !important;
          }
          .credit-card {
            padding: 1.25rem !important;
          }
          .credit-modal-actions {
            flex-direction: column-reverse !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div style={styles.header} className="credit-header">
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Kredit Portalı</h1>
          <p style={styles.subtitle}>İllik 12% sabit faiz dərəcəsi ilə anında kredit əldə edin və ya ödənişlərinizi idarə edin.</p>
        </div>
        
        {/* Mənim Kreditlərim Düyməsi */}
        <button 
          onClick={() => navigate('/my-credit')} 
          style={styles.myCreditsBtn}
          className="credit-my-btn"
        >
          <span>Mənim Kreditlərim</span>
          <ExternalLink size={16} />
        </button>
      </div>

      {/* Tab Selector */}
      <div style={styles.tabContainer} className="credit-tab-container">
        <button
          onClick={() => { setActiveTab('take'); setMessage({ type: '', text: '' }); }}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'take' ? styles.activeTab : {}),
          }}
          className="credit-tab-btn"
        >
          <CreditCard size={18} />
          Kredit Götür
        </button>
        <button
          onClick={() => { setActiveTab('pay'); setMessage({ type: '', text: '' }); }}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'pay' ? styles.activeTab : {}),
          }}
          className="credit-tab-btn"
        >
          <Wallet size={18} />
          Kredit Ödə
        </button>
      </div>

      {/* Alert Bildirişi */}
      {message.text && (
        <div style={{
          ...styles.alert,
          backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          borderColor: message.type === 'success' ? '#10b981' : '#f87171',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
        }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* TAKE CREDIT FORM */}
      {activeTab === 'take' && (
        <div style={styles.gridContainer}>
          <form onSubmit={handleTakeSubmit} style={styles.card} className="credit-card">
            <h2 style={styles.cardTitle}>Müraciət Formu</h2>

            {/* Hesab Seçimi Vizual Kartları */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Ödəniş Keçiriləcək Hesab</label>
              {loadingData ? (
                <div style={styles.loadingText}>Hesablar yüklənir...</div>
              ) : accounts.length === 0 ? (
                <div style={styles.emptyText}>Aktiv hesabınız tapılmadı.</div>
              ) : (
                <div style={styles.customRadioGrid} className="credit-radio-grid">
                  {accounts.map((acc) => {
                    const isSelected = String(takeData.accountId) === String(acc.id);
                    return (
                      <div
                        key={acc.id}
                        onClick={() => setTakeData({ ...takeData, accountId: acc.id })}
                        style={{
                          ...styles.radioCard,
                          ...(isSelected ? styles.radioCardSelected : {}),
                        }}
                      >
                        <div style={styles.radioCardHeader}>
                          <span style={styles.accountNumber}>{acc.accountNumber || `Hesab #${acc.id}`}</span>
                          <span style={styles.radioDot}>{isSelected && <div style={styles.radioDotInner} />}</span>
                        </div>
                        <div style={styles.accountBalance}>{acc.balance ?? 0} AZN</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Kredit Məbləği (AZN)</label>
              <input
                type="number"
                required
                min="100"
                placeholder="Nüm: 1000"
                value={takeData.amount}
                onChange={(e) => setTakeData({ ...takeData, amount: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Müddət (Ay)</label>
              <select
                value={takeData.termMonths}
                onChange={(e) => setTakeData({ ...takeData, termMonths: e.target.value })}
                style={styles.select}
              >
                <option value={3}>3 Ay</option>
                <option value={6}>6 Ay</option>
                <option value={12}>12 Ay</option>
                <option value={24}>24 Ay</option>
                <option value={36}>36 Ay</option>
              </select>
            </div>

            <button type="submit" disabled={loading || accounts.length === 0} style={styles.submitBtn}>
              {loading ? 'İşlənir...' : 'Krediti Təsdiqlə'} <ArrowUpRight size={18} />
            </button>
          </form>

          {/* Kalkulyator */}
          <div style={styles.calcCard} className="credit-card">
            <div style={styles.calcHeader}>
              <Calculator size={22} color="#0e5af1" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Kredit Kalkulyatoru</h3>
            </div>

            <div style={styles.calcBody}>
              <div style={styles.calcRow}>
                <span>İllik faiz dərəcəsi:</span>
                <strong>12%</strong>
              </div>
              <div style={styles.calcRow}>
                <span>Hesablanan faiz:</span>
                <strong>{((parseFloat(takeData.amount) || 0) * 0.12).toFixed(2)} AZN</strong>
              </div>
              <div style={styles.calcRow}>
                <span>Ümumi geri ödəniş:</span>
                <strong>{((parseFloat(takeData.amount) || 0) * 1.12).toFixed(2)} AZN</strong>
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '1rem 0' }} />

              <div style={styles.totalBlock}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Aylıq Ödəniş</span>
                <span style={styles.totalAmount}>{calculateEstimatedPayment()} AZN</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAY CREDIT FORM */}
      {activeTab === 'pay' && (
        <div style={{ ...styles.card, maxWidth: '650px', margin: '0 auto' }} className="credit-card">
          <h2 style={styles.cardTitle}>Kredit Ödənişi</h2>
          <form onSubmit={handlePaySubmit}>
            {/* Hesab Seçimi */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Ödəniş Ediləcək Hesab</label>
              <div style={styles.customRadioGrid} className="credit-radio-grid">
                {accounts.map((acc) => {
                  const isSelected = String(payData.accountId) === String(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => setPayData({ ...payData, accountId: acc.id })}
                      style={{
                        ...styles.radioCard,
                        ...(isSelected ? styles.radioCardSelected : {}),
                      }}
                    >
                      <div style={styles.radioCardHeader}>
                        <span style={styles.accountNumber}>{acc.accountNumber || `Hesab #${acc.id}`}</span>
                        <span style={styles.radioDot}>{isSelected && <div style={styles.radioDotInner} />}</span>
                      </div>
                      <div style={styles.accountBalance}>Balans: {acc.balance ?? 0} AZN</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kredit Seçimi */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Ödəniləcək Kredit</label>
              {activeCreditsList.length === 0 ? (
                <div style={styles.emptyText}>Aktiv kreditiniz yoxdur.</div>
              ) : (
                <div style={styles.customRadioGrid} className="credit-radio-grid">
                  {activeCreditsList.map((credit) => {
                    const isSelected = String(payData.creditId) === String(credit.id);
                    return (
                      <div
                        key={credit.id}
                        onClick={() => setPayData({ ...payData, creditId: credit.id })}
                        style={{
                          ...styles.radioCard,
                          ...(isSelected ? styles.radioCardSelected : {}),
                        }}
                      >
                        <div style={styles.radioCardHeader}>
                          <span style={styles.accountNumber}>Kredit #{credit.id}</span>
                          <span style={styles.radioDot}>{isSelected && <div style={styles.radioDotInner} />}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                          Qalıq: <strong>{credit.remainingAmount} AZN</strong> | Aylıq: <strong>{credit.monthlyPayment} AZN</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Ödəniş Məbləği (AZN)</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="Ödəniləcək məbləğ"
                value={payData.amount}
                onChange={(e) => setPayData({ ...payData, amount: e.target.value })}
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={loading || activeCreditsList.length === 0}
              style={styles.submitBtn}
            >
              {loading ? 'Ödənilir...' : 'Ödənişi Tamamla'}
            </button>
          </form>
        </div>
      )}

      {/* MODERN TƏSDİQ MODALI */}
      {confirmModal.show && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <div style={styles.modalIconWrap}>
                <ShieldCheck size={28} color="#0e5af1" />
              </div>
              <button 
                onClick={() => setConfirmModal({ show: false, actionType: null })} 
                style={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            <h3 style={styles.modalTitle}>Əməliyyatı Təsdiqləyin</h3>
            <p style={styles.modalSubtitle}>
              {confirmModal.actionType === 'take'
                ? 'Kredit müraciətini təsdiqləmək üzrəsiniz. Məlumatları nəzərdən keçirin:'
                : 'Kredit ödənişini təsdiqləmək üzrəsiniz. Məlumatları nəzərdən keçirin:'}
            </p>

            <div style={styles.modalSummaryBox}>
              {confirmModal.actionType === 'take' ? (
                <>
                  <div style={styles.modalRow}>
                    <span>Hesab:</span>
                    <strong>{selectedAccountForTake?.accountNumber || `#${takeData.accountId}`}</strong>
                  </div>
                  <div style={styles.modalRow}>
                    <span>Məbləğ:</span>
                    <strong>{takeData.amount} AZN</strong>
                  </div>
                  <div style={styles.modalRow}>
                    <span>Müddət:</span>
                    <strong>{takeData.termMonths} Ay</strong>
                  </div>
                  <div style={styles.modalRow}>
                    <span>Aylıq Ödəniş:</span>
                    <strong style={{ color: '#0e5af1' }}>{calculateEstimatedPayment()} AZN</strong>
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.modalRow}>
                    <span>Ödəyən Hesab:</span>
                    <strong>{selectedAccountForPay?.accountNumber || `#${payData.accountId}`}</strong>
                  </div>
                  <div style={styles.modalRow}>
                    <span>Kredit №:</span>
                    <strong>#{selectedCreditForPay?.id}</strong>
                  </div>
                  <div style={styles.modalRow}>
                    <span>Ödənilən Məbləğ:</span>
                    <strong style={{ color: '#10b981' }}>{payData.amount} AZN</strong>
                  </div>
                </>
              )}
            </div>

            <div style={styles.modalActions} className="credit-modal-actions">
              <button
                onClick={() => setConfirmModal({ show: false, actionType: null })}
                style={styles.modalCancelBtn}
              >
                Ləğv et
              </button>
              <button
                onClick={executeConfirmedAction}
                style={styles.modalConfirmBtn}
              >
                Təsdiqlə və Davam Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Dizayn Stil Obyekti
const styles = {
  container: {
    padding: '1rem',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    background: 'linear-gradient(135deg, #0e5af1 0%, #0036a7 100%)',
    borderRadius: '20px',
    padding: '1.75rem',
    color: '#fff',
    marginBottom: '1.5rem',
    boxShadow: '0 10px 25px -5px rgba(14, 90, 241, 0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  headerContent: { maxWidth: '550px' },
  title: { fontSize: '1.6rem', fontWeight: '700', margin: '0 0 0.5rem 0' },
  subtitle: { fontSize: '0.9rem', opacity: 0.9, margin: 0, lineHeight: 1.4 },
  myCreditsBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '0.65rem 1.1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s ease',
  },
  tabContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    backgroundColor: '#f1f5f9',
    padding: '0.35rem',
    borderRadius: '12px',
    width: 'fit-content',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1.25rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeTab: {
    backgroundColor: '#ffffff',
    color: '#0e5af1',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
  },
  cardTitle: { fontSize: '1.2rem', fontWeight: '600', color: '#0f172a', marginTop: 0, marginBottom: '1.25rem' },
  inputGroup: { marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#475569' },
  input: { padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  select: { padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' },
  loadingText: { padding: '0.75rem', fontSize: '0.875rem', color: '#64748b' },
  emptyText: { padding: '0.75rem', fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic' },
  customRadioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  radioCard: {
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    padding: '0.85rem',
    cursor: 'pointer',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease',
  },
  radioCardSelected: {
    borderColor: '#0e5af1',
    backgroundColor: '#eff6ff',
    boxShadow: '0 0 0 1px #0e5af1',
  },
  radioCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  accountNumber: {
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#1e293b',
  },
  accountBalance: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  radioDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotInner: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#0e5af1',
  },
  submitBtn: {
    width: '100%',
    padding: '0.85rem',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#0e5af1',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  calcCard: {
    backgroundColor: '#f8fafc',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  calcHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' },
  calcBody: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  calcRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#475569' },
  totalBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: '#ffffff',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  totalAmount: { fontSize: '1.5rem', fontWeight: '800', color: '#0e5af1' },

  // MODAL STYLES
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    maxWidth: '440px',
    width: '100%',
    padding: '1.25rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  modalIconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
  },
  modalTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 0.4rem 0',
  },
  modalSubtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: '0 0 1rem 0',
    lineHeight: 1.4,
  },
  modalSummaryBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '0.85rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    marginBottom: '1.25rem',
  },
  modalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#475569',
  },
  modalActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  modalCancelBtn: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  modalConfirmBtn: {
    flex: 1.5,
    padding: '0.75rem',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#0e5af1',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
};

export default Credit;