import React from 'react';

export const LoadingSpinner = ({ fullScreen = false, size = 'large' }) => {
  const sizeClass = size === 'small' ? 'spinner-sm' : size === 'medium' ? 'spinner-md' : 'spinner-lg';
  
  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 12, 20, 0.85)',
    backdropFilter: 'blur(12px)',
    zIndex: 9999,
  } : {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    width: '100%',
  };

  const spinnerStyle = {
    border: '3px solid rgba(255, 255, 255, 0.05)',
    borderTop: '3px solid var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  const sizes = {
    'spinner-sm': { width: '20px', height: '20px' },
    'spinner-md': { width: '40px', height: '40px' },
    'spinner-lg': { width: '60px', height: '60px' },
  };

  return (
    <div style={containerStyle}>
      <div style={{ ...spinnerStyle, ...sizes[sizeClass] }} />
    </div>
  );
};

export default LoadingSpinner;
