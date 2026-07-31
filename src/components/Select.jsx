import React from 'react';

export const Select = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  error, 
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="input-control"
        style={{
          borderColor: error ? 'var(--color-danger)' : undefined,
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1rem center',
          backgroundSize: '1.25em',
          paddingRight: '2.5rem',
          cursor: 'pointer'
        }}
        {...props}
      >
        {options.map((opt) => (
          <option 
            key={opt.value} 
            value={opt.value}
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            {opt.label}
          </option>
        ))}
      </select>
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

export default Select;
