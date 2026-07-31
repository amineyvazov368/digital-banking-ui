import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const BalanceCard = ({
  title,
  amount,
  currency = '$',
  trend = null, // 'up' | 'down' | null
  percentage = '',
  icon: Icon = null,
  gradientColor = 'blue' // 'blue' | 'emerald' | 'purple'
}) => {
  const isUp = trend === 'up';
  
  const gradients = {
    blue: 'radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.12) 0%, transparent 60%)',
    emerald: 'radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
    purple: 'radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.12) 0%, transparent 60%)',
  };

  const formattedAmount = typeof amount === 'number' 
    ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount;

  return (
    <div 
      className="glass-card" 
      style={{
        position: 'relative',
        backgroundImage: gradients[gradientColor] || gradients.blue,
        overflow: 'hidden'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <span style={{ 
          fontSize: '0.875rem', 
          fontWeight: 600, 
          color: 'var(--text-secondary)' 
        }}>{title}</span>
        
        {Icon && (
          <div style={{
            padding: '8px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <h2 style={{ 
          fontSize: '1.8rem', 
          fontWeight: 700, 
          color: '#fff',
          letterSpacing: '-0.5px'
        }}>
          {currency}{formattedAmount}
        </h2>
        
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              borderRadius: '50%',
              backgroundColor: isUp ? 'var(--color-success-glow)' : 'var(--color-danger-glow)',
              color: isUp ? 'var(--color-success)' : 'var(--color-danger)'
            }}>
              {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: isUp ? 'var(--color-success)' : 'var(--color-danger)'
            }}>
              {percentage}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              vs last month
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceCard;
