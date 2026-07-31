import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, ShoppingBag, Landmark, Coffee, User } from 'lucide-react';

export const TransactionTable = ({ transactions = [] }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCategoryIcon = (category = '') => {
    switch (category?.toLowerCase()) {
      case 'shopping':
      case 'xərclər':
        return ShoppingBag;
      case 'salary':
      case 'gəlirlər':
      case 'deposit':
      case 'savings':
      case 'utilities':
        return Landmark;
      case 'dining':
      case 'coffee':
        return Coffee;
      case 'transfer':
      case 'köçürmələr':
      default:
        return User;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('az-AZ', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const getAccountDisplay = (tx) => {
    const senderName = tx.sourceName || tx.senderName || tx.sourceOwner || tx.fromUser || '';
    const senderAcc = tx.sourceAccount || tx.sourceAccountId || tx.fromAccount || '';
    const sender = senderName ? senderName : (senderAcc || 'SİSTEM');

    const receiverName = tx.destinationName || tx.receiverName || tx.targetOwner || tx.toUser || '';
    const receiverAcc = tx.destinationAccount || tx.destinationAccountId || tx.toAccount || '';
    const receiver = receiverName ? receiverName : (receiverAcc || 'Mən');

    return { sender, receiver, senderAcc, receiverAcc };
  };

  if (!transactions || !transactions.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2.5rem 1rem',
        color: '#64748B',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        fontSize: '0.9rem',
        border: '1px solid #E2E8F0'
      }}>
        Heç bir əməliyyat tapılmadı.
      </div>
    );
  }

  // ==========================================
  // 1. MOBİL (TELEFON) GÖRÜNÜŞÜ - Ağ Card List
  // ==========================================
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
        {transactions.map((tx, index) => {
          const txType = (tx.type || '').toLowerCase();
          const txAmount = Number(tx.amount) || 0;
          const isIncoming = txAmount > 0 || txType === 'deposit' || txType === 'income';
          const displayAmount = (txType === 'withdraw' || txType === 'transfer' || txType === 'expense') && txAmount > 0 
            ? -txAmount 
            : txAmount;

          const amountColor = isIncoming ? '#16A34A' : '#DC2626'; // Ağ fonda rahat oxunan yaşıl və qırmızı
          const amountSign = isIncoming ? '+' : '';
          const txTime = tx.timestamp || tx.createdAt || tx.date || tx.transactionDate || tx.dateTime;
          const { sender, receiver } = getAccountDisplay(tx);

          return (
            <div 
              key={tx.id || `tx-mob-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                gap: '0.75rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* İkon və Sol Məlumat */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                <div style={{
                  backgroundColor: isIncoming ? '#DCFCE7' : '#FEE2E2',
                  color: amountColor,
                  borderRadius: '12px',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isIncoming ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ 
                    fontWeight: 700, 
                    fontSize: '0.875rem', 
                    color: '#0F172A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {tx.description || tx.type || 'Əməliyyat'}
                  </span>
                  
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: '#475569',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: '2px'
                  }}>
                    {isIncoming ? `${sender} → Siz` : `Siz → ${receiver}`}
                  </span>

                  <span style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>
                    {formatDate(txTime)}
                  </span>
                </div>
              </div>

              {/* Sağ Məbləğ Hissəsi */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: amountColor }}>
                  {amountSign}{Math.abs(displayAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ₼
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  marginTop: '4px',
                  display: 'inline-block'
                }}>
                  {tx.category || 'Ümumi'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ==========================================
  // 2. MASAÜSTÜ (DESKTOP) GÖRÜNÜŞÜ - Ağ Table
  // ==========================================
  return (
    <div style={{ 
      overflowX: 'auto', 
      backgroundColor: '#FFFFFF', 
      borderRadius: '16px', 
      border: '1px solid #E2E8F0',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.8rem', backgroundColor: '#F8FAFC' }}>
            <th style={{ padding: '0.9rem 1rem' }}>Əməliyyat</th>
            <th style={{ padding: '0.9rem 1rem' }}>Növ</th>
            <th style={{ padding: '0.9rem 1rem' }}>Tərəflər (Ad / Hesab)</th>
            <th style={{ padding: '0.9rem 1rem' }}>Kateqoriya</th>
            <th style={{ padding: '0.9rem 1rem' }}>Tarix</th>
            <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Məbləğ</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => {
            const txType = (tx.type || '').toLowerCase();
            const txAmount = Number(tx.amount) || 0;
            const isIncoming = txAmount > 0 || txType === 'deposit' || txType === 'income';
            
            const displayAmount = (txType === 'withdraw' || txType === 'transfer' || txType === 'expense') && txAmount > 0 
              ? -txAmount 
              : txAmount;

            const amountColor = isIncoming ? '#16A34A' : '#DC2626';
            const amountSign = isIncoming ? '+' : '';
            const txTime = tx.timestamp || tx.createdAt || tx.date || tx.transactionDate || tx.dateTime;
            const { sender, receiver, senderAcc, receiverAcc } = getAccountDisplay(tx);

            return (
              <tr key={tx.id || `tx-${index}`} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      backgroundColor: isIncoming ? '#DCFCE7' : '#FEE2E2',
                      color: amountColor,
                      borderRadius: '10px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isIncoming ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.9rem' }}>
                        {tx.description || tx.type || 'Əməliyyat'}
                      </div>
                    </div>
                  </div>
                </td>

                <td style={{ padding: '0.9rem 1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                    {tx.type || 'N/A'}
                  </span>
                </td>

                {/* Ad və Soyad / Hesab Bölməsi */}
                <td style={{ padding: '0.9rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>
                      {sender} → {receiver}
                    </span>
                    {(senderAcc || receiverAcc) && (
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                        {senderAcc ? senderAcc : ''} {receiverAcc ? `• ${receiverAcc}` : ''}
                      </span>
                    )}
                  </div>
                </td>

                <td style={{ padding: '0.9rem 1rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    color: '#475569'
                  }}>
                    {tx.category || 'Ümumi'}
                  </span>
                </td>

                <td style={{ padding: '0.9rem 1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    {formatDate(txTime)}
                  </span>
                </td>

                <td style={{ padding: '0.9rem 1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.95rem', color: amountColor }}>
                  {amountSign}{Math.abs(displayAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ₼
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;