import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { SpecialSection } from '@/types/specialSections/core';

interface PromotionalBannerRendererProps {
  section: SpecialSection;
  className?: string;
}

export const PromotionalBannerRenderer: React.FC<PromotionalBannerRendererProps> = ({
  section,
  className = ''
}) => {
  const config = section.config as any;

  return (
    <section className={className}>
      <Card className="overflow-hidden">
        <div 
          className="relative aspect-[3/1] flex items-center justify-between p-8 text-white"
          style={{
            background: config.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              {config.title || section.title}
            </h3>
            <p className="text-lg opacity-90">
              {config.subtitle || 'Oferta especial por tempo limitado!'}
            </p>
          </div>
          
          {config.ctaText && (
            <Button 
              className="bg-white text-gray-900 hover:bg-gray-100"
              size="lg"
              onClick={() => {
                if (config.ctaUrl) {
                  window.location.href = config.ctaUrl;
                }
              }}
            >
              {config.ctaText}
            </Button>
          )}
        </div>
      </Card>
    </section>
  );
};

