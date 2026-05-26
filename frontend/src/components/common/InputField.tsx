import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helperText,
  style,
  className = '',
  id,
  ...props
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.85rem',
    borderRadius: '0.35rem',
    border: error ? '1px solid var(--accent-danger)' : '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
    ...style,
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--accent-danger)',
    marginTop: '0.1rem',
  };

  const helperStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem',
  };

  return (
    <div style={containerStyle} className={className}>
      {label && <label htmlFor={id} style={labelStyle}>{label}</label>}
      <input
        id={id}
        style={inputStyle}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(91, 117, 91, 0.1)';
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--border-light)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
        {...props}
      />
      {error && <span style={errorStyle}>{error}</span>}
      {!error && helperText && <span style={helperStyle}>{helperText}</span>}
    </div>
  );
};

export default InputField;
