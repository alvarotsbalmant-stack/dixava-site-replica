import React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { SpecialSection } from '@/types/specialSections/core';

interface BannerHeroRendererProps {
  section: SpecialSection;
  className?: string;
}

export const BannerHeroRenderer: React.FC<BannerHeroRendererProps> = ({
  section,
  className = ''
}) => {
  const config = section.config as any;
  const isMobile = useIsMobile();

  if (!config.imageUrl) {
    return null; // Não renderizar se não houver imagem
  }

  const handleCtaClick = () => {
    if (config.ctaUrl) {
      if (config.ctaUrl.startsWith('http')) {
        window.open(config.ctaUrl, '_blank');
      } else {
        window.location.href = config.ctaUrl;
      }
    }
  };

  return (
    <section className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Container da imagem */}
      <div className={cn(
        "relative",
        // Proporção diferente para mobile e desktop
        isMobile ? "aspect-[1102/826]" : "aspect-video"
      )}>
        <img
          src={config.imageUrl}
          alt={config.imageAlt || section.title}
          className={cn(
            "w-full h-full transition-transform duration-300",
            // Object-fit diferente para mobile e desktop
            isMobile ? "object-contain" : "object-cover",
            config.enableHoverAnimation ? 'hover:scale-105' : ''
          )}
          loading="lazy"
        />
        
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: config.backgroundColor || '#000000',
            opacity: config.overlayOpacity || 0.3
          }}
        />
        
        {/* Conteúdo */}
        <div
          className={`absolute inset-0 flex items-center p-4 md:p-8 ${
            config.textPosition === 'left' ? 'justify-start text-left' :
            config.textPosition === 'right' ? 'justify-end text-right' :
            'justify-center text-center'
          }`}
        >
          <div className="max-w-2xl">
            {config.title && (
              <h2
                className="text-2xl md:text-4xl font-bold mb-4"
                style={{ color: config.textColor || '#ffffff' }}
              >
                {config.title}
              </h2>
            )}
            
            {config.subtitle && (
              <p
                className="text-base md:text-lg mb-6 opacity-90"
                style={{ color: config.textColor || '#ffffff' }}
              >
                {config.subtitle}
              </p>
            )}
            
            {config.ctaText && config.ctaUrl && (
              <Button
                onClick={handleCtaClick}
                className="bg-white text-black hover:bg-gray-100 transition-colors"
                size="lg"
              >
                {config.ctaText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

