import React from 'react';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children: React.ReactNode;
  title?: React.ReactNode;
  headerAction?: React.ReactNode;
  hoverable?: boolean;
  padding?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  headerAction,
  hoverable = true,
  padding = '1rem',
  style,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        padding,
        display: 'flex',
        flexDirection: 'column',
        cursor: props.onClick ? 'pointer' : 'default',
        ...(hoverable ? {} : { boxShadow: 'var(--shadow-sm)', borderColor: 'var(--border-light)' }),
        ...style
      }}
      {...props}
    >
      {(title || headerAction) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
          {title && (typeof title === 'string' ? <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</h3> : title)}
          {headerAction && <div style={{ display: 'flex', alignItems: 'center' }}>{headerAction}</div>}
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
};

export default Card;
