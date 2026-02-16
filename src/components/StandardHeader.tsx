import React from 'react';

interface StandardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  level?: number;
  score?: number;
  actionButton?: React.ReactNode;
}

const getLevelColor = (level: number = 1) => {
  const colors = {
    1: { 
      primary: '#ff6b35', 
      secondary: '#f7931e', 
      gradient: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', 
      shadow: 'rgba(255, 107, 53, 0.3)' 
    },
    2: { 
      primary: '#2196f3', 
      secondary: '#42a5f5', 
      gradient: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)', 
      shadow: 'rgba(33, 150, 243, 0.3)' 
    },
    3: { 
      primary: '#81c784', 
      secondary: '#a5d6a7', 
      gradient: 'linear-gradient(135deg, #81c784 0%, #a5d6a7 100%)', 
      shadow: 'rgba(129, 199, 132, 0.3)' 
    },
    4: { 
      primary: '#ba68c8', 
      secondary: '#ce93d8', 
      gradient: 'linear-gradient(135deg, #ba68c8 0%, #ce93d8 100%)', 
      shadow: 'rgba(186, 104, 200, 0.3)' 
    },
    5: { 
      primary: '#757575', 
      secondary: '#9e9e9e', 
      gradient: 'linear-gradient(135deg, #757575 0%, #9e9e9e 100%)', 
      shadow: 'rgba(117, 117, 117, 0.3)' 
    },
  };
  
  const normalizedLevel = Math.max(1, Math.min(5, level));
  return colors[normalizedLevel] || colors[1];
};

const StandardHeader: React.FC<StandardHeaderProps> = ({
  title,
  subtitle,
  icon,
  level = 1,
  score,
  actionButton
}) => {
  const levelColors = getLevelColor(level);

  return (
    <div
      style={{
        position: 'fixed',
        top: '12px',
        left: 'calc(12px + 210px + 12px)',
        width: 'calc(100% - 214px - 40px)',
        height: '130px',
        minHeight: '130px',
        maxHeight: '130px',
        background: levelColors.gradient,
        borderRadius: '16px',
        padding: '24px 32px',
        boxShadow: `0 4px 20px ${levelColors.shadow}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
        {icon && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {icon}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: 700, 
            color: 'white',
            lineHeight: '1.2'
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: '14px', 
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.4'
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {score !== undefined && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '8px 16px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 600
          }}>
            {score}%
          </div>
        )}
        {actionButton && actionButton}
      </div>
    </div>
  );
};

export default StandardHeader;
