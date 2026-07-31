import React from 'react';
import { CreditCard, Eye, EyeOff, ShieldAlert, CheckCircle } from 'lucide-react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

export const CardCard = ({ card, onBlock, actionLoading = false }) => {
  const navigate = useNavigate();
  
  // DTO parametrlərini təhlükəsiz götürürük
  const id = card.id || card.cardId;
  const cardNumber = card.cardNumber;
  const cardHolder = card.cardHolder || card.holderName || 'CARD HOLDER';
  const type = card.type || card.cardType || 'VISA';
  const status = card.status || card.cardStatus || 'ACTIVE';
  const expiryDate = card.expiryDate;

  const [showFullNumber, setShowFullNumber] = React.useState(false);

  const formatCardNumber = (num) => {
    if (!num) return '';
    const cleanNum = num.replace(/\s?/g, '');
    if (showFullNumber) {
      return cleanNum.replace(/(.{4})/g, '$1 ').trim();
    }
    return `•••• •••• •••• ${cleanNum.slice(-4)}`;
  };

  // Statusun böyük/kiçik hərf və ya müvəqqəti blokluq baxımından yoxlanılması
  const normalizedStatus = String(status).toUpperCase();
  const isBlocked = normalizedStatus === 'BLOCKED' || normalizedStatus === 'TEMPORARY_BLOCKED';

  const cardType = type ? type.toLowerCase() : '';

  const cardGradient = isBlocked
    ? 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' // Bloklu olduqda daha solğun/boz gradient
    : cardType.includes('platinum') || cardType.includes('black')
      ? 'linear-gradient(135deg, #224a81 0%, #224a81 100%)'
      : 'linear-gradient(135deg, #1e40af 0%, #1e1b4b 100%)';

  return (
    <div 
      key={id}
      onClick={() => {
        if (id) {
          navigate(`/cards/${id}`);
        } else {
          console.error("Kartın ID-si tapılmadı! Obyekt:", card);
        }
      }}
      className="glass-card" 
      style={{
        background: cardGradient,
        borderRadius: '20px',
        padding: '1.75rem',
        color: '#fff',
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(207, 183, 183, 0.08)',
        boxShadow: '0 15px 35px 0 rgba(0, 0, 0, 0.3)',
        cursor: 'pointer',
        opacity: isBlocked ? 0.8 : 1 // Bloklu kart üçün vizual fərq
      }}
    >
      {/* Decorative radial overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Card header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>
            Card Name / Brand
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>{type}</span>
        </div>
        <CreditCard size={28} style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
      </div>

      {/* Card Chip Representation */}
      <div style={{ 
        width: '38px', 
        height: '28px', 
        borderRadius: '6px', 
        margin: '1rem 0 0.5rem 0',
        background: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)',
        border: '1px solid rgba(0,0,0,0.1)'
      }} />

      {/* Card number */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        margin: '0.5rem 0', 
        zIndex: 1 
      }}>
        <span style={{ 
          fontSize: '1.25rem', 
          fontWeight: 600, 
          letterSpacing: '2.5px',
          fontFamily: 'monospace' 
        }}>
          {formatCardNumber(cardNumber)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Kartın detalına keçməsin
            setShowFullNumber(!showFullNumber);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        >
          {showFullNumber ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Card Footer details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
              Card Holder
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
              {cardHolder}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
              Expires
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' }}>
              {expiryDate}
            </span>
          </div>
        </div>

        {/* Card Status Indicator & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            background: isBlocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: isBlocked ? '#ef4444' : '#10b981',
            padding: '4px 10px',
            borderRadius: '20px',
            border: `1px solid ${isBlocked ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
          }}>
            {status}
          </span>
          {onBlock && (
            <Button
              variant={isBlocked ? 'success' : 'danger'}
              onClick={(e) => {
                e.stopPropagation(); // Kartın klik funksiyasını saxlayır
                onBlock(card);
              }}
              loading={actionLoading}
              style={{
                padding: '4px 10px',
                fontSize: '0.7rem',
                minHeight: '26px',
                borderRadius: '8px',
                height: 'auto'
              }}
              icon={isBlocked ? CheckCircle : ShieldAlert}
            >
              {isBlocked ? 'Activate' : 'Block'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardCard;