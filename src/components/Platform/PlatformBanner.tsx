import React from 'react';
import { BannerConfig, PlatformTheme } from '@/types/platformPages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, ExternalLink, ChevronRight } from 'lucide-react';

interface PlatformBannerProps {
  config: BannerConfig;
  theme: PlatformTheme;
  className?: string;
}

const PlatformBanner: React.FC<PlatformBannerProps> = ({ config, theme, className = '' }) => {
  const getBannerStyles = () => {
    const baseStyles = {
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
    };

    if (config.backgroundType === 'gradient' && theme.primaryGradient) {
      return {
        ...baseStyles,
        background: theme.primaryGradient,
      };
    }

    if (config.backgroundType === 'image' && config.imageUrl) {
      return {
        ...baseStyles,
        backgroundImage: `url(${config.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }

    return baseStyles;
  };

  const getContentPositionClasses = () => {
    const positionMap = {
      left: 'justify-start text-left',
      center: 'justify-center text-center',
      right: 'justify-end text-right',
      top: 'items-start justify-center text-center',
      bottom: 'items-end justify-center text-center',
    };
    return positionMap[config.contentPosition] || 'justify-center text-center';
  };

  const getLayoutClasses = () => {
    const layoutMap = {
      'full-width': 'w-full',
      'split': 'grid grid-cols-1 lg:grid-cols-2 gap-8',
      'overlay': 'relative',
      'carousel': 'w-full',
      'grid': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    };
    return layoutMap[config.layout] || 'w-full';
  };

  const renderHeroBanner = () => (
    <div 
      className={`relative min-h-[500px] lg:min-h-[600px] flex items-center ${getContentPositionClasses()} ${className}`}
      style={getBannerStyles()}
    >
      {config.overlay && (
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: config.overlay.color,
            opacity: config.overlay.opacity,
          }}
        />
      )}
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-3xl ${config.contentPosition === 'center' ? 'mx-auto' : ''}`}>
          {config.title && (
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              style={{ 
                fontFamily: theme.headingFont || theme.fontFamily,
                textShadow: `2px 2px 4px ${theme.shadowColor}`,
              }}
            >
              {config.title}
            </h1>
          )}
          
          {config.subtitle && (
            <h2 
              className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4"
              style={{ color: theme.accentColor }}
            >
              {config.subtitle}
            </h2>
          )}
          
          {config.description && (
            <p className="text-lg md:text-xl mb-8 opacity-90 leading-relaxed">
              {config.description}
            </p>
          )}
          
          {config.ctaText && config.ctaLink && (
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="text-lg px-8 py-4 font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: theme.accentColor,
                  color: theme.backgroundColor,
                  borderRadius: theme.borderRadius,
                  boxShadow: `0 4px 12px ${theme.shadowColor}`,
                }}
                onClick={() => window.location.href = config.ctaLink}
              >
                {config.ctaText}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              
              {config.videoUrl && (
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 font-semibold"
                  style={{
                    borderColor: theme.accentColor,
                    color: theme.textColor,
                    borderRadius: theme.borderRadius,
                  }}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Assistir Trailer
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPromotionalBanner = () => (
    <div 
      className={`relative py-16 lg:py-24 ${getLayoutClasses()} ${className}`}
      style={getBannerStyles()}
    >
      {config.overlay && (
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: config.overlay.color,
            opacity: config.overlay.opacity,
          }}
        />
      )}
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center ${getContentPositionClasses()}`}>
          <div className="max-w-2xl">
            <Badge 
              className="mb-4 text-sm font-semibold"
              style={{
                backgroundColor: theme.accentColor,
                color: theme.backgroundColor,
              }}
            >
              PROMOÇÃO ESPECIAL
            </Badge>
            
            {config.title && (
              <h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                style={{ 
                  fontFamily: theme.headingFont || theme.fontFamily,
                  color: theme.textColor,
                }}
              >
                {config.title}
              </h2>
            )}
            
            {config.subtitle && (
              <p 
                className="text-xl md:text-2xl mb-6"
                style={{ color: theme.accentColor }}
              >
                {config.subtitle}
              </p>
            )}
            
            {config.description && (
              <p className="text-lg mb-8 opacity-90">
                {config.description}
              </p>
            )}
            
            {config.ctaText && config.ctaLink && (
              <Button
                size="lg"
                className="text-lg px-8 py-4 font-semibold"
                style={{
                  backgroundColor: theme.primaryColor,
                  color: theme.textColor,
                  borderRadius: theme.borderRadius,
                }}
                onClick={() => window.location.href = config.ctaLink}
              >
                {config.ctaText}
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewsBanner = () => (
    <div 
      className={`relative py-12 lg:py-16 ${className}`}
      style={{
        backgroundColor: theme.secondaryColor || theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge 
            className="mb-4 text-sm font-semibold"
            style={{
              backgroundColor: theme.accentColor,
              color: theme.backgroundColor,
            }}
          >
            ÚLTIMAS NOTÍCIAS
          </Badge>
          
          {config.title && (
            <h2 
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
              style={{ 
                fontFamily: theme.headingFont || theme.fontFamily,
              }}
            >
              {config.title}
            </h2>
          )}
          
          {config.description && (
            <p className="text-lg opacity-90 max-w-3xl mx-auto">
              {config.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderProductShowcase = () => (
    <div 
      className={`relative py-16 lg:py-20 ${className}`}
      style={{
        background: theme.secondaryGradient || theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {config.title && (
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              style={{ 
                fontFamily: theme.headingFont || theme.fontFamily,
              }}
            >
              {config.title}
            </h2>
          )}
          
          {config.subtitle && (
            <p 
              className="text-xl md:text-2xl"
              style={{ color: theme.accentColor }}
            >
              {config.subtitle}
            </p>
          )}
        </div>
        
        {config.ctaText && config.ctaLink && (
          <div className="text-center">
            <Button
              size="lg"
              className="text-lg px-8 py-4 font-semibold"
              style={{
                backgroundColor: theme.accentColor,
                color: theme.backgroundColor,
                borderRadius: theme.borderRadius,
              }}
              onClick={() => window.location.href = config.ctaLink}
            >
              {config.ctaText}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar baseado no tipo de banner
  switch (config.type) {
    case 'hero':
      return renderHeroBanner();
    case 'promotional':
      return renderPromotionalBanner();
    case 'news':
      return renderNewsBanner();
    case 'product-showcase':
      return renderProductShowcase();
    default:
      return renderHeroBanner();
  }
};

export default PlatformBanner;

