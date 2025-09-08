import React from 'react';
import { useSiteSettingsOptimized } from '@/hooks/useSiteSettingsOptimized';

interface CSSLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CSSLogo: React.FC<CSSLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const { siteInfo } = useSiteSettingsOptimized();
  
  // Separar o nome do site em primeira palavra (vermelha) e resto (preto)
  const words = siteInfo.siteName.split(' ');
  const firstWord = words[0] || 'UTI';
  const restWords = words.slice(1).join(' ').replace(/\s+/g, '\u00A0') || 'DOS\u00A0GAMES';

  // Tamanhos baseados no prop size mas mantendo proporções
  const sizeConfigs = {
    sm: {
      utiSize: '32px',
      dosGamesSize: '25px',
      gap: '12px',
      strokeWidth: '1px'
    },
    md: {
      utiSize: '48px',
      dosGamesSize: '37px',
      gap: '18px',
      strokeWidth: '1.5px'
    },
    lg: {
      utiSize: '64px',
      dosGamesSize: '49px',
      gap: '24px',
      strokeWidth: '2px'
    }
  };

  const config = sizeConfigs[size];

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: config.gap
  };

  const utiStyles: React.CSSProperties = {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 900,
    fontSize: config.utiSize,
    lineHeight: 1,
    color: '#FF3B30',
    letterSpacing: '-0.02em'
  };

  const dosGamesStyles: React.CSSProperties = {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: config.dosGamesSize,
    lineHeight: 1,
    color: 'transparent',
    WebkitTextStroke: `${config.strokeWidth} #000000`,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const
  };

  return (
    <div 
      className={`css-logo-container ${className}`}
      style={containerStyles}
    >
      <span className="css-logo-uti" style={utiStyles}>
        {firstWord}
      </span>
      <span className="css-logo-dosgames" style={dosGamesStyles}>
        {restWords}
      </span>
    </div>
  );
};