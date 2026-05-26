import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'gold' | 'danger';
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  size = 'md',
  style,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--gradient-primary)',
      color: 'white',
      border: 'none',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-light)',
    },
    gold: {
      background: 'var(--gradient-gold)',
      color: 'var(--text-primary)',
      border: 'none',
      fontWeight: '600',
    },
    danger: {
      background: 'var(--accent-danger)',
      color: 'white',
      border: 'none',
    }
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '0.25rem 0.6rem',
      fontSize: '0.75rem',
    },
    md: {
      padding: '0.5rem 1rem',
      fontSize: '0.85rem',
    },
    lg: {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
    }
  };

  const baseStyle: React.CSSProperties = {
    borderRadius: '0.35rem',
    fontWeight: 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all var(--transition-fast)',
    boxShadow: variant === 'gold' ? 'var(--shadow-gold)' : 'var(--shadow-sm)',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button
      className={`btn-common ${className}`}
      style={baseStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span 
          className="spin-icon" 
          style={{ 
            display: 'inline-block',
            width: '12px',
            height: '12px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
          }}
        />
      )}
      {children}
    </button>
  );
};

export default Button;
