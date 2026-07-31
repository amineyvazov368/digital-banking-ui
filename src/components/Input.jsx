import React from 'react';

export const Input = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  error, 
  icon: Icon = null,
  required = false,
  ...props 
}) => {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name} className="form-label">
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: '1rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <Icon size={18} />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="input-control"
          style={{
            paddingLeft: Icon ? '2.75rem' : '1rem',
            borderColor: error ? 'var(--color-danger)' : undefined,
          }}
          {...props}
        />
      </div>
      {error && (
        <span style={{ 
          fontSize: '0.8rem', 
          color: 'var(--color-danger)', 
          marginTop: '0.25rem',
          fontWeight: 500
        }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
