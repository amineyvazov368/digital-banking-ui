import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cardService from '../services/cardService';
import { ArrowUpRight, CreditCard, Landmark, PiggyBank, Copy, Check } from 'lucide-react';

export const AccountCard = ({ account }) => {
  const navigate = useNavigate();
  const [cardsCount, setCardsCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const {
    id,
    accountNumber = 'AZ00BANK00000000000000',
    accountType,
    type,
    balance = 0,
    status = 'ACTIVE',
    currency = 'AZN'
  } = account;

  const actualType = accountType || type || 'CHECKING';

  // Hesaba aid kartların sayını API-dən gətiririk
  useEffect(() => {
    let isMounted = true;
    if (id) {
      cardService.getCardsByAccount(id)
        .then(cards => {
          if (isMounted && Array.isArray(cards)) {
            setCardsCount(cards.length);
          }
        })
        .catch(() => {
          if (isMounted) setCardsCount(0);
        });
    }
    return () => { isMounted = false; };
  }, [id]);

  // Account Number kopyalama funksiyası
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurrencySymbol = (curr) => {
    switch (curr) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'AZN': default: return '₼';
    }
  };

  const isSavings = actualType.toUpperCase() === 'SAVINGS';

  return (
    <div 
      onClick={() => navigate(`/accounts/${id}`)}
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%)',
        backdropFilter: 'blur(12px)',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '220px',
        position: 'relative',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = isSavings ? '#10B981' : '#3B82F6';
        e.currentTarget.style.boxShadow = isSavings 
          ? '0 20px 30px -10px rgba(16, 185, 129, 0.2)' 
          : '0 20px 30px -10px rgba(59, 130, 246, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
      }}
    >
      {/* Arxa fon parıltısı */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '130px',
        height: '130px',
        borderRadius: '50%',
        backgroundColor: isSavings ? '#10B981' : '#3B82F6',
        filter: 'blur(60px)',
        opacity: 0.12,
        pointerEvents: 'none'
      }} />

      {/* Üst hissə */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: isSavings ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              border: `1px solid ${isSavings ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isSavings ? '#34D399' : '#60A5FA'
            }}>
              {isSavings ? <PiggyBank size={20} /> : <Landmark size={20} />}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {actualType} HESABI
            </span>
          </div>

          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: status === 'ACTIVE' ? '#34D399' : '#F87171',
            border: `1px solid ${status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}>
            {status}
          </span>
        </div>

        {/* Account Number və Kopyalama Düyməsi */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '0.8rem',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          padding: '6px 10px',
          borderRadius: '8px',
          width: 'fit-content'
        }}>
          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#94A3B8', letterSpacing: '0.5px' }}>
            {accountNumber}
          </span>
          <button 
            onClick={handleCopy}
            title="Hesab nömrəsini kopyala"
            style={{
              background: 'none',
              border: 'none',
              color: copied ? '#34D399' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Balans Hissəsi */}
      <div style={{ margin: '1rem 0' }}>
        <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Mövcud Balans
        </span>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.1rem', letterSpacing: '-0.5px' }}>
          {getCurrencySymbol(currency)} {Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Alt Hissə: Kartlar sayı və Keçid */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        paddingTop: '0.75rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.825rem' }}>
          <CreditCard size={16} />
          <span>{cardsCount} Bağlı Kart</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.2rem',
          color: isSavings ? '#34D399' : '#60A5FA',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          Ətraflı <ArrowUpRight size={16} />
        </div>
      </div>
    </div>
  );
};

export default AccountCard;