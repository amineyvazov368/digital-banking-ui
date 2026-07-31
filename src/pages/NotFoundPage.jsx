import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { ShieldQuestion, Home } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '2rem'
    }}>
      <div 
        className="glass-card" 
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '3rem 2rem',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}
      >
        <div style={{
          backgroundColor: 'var(--color-danger-glow)',
          color: 'var(--color-danger)',
          borderRadius: '50%',
          width: '70px',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)'
        }}>
          <ShieldQuestion size={36} />
        </div>

        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
            404
          </h1>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            Security Portal Notice: Page Out of Range
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.5' }}>
            The requested digital resource does not exist or has been relocated within secure apex nodes.
          </p>
        </div>

        <Button 
          variant="primary" 
          onClick={() => navigate('/')} 
          icon={Home}
          style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
