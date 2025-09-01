import React from 'react';
import { Product } from '@/hooks/useProducts';
import { ProductSection } from '@/hooks/useProductSections';
import { PrimePageLayoutItem } from '@/hooks/usePrimePages';
import HeroBannerCarousel from '@/components/HeroBannerCarousel';
import HeroQuickLinks from '@/components/HeroQuickLinks';
import PromotionalBanner from '@/components/PromotionalBanner';
import SpecializedServicesUltraCompact from '@/components/ServiceCards/SpecializedServicesUltraCompact';
import WhyChooseUsWithReviews from '@/components/ServiceCards/WhyChooseUsWithReviews';
import ContactHelp from '@/components/ServiceCards/ContactHelp';
import FeaturedProductsSection from '@/components/FeaturedProducts/FeaturedProductsSection';
import SpecialSectionRenderer from '@/components/SpecialSections/SpecialSectionRenderer';
import { sanitizeHtml } from '@/lib/sanitizer';

interface PrimePageRendererProps {
  layoutItem: PrimePageLayoutItem;
  products: Product[];
  sections: ProductSection[];
  specialSections: any[];
  productsLoading: boolean;
  sectionsLoading: boolean;
  onAddToCart: (product: any, size?: string, color?: string) => void;
  reduceTopSpacing?: boolean;
}

export const PrimePageRenderer: React.FC<PrimePageRendererProps> = ({
  layoutItem,
  products,
  sections,
  specialSections,
  productsLoading,
  sectionsLoading,
  onAddToCart,
  reduceTopSpacing = false
}) => {
  const { section_key, section_type, section_config } = layoutItem;

  const renderSection = () => {
    switch (section_type) {
      case 'hero_banner':
        return <HeroBannerCarousel key={section_key} />;
      
      case 'hero_quick_links':
        return <HeroQuickLinks key={section_key} />;

      case 'promo_banner':
        // Usar configuração do section_config ou fallback para configuração padrão
        const bannerData = section_config.bannerData || {
          imageUrl: '/placeholder-banner.jpg',
          title: 'Banner Promocional',
          description: 'Descrição do banner',
          buttonText: 'Saiba Mais',
          buttonLink: '#',
          targetBlank: false
        };
        return (
          <div key={section_key} className="container mx-auto px-4 sm:px-6 lg:px-8 my-8 md:my-12">
            <PromotionalBanner {...bannerData} />
          </div>
        );
      
      case 'specialized_services':
        return <SpecializedServicesUltraCompact key={section_key} />;
      
      case 'why_choose_us':
        return <WhyChooseUsWithReviews key={section_key} />;
      
      case 'contact_help':
        return <ContactHelp key={section_key} />;

      case 'custom_banner':
        // Banner customizado com configuração específica
        const customBannerConfig = section_config;
        return (
          <div key={section_key} className="container mx-auto px-4 sm:px-6 lg:px-8 my-8 md:my-12">
            <div 
              className="rounded-lg overflow-hidden shadow-lg"
              style={{ 
                backgroundColor: customBannerConfig.backgroundColor || '#f3f4f6',
                minHeight: customBannerConfig.height || '200px'
              }}
            >
              <div className="p-8 text-center">
                {customBannerConfig.title && (
                  <h2 
                    className="text-3xl font-bold mb-4"
                    style={{ color: customBannerConfig.titleColor || '#1f2937' }}
                  >
                    {customBannerConfig.title}
                  </h2>
                )}
                {customBannerConfig.description && (
                  <p 
                    className="text-lg mb-6"
                    style={{ color: customBannerConfig.textColor || '#6b7280' }}
                  >
                    {customBannerConfig.description}
                  </p>
                )}
                {customBannerConfig.buttonText && customBannerConfig.buttonLink && (
                  <a
                    href={customBannerConfig.buttonLink}
                    className="inline-block px-6 py-3 rounded-lg font-semibold transition-colors"
                    style={{
                      backgroundColor: customBannerConfig.buttonColor || '#dc2626',
                      color: customBannerConfig.buttonTextColor || '#ffffff'
                    }}
                    target={customBannerConfig.targetBlank ? '_blank' : '_self'}
                    rel={customBannerConfig.targetBlank ? 'noopener noreferrer' : undefined}
                  >
                    {customBannerConfig.buttonText}
                  </a>
                )}
              </div>
            </div>
          </div>
        );

      case 'product_section':
        // Seção de produtos configurável
        if (section_key.startsWith('product_section_')) {
          const sectionId = section_key.replace('product_section_', '');
          const section = sections.find(s => s.id === sectionId);
          
          if (!section) return null;
          
          // Lógica de produtos similar ao SectionRenderer
          const productMap = new Map<string, Product>();
          
          if (section.items) {
            for (const item of section.items) {
              if (item.item_type === 'product') {
                const product = products.find(p => p.id === item.item_id);
                if (product && !productMap.has(product.id)) {
                  productMap.set(product.id, product);
                }
              } else if (item.item_type === 'tag') {
                const tagProducts = products.filter(p => 
                  p.tags?.some(tag => tag.name.toLowerCase() === item.item_id.toLowerCase() || tag.id === item.item_id)
                );
                tagProducts.forEach(product => {
                  if (!productMap.has(product.id)) {
                     productMap.set(product.id, product);
                  }
                });
              }
            }
          }
          
          const uniqueSectionProducts = Array.from(productMap.values());
          
          return (
            <div data-section={section_key} data-testid="prime-section-renderer">
              <FeaturedProductsSection
                key={section_key}
                products={uniqueSectionProducts}
                loading={productsLoading || sectionsLoading}
                onAddToCart={onAddToCart}
                title={section_config.title || section.title}
                viewAllLink={section_config.viewAllLink || section.view_all_link || `/secao/${section_key}`}
                reduceTopSpacing={reduceTopSpacing}
              />
            </div>
          );
        }
        break;

      case 'special_section':
        // Seção especial configurável
        if (section_key.startsWith('special_section_')) {
          const sectionId = section_key.replace('special_section_', '');
          const specialSection = specialSections.find(s => s.id === sectionId);
          
          if (!specialSection) return null;
          
          return (
            <div data-section={section_key} data-testid="prime-special-section-renderer">
              <SpecialSectionRenderer
                key={section_key}
                section={specialSection}
                onProductCardClick={(productId: string) => onAddToCart({ id: productId } as any)}
                reduceTopSpacing={reduceTopSpacing}
              />
            </div>
          );
        }
        break;

      case 'custom_html':
        // HTML customizado
        return (
          <div 
            key={section_key} 
            className="container mx-auto px-4 sm:px-6 lg:px-8 my-8 md:my-12"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(section_config.html || '') }}
          />
        );

      case 'spacer':
        // Espaçador
        return (
          <div 
            key={section_key} 
            style={{ height: section_config.height || '50px' }}
          />
        );

      default:
        console.warn(`[PrimePageRenderer] Unknown section type: ${section_type}`);
        return null;
    }
  };

  return renderSection();
};

export default PrimePageRenderer;

