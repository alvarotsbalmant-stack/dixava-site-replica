import React, { useEffect, useState } from 'react';
import { PlatformPage, PlatformSection } from '@/types/platformPages';
import { Product } from '@/hooks/useProducts';
import PlatformBanner from './PlatformBanner';
import PlatformProductSection from './PlatformProductSection';
import PlatformNewsSection from './PlatformNewsSection';
import { Loader2 } from 'lucide-react';

interface CustomPlatformPageProps {
  pageData: PlatformPage;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (productId: string) => void;
  className?: string;
}

const CustomPlatformPage: React.FC<CustomPlatformPageProps> = ({
  pageData,
  products,
  onAddToCart,
  onProductClick,
  className = ''
}) => {
  const [filteredProducts, setFilteredProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  // Filtrar produtos para cada seção
  useEffect(() => {
    const filterProductsForSections = () => {
      const filtered: Record<string, Product[]> = {};

      pageData.sections.forEach((section) => {
        if (section.type === 'products' && section.productConfig) {
          const config = section.productConfig;
          let sectionProducts = [...products];

          // Filtrar por tags
          if (config.filter.tagIds && config.filter.tagIds.length > 0) {
            sectionProducts = sectionProducts.filter(product =>
              product.tags?.some(tag => 
                config.filter.tagIds!.includes(tag.id)
              )
            );
          }

          // Filtrar por categorias
          if (config.filter.categoryIds && config.filter.categoryIds.length > 0) {
            sectionProducts = sectionProducts.filter(product =>
              config.filter.categoryIds!.includes(product.category_id || '')
            );
          }

          // Filtrar produtos em destaque
          if (config.filter.featured) {
            sectionProducts = sectionProducts.filter(product => product.is_featured);
          }

          // Filtrar novos lançamentos - usando uma lógica baseada em data de criação recente
          if (config.filter.newReleases) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            sectionProducts = sectionProducts.filter(product => 
              new Date(product.created_at) > thirtyDaysAgo
            );
          }

          // Filtrar produtos em oferta - usando desconto ou preço promocional
          if (config.filter.onSale) {
            sectionProducts = sectionProducts.filter(product => 
              (product.list_price && product.price < product.list_price) ||
              (product.discount_price && product.discount_price < product.price)
            );
          }

          // Limitar quantidade
          if (config.filter.limit) {
            sectionProducts = sectionProducts.slice(0, config.filter.limit);
          }

          filtered[section.id] = sectionProducts;
        }
      });

      setFilteredProducts(filtered);
      setLoading(false);
    };

    if (products.length > 0) {
      filterProductsForSections();
    }
  }, [products, pageData.sections]);

  // Aplicar tema global à página
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar variáveis CSS customizadas
    root.style.setProperty('--platform-primary', pageData.theme.primaryColor);
    root.style.setProperty('--platform-secondary', pageData.theme.secondaryColor);
    root.style.setProperty('--platform-accent', pageData.theme.accentColor);
    root.style.setProperty('--platform-background', pageData.theme.backgroundColor);
    root.style.setProperty('--platform-text', pageData.theme.textColor);
    
    if (pageData.theme.primaryGradient) {
      root.style.setProperty('--platform-gradient-primary', pageData.theme.primaryGradient);
    }
    
    if (pageData.theme.secondaryGradient) {
      root.style.setProperty('--platform-gradient-secondary', pageData.theme.secondaryGradient);
    }

    // Cleanup ao desmontar
    return () => {
      root.style.removeProperty('--platform-primary');
      root.style.removeProperty('--platform-secondary');
      root.style.removeProperty('--platform-accent');
      root.style.removeProperty('--platform-background');
      root.style.removeProperty('--platform-text');
      root.style.removeProperty('--platform-gradient-primary');
      root.style.removeProperty('--platform-gradient-secondary');
    };
  }, [pageData.theme]);

  const renderSection = (section: PlatformSection) => {
    if (!section.isVisible) return null;

    const sectionKey = `section-${section.id}`;

    switch (section.type) {
      case 'banner':
        if (!section.bannerConfig) return null;
        return (
          <PlatformBanner
            key={sectionKey}
            config={section.bannerConfig}
            theme={pageData.theme}
            className={section.fullWidth ? 'w-full' : ''}
          />
        );

      case 'products':
        if (!section.productConfig) return null;
        const sectionProducts = filteredProducts[section.id] || [];
        
        return (
          <PlatformProductSection
            key={sectionKey}
            config={section.productConfig}
            theme={pageData.theme}
            products={sectionProducts}
            onAddToCart={onAddToCart}
            onProductClick={onProductClick}
            className={section.fullWidth ? 'w-full' : ''}
          />
        );

      case 'news':
        if (!section.newsConfig) return null;
        return (
          <PlatformNewsSection
            key={sectionKey}
            articles={section.newsConfig.articles}
            theme={pageData.theme}
            layout={section.newsConfig.layout}
            title={section.title}
            className={section.fullWidth ? 'w-full' : ''}
          />
        );

      case 'features':
        return (
          <section 
            key={sectionKey}
            className={`py-16 ${section.fullWidth ? 'w-full' : ''}`}
            style={{
              backgroundColor: section.backgroundColor || pageData.theme.backgroundColor,
              color: pageData.theme.textColor,
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 
                  className="text-3xl md:text-4xl font-bold mb-8"
                  style={{ 
                    fontFamily: pageData.theme.headingFont || pageData.theme.fontFamily,
                    color: pageData.theme.textColor,
                  }}
                >
                  {section.title}
                </h2>
                <p className="text-lg opacity-80">
                  Seção de recursos em desenvolvimento...
                </p>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: pageData.theme.backgroundColor }}
      >
        <div className="text-center">
          <Loader2 
            className="h-12 w-12 animate-spin mx-auto mb-4"
            style={{ color: pageData.theme.accentColor }}
          />
          <p 
            className="text-lg"
            style={{ color: pageData.theme.textColor }}
          >
            Carregando {pageData.title}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen ${className}`}
      style={{
        backgroundColor: pageData.theme.backgroundColor,
        color: pageData.theme.textColor,
        fontFamily: pageData.theme.fontFamily,
      }}
    >
      {/* SEO Meta Tags */}
      <head>
        <title>{pageData.metaTitle || pageData.title}</title>
        <meta name="description" content={pageData.metaDescription || pageData.description} />
        {pageData.keywords && (
          <meta name="keywords" content={pageData.keywords.join(', ')} />
        )}
      </head>

      {/* Renderizar seções ordenadas */}
      {pageData.sections
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(renderSection)}
    </div>
  );
};

export default CustomPlatformPage;
