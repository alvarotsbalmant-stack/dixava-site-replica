import React, { useMemo } from 'react';
import { useSpecialSections } from '@/hooks/specialSections/useSpecialSections';
import { BannerHeroRenderer } from './BannerHeroRenderer';
import { ProductCarouselRenderer } from './ProductCarouselRenderer';
import { CategoryGridRenderer } from './CategoryGridRenderer';
import { PromotionalBannerRenderer } from './PromotionalBannerRenderer';
import { NewsRenderer } from './NewsRenderer';
import { CustomHtmlRenderer } from './CustomHtmlRenderer';
import type { SpecialSection } from '@/hooks/specialSections/useSpecialSections';

interface SpecialSectionsRendererProps {
  pageId?: string;
  className?: string;
}

export const SpecialSectionsRenderer: React.FC<SpecialSectionsRendererProps> = ({
  pageId = 'homepage',
  className = ''
}) => {
  const { sections, loading, error, createSection, updateSection } = useSpecialSections({});

  // Filtrar e ordenar seções visíveis
  const visibleSections = useMemo(() => {
    if (!sections) return [];
    
    return sections
      .filter(section => section.is_active)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }, [sections]);

  // Renderizar seção individual
  const renderSection = (section: SpecialSection) => {
    const commonProps = {
      key: section.id,
      section,
      className: 'mb-8'
    };

    // Determine section type from content_config or fallback to default
    const sectionType = (section.content_config as any)?.type || 'custom_html';
    
    switch (sectionType) {
      case 'banner_hero':
        return <BannerHeroRenderer {...commonProps} section={section as any} />;
      case 'product_carousel':
        return <ProductCarouselRenderer {...commonProps} section={section as any} />;
      case 'category_grid':
        return <CategoryGridRenderer {...commonProps} section={section as any} />;
      case 'promotional_banner':
        return <PromotionalBannerRenderer {...commonProps} section={section as any} />;
      case 'news_section':
        return <NewsRenderer {...commonProps} section={section as any} />;
      case 'custom_html':
        return <CustomHtmlRenderer {...commonProps} section={section as any} />;
      default:
        console.warn(`Tipo de seção não suportado: ${sectionType}`);
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-8 ${className}`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-gray-200 rounded-lg h-64"
          />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Erro ao carregar seções especiais:', error);
    return null; // Falha silenciosa para não quebrar a página
  }

  if (!visibleSections.length) {
    return null; // Sem seções para exibir
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {visibleSections.map(renderSection)}
    </div>
  );
};

