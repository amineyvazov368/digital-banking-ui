import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyCreditsApi, getMyCreditByIdApi } from '../services/creditService';
import { 
  CreditCard, 
  ArrowLeft, 
  RefreshCw, 
  Info, 
  CheckCircle2, 
  Clock, 
  X, 
  Calendar, 
  TrendingUp,
  DollarSign
} from 'lucide-react';

export const MyCredit = () => {
  const navigate = useNavigate();

  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Modal üçün states
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Kreditləri çəkmək
  const fetchCredits = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await getMyCreditsApi();
      setCredits(data || []);
    } catch (err) {
      console.error('Kreditlər yüklənərkən xəta:', err);
      setError('Kredit məlumatlarını çəkmək mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  // Tək bir kreditin detallarını gətirmək (Modal üçün)
  const handleOpenDetail = async (creditId) => {
    setModalLoading(true);
    try {
      const data = await getMyCreditByIdApi(creditId);
      setSelectedCredit(data);
    } catch (err) {
      console.error('Kredit detalları çəkilərkən xəta:', err);
      const fallback = credits.find((c) => c.id === creditId);
      setSelectedCredit(fallback);
    } finally {
      setModalLoading(false);
    }
  };

  // Kreditin tam ödənilib-ödənilmədiyini yoxlayan köməkçi funksiya
  const checkIsPaidOff = (credit) => {
    if (!credit) return false;
    const remaining = Number(credit.remainingAmount ?? 0);
    const status = String(credit.status || '').toUpperCase();

    // Əgər qalıq borc 0-dırsa VƏ YA status ödənilmiş statuslarından biridirsə
    return remaining <= 0 || ['PAID', 'COMPLETED', 'CLOSED', 'PAID_OFF', 'PAIDOFF'].includes(status);
  };

  // Status Badge təyini
  const renderStatusBadge = (credit) => {
    const isPaid = checkIsPaidOff(credit);

    return (
      <span
        style={{
          ...styles.badge,
          backgroundColor: isPaid ? '#ecfdf5' : '#eff6ff',
          color: isPaid ? '#059669' : '#2563eb',
          borderColor: isPaid ? '#a7f3d0' : '#bfdbfe',
        }}
      >
        {isPaid ? <CheckCircle2 size={13} /> : <Clock size={13} />}
        {isPaid ? 'Paid Off' : 'Aktiv'}
      </span>
    );
  };

  return (
    <div style={styles.container}>
      {/* Mobil Responsivlik üçün dinamik Media Query CSS */}
      <style>{`
        @media (max-width: 640px) {
          .mycredit-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 1rem !important;
          }
          .mycredit-back-btn {
            width: fit-content !important;
          }
          .mycredit-grid {
            grid-template-columns: 1fr !important;
          }
          .mycredit-card-footer {
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
          .mycredit-detail-btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div style={styles.header} className="mycredit-header">
        <div>
          <button 
            onClick={() => navigate('/credit')} 
            style={styles.backBtn}
            className="mycredit-back-btn"
          >
            <ArrowLeft size={16} />
            <span>Kredit Səhifəsinə Qayıt</span>
          </button>
          <h1 style={styles.title}>Mənim Kreditlərim</h1>
          <p style={styles.subtitle}>Aktiv və ödənilmiş bütün kreditlərinizə buradan nəzarət edə bilərsiniz.</p>
        </div>

        <button 
          onClick={() => fetchCredits(true)} 
          disabled={refreshing || loading}
          style={styles.refreshBtn}
        >
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
          <span>Yenilə</span>
        </button>
      </div>

      {/* Xəta Mesajı */}
      {error && (
        <div style={styles.errorBox}>
          <span>{error}</span>
        </div>
      )}

      {/* Siyahı Yüklənməsi / Boş Olanda / Doldurulmuş Siyahı */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Kreditləriniz yüklənir...</p>
        </div>
      ) : credits.length === 0 ? (
        <div style={styles.emptyState}>
          <CreditCard size={48} color="#94a3b8" />
          <h3 style={styles.emptyTitle}>Hələ ki heç bir kreditiniz yoxdur</h3>
          <p style={styles.emptySubtitle}>İllik 12% sabit faiz dərəcəsi ilə anında kredit əldə edə bilərsiniz.</p>
          <button onClick={() => navigate('/credit')} style={styles.takeCreditLinkBtn}>
            Kredit Müraciəti Et
          </button>
        </div>
      ) : (
        <div style={styles.grid} className="mycredit-grid">
          {credits.map((credit) => {
            const isPaidOff = checkIsPaidOff(credit);

            return (
              <div key={credit.id} style={styles.creditCard}>
                {/* Card Top */}
                <div style={styles.cardHeader}>
                  <div style={styles.cardIdWrap}>
                    <CreditCard size={20} color="#0e5af1" />
                    <span style={styles.cardIdText}>Kredit #{credit.id}</span>
                  </div>
                  {renderStatusBadge(credit)}
                </div>

                {/* Card Main Info */}
                <div style={styles.cardBody}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Məbləğ:</span>
                    <span style={styles.infoValueMain}>{credit.amount ?? credit.totalAmount ?? 0} AZN</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Qalıq Borc:</span>
                    <span style={{
                      ...styles.infoValueHighlight,
                      color: isPaidOff ? '#059669' : '#dc2626'
                    }}>
                      {credit.remainingAmount ?? 0} AZN
                    </span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Aylıq Ödəniş:</span>
                    <span style={styles.infoValue}>{credit.monthlyPayment ?? 0} AZN</span>
                  </div>
                  {credit.termMonths && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Müddət:</span>
                      <span style={styles.infoValue}>{credit.termMonths} Ay</span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div style={styles.cardFooter} className="mycredit-card-footer">
                  <button
                    onClick={() => handleOpenDetail(credit.id)}
                    style={styles.detailBtn}
                    className="mycredit-detail-btn"
                  >
                    <Info size={16} />
                    Ətraflı Bax
                  </button>

                  {/* Əgər borc bitməyibsə ödəniş düyməsini göstər */}
                  {!isPaidOff && (
                    <button
                      onClick={() => navigate('/credit')}
                      style={styles.payBtn}
                      className="mycredit-detail-btn"
                    >
                      Ödəniş Et
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETALLAR MODALI */}
      {(selectedCredit || modalLoading) && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Kredit Ətraflı Məlumat</h3>
              <button onClick={() => setSelectedCredit(null)} style={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            {modalLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#64748b' }}>Məlumatlar gətirilir...</p>
              </div>
            ) : selectedCredit ? (
              <div style={styles.modalBody}>
                <div style={styles.modalSummaryBox}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Kredit Nömrəsi</span>
                  <strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>#{selectedCredit.id}</strong>
                  <div style={{ marginTop: '0.5rem' }}>{renderStatusBadge(selectedCredit)}</div>
                </div>

                <div style={styles.modalGrid}>
                  <div style={styles.modalItem}>
                    <DollarSign size={18} color="#64748b" />
                    <div>
                      <span style={styles.modalItemLabel}>Ümumi Məbləğ</span>
                      <strong style={styles.modalItemValue}>{selectedCredit.amount ?? selectedCredit.totalAmount ?? 0} AZN</strong>
                    </div>
                  </div>

                  <div style={styles.modalItem}>
                    <TrendingUp size={18} color="#64748b" />
                    <div>
                      <span style={styles.modalItemLabel}>Qalıq Borc</span>
                      <strong style={{ 
                        ...styles.modalItemValue, 
                        color: checkIsPaidOff(selectedCredit) ? '#059669' : '#dc2626' 
                      }}>
                        {selectedCredit.remainingAmount ?? 0} AZN
                      </strong>
                    </div>
                  </div>

                  <div style={styles.modalItem}>
                    <Calendar size={18} color="#64748b" />
                    <div>
                      <span style={styles.modalItemLabel}>Aylıq Ödəniş</span>
                      <strong style={{ ...styles.modalItemValue, color: '#0e5af1' }}>{selectedCredit.monthlyPayment ?? 0} AZN</strong>
                    </div>
                  </div>

                  {selectedCredit.termMonths && (
                    <div style={styles.modalItem}>
                      <Clock size={18} color="#64748b" />
                      <div>
                        <span style={styles.modalItemLabel}>Müddət</span>
                        <strong style={styles.modalItemValue}>{selectedCredit.termMonths} Ay</strong>
                      </div>
                    </div>
                  )}
                </div>

                {selectedCredit.createdAt && (
                  <div style={styles.modalFooterNote}>
                    Verilmə tarixi: {new Date(selectedCredit.createdAt).toLocaleDateString('az-AZ')}
                  </div>
                )}

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setSelectedCredit(null)} style={styles.modalCloseMainBtn}>
                    Bağla
                  </button>
                  {!checkIsPaidOff(selectedCredit) && (
                    <button onClick={() => { setSelectedCredit(null); navigate('/credit'); }} style={styles.modalPayMainBtn}>
                      İndi Ödə
                    </button>
                  )}
                </div>
              </div>
            ) : null}
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
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '0.75rem',
    backdropFilter: 'blur(4px)',
  },
  title: { fontSize: '1.6rem', fontWeight: '700', margin: '0 0 0.4rem 0' },
  subtitle: { fontSize: '0.875rem', opacity: 0.9, margin: 0, lineHeight: 1.4 },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ffffff',
    color: '#0e5af1',
    border: 'none',
    padding: '0.65rem 1.1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #f87171',
    color: '#991b1b',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  loadingContainer: {
    padding: '4rem 1rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#0e5af1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    border: '1px dashed #cbd5e1',
    borderRadius: '20px',
    padding: '3rem 1.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyTitle: { fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', margin: '1rem 0 0.5rem 0' },
  emptySubtitle: { fontSize: '0.875rem', color: '#64748b', margin: '0 0 1.5rem 0', maxWidth: '400px' },
  takeCreditLinkBtn: {
    backgroundColor: '#0e5af1',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.25rem',
  },
  creditCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '1.25rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.85rem',
    borderBottom: '1px solid #f1f5f9',
  },
  cardIdWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  cardIdText: { fontWeight: '700', fontSize: '1rem', color: '#0f172a' },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '1px solid',
  },
  cardBody: {
    padding: '1rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: '0.85rem', color: '#64748b' },
  infoValueMain: { fontWeight: '700', fontSize: '1.1rem', color: '#0f172a' },
  infoValueHighlight: { fontWeight: '700', fontSize: '1rem' },
  infoValue: { fontWeight: '600', fontSize: '0.9rem', color: '#334155' },
  cardFooter: {
    display: 'flex',
    gap: '0.5rem',
    paddingTop: '0.85rem',
    borderTop: '1px solid #f1f5f9',
  },
  detailBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '0.6rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.825rem',
    cursor: 'pointer',
  },
  payBtn: {
    flex: 1,
    backgroundColor: '#0e5af1',
    color: '#ffffff',
    border: 'none',
    padding: '0.6rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.825rem',
    cursor: 'pointer',
  },

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
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    maxWidth: '450px',
    width: '100%',
    padding: '1.5rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  modalTitle: { fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0 },
  modalCloseBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' },
  modalBody: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  modalSummaryBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1rem',
    textAlign: 'center',
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.85rem',
  },
  modalItem: {
    backgroundColor: '#f8fafc',
    padding: '0.85rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  modalItemLabel: { display: 'block', fontSize: '0.75rem', color: '#64748b' },
  modalItemValue: { fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' },
  modalFooterNote: { fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.5rem' },
  modalCloseMainBtn: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  modalPayMainBtn: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#0e5af1',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
};

export default MyCredit;