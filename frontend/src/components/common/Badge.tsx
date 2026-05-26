import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  style,
  className = '',
  ...props
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    success: {
      backgroundColor: 'rgba(78, 107, 78, 0.1)',
      color: 'var(--accent-success)',
      border: '1px solid rgba(78, 107, 78, 0.2)',
    },
    warning: {
      backgroundColor: 'rgba(212, 175, 55, 0.1)',
      color: 'var(--accent-warning)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
    },
    danger: {
      backgroundColor: 'rgba(139, 74, 74, 0.1)',
      color: 'var(--accent-danger)',
      border: '1px solid rgba(139, 74, 74, 0.2)',
    },
    info: {
      backgroundColor: 'rgba(197, 160, 89, 0.1)',
      color: 'var(--accent-secondary)',
      border: '1px solid rgba(197, 160, 89, 0.2)',
    },
    primary: {
      backgroundColor: 'rgba(91, 117, 91, 0.1)',
      color: 'var(--accent-primary)',
      border: '1px solid rgba(91, 117, 91, 0.2)',
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.2rem 0.5rem',
    borderRadius: '1rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    ...variantStyles[variant],
    ...style,
  };

  return (
    <span
      className={`badge-common ${className}`}
      style={baseStyle}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
