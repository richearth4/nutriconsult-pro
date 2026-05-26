import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
  horizontal?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 40, 
  className = "", 
  showText = true,
  textColor = "#2d3a2d",
  horizontal = false
}) => {
  return (
    <div className={`logo-container ${className}`} style={{ 
      display: 'flex', 
      flexDirection: horizontal ? 'row' : 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: horizontal ? '12px' : '15px'
    }}>
      {/* High-Fidelity Masterpiece SVG - True Transparency, No Checkerboard */}
      <svg 
        width={size * 1.15} 
        height={size * 1.15} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0px 3px 6px rgba(91, 117, 91, 0.18))' }}
      >
        <defs>
          <linearGradient id="mainLeafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b8cdb8" />
            <stop offset="40%" stopColor="#8ba68b" />
            <stop offset="100%" stopColor="#5b755b" />
          </linearGradient>
          <radialGradient id="seedTexture" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#725a3a" />
            <stop offset="60%" stopColor="#2d3a2d" />
            <stop offset="100%" stopColor="#1a241a" />
          </radialGradient>
          <linearGradient id="seedEdge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d4b97a" />
            <stop offset="100%" stopColor="#c5a059" />
          </linearGradient>
        </defs>

        {/* Avocado Shell / N-Base */}
        <path 
          d="M40 22C24 22 14 38 14 58C14 78 28 88 48 88C62 88 72 80 75 68" 
          stroke="url(#mainLeafGradient)" 
          strokeWidth="11" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* N-Diagonal */}
        <path 
          d="M40 22C46 32 58 55 78 90" 
          stroke="url(#mainLeafGradient)" 
          strokeWidth="13" 
          strokeLinecap="round" 
        />
        
        {/* Leaf Detail */}
        <path 
          d="M78 90C78 90 78 58 92 32C95 22 78 38 72 48" 
          fill="url(#mainLeafGradient)"
        />
        
        {/* Seed */}
        <circle cx="36" cy="62" r="18" fill="url(#seedTexture)" />
        <circle cx="36" cy="62" r="16.5" stroke="url(#seedEdge)" strokeWidth="2.5" opacity="0.9" />
        
        {/* Highlight Reflection */}
        <path d="M43 55C43 55 46 58 46 62" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
      </svg>
      
      {showText && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: horizontal ? 'flex-start' : 'center',
          lineHeight: 1.1
        }}>
          <div style={{ 
            color: textColor, 
            fontSize: `${size * 0.55}px`, 
            fontWeight: '700', 
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-family)'
          }}>
            Nutrilas
          </div>
          <div style={{ 
            color: 'var(--text-muted)', 
            fontSize: `${size * 0.22}px`, 
            fontWeight: '500', 
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-family)',
            marginTop: '2px'
          }}>
            Nutrition Consultation
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
