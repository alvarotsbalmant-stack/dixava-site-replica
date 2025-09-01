
import React from 'react';
import { PageLayoutItem } from '@/hooks/usePages';
import { Product } from '@/hooks/useProducts';
import { cn } from "@/lib/utils";
import ProductCard from '@/components/Xbox4/ProductCard';

interface PlatformSectionRendererProps {
  section: PageLayoutItem;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (productId: string) => void;
}

const PlatformSectionRenderer: React.FC<PlatformSectionRendererProps> = ({
  section,
  products,
  onAddToCart,
  onProductClick
}) => {
  console.log(`[PlatformSectionRenderer] Rendering section: ${section.section_key || section.sectionKey}`, {
    title: section.title,
    sectionType: section.section_type || section.sectionType,
    sectionConfig: section.sectionConfig,
    productsLength: products.length
  });

  if (!section.is_visible && !section.isVisible) {
    console.log(`[PlatformSectionRenderer] Section ${section.section_key || section.sectionKey} is not visible`);
    return null;
  }

  const sectionKey = section.section_key || section.sectionKey || '';
  const sectionType = section.section_type || section.sectionType || 'products';
  const config = section.sectionConfig || {};

  // Filter products based on section configuration
  const getFilteredProducts = (): Product[] => {
    console.log(`[PlatformSectionRenderer] Filtering products for section: ${sectionKey}`, {
      config,
      allProductsCount: products.length
    });

    let filteredProducts = [...products];

    // Handle specific section filtering
    if (sectionKey === 'xbox4_deals' || sectionKey === 'xbox4_offers' || section.title === 'OFERTAS IMPERDÍVEIS') {
      console.log('[PlatformSectionRenderer] Processing OFERTAS IMPERDÍVEIS section');
      
      // For deals section, prioritize featured products
      filteredProducts = products.filter(product => {
        const isFeatured = product.is_featured === true;
        const hasXboxTag = product.tags?.some(tag => 
          tag.name?.toLowerCase().includes('xbox') || 
          tag.id === '28047409-2ad5-4cea-bde3-803d42e49fc6'
        );
        
        console.log(`[PlatformSectionRenderer] Product ${product.name}: featured=${isFeatured}, hasXboxTag=${hasXboxTag}`);
        return isFeatured && hasXboxTag;
      });

      // Add mock discount data for featured products
      filteredProducts = filteredProducts.map(product => ({
        ...product,
        originalPrice: product.list_price || product.price * 1.2, // Use list_price if available, fallback to simulation
        discount: product.list_price ? Math.round(((product.list_price - product.price) / product.list_price) * 100) : 20
      }));

      console.log(`[PlatformSectionRenderer] Filtered ${filteredProducts.length} deals products`);
    } else if (sectionKey === 'xbox4_consoles') {
      filteredProducts = products.filter(product => 
        product.tags?.some(tag => 
          tag.name?.toLowerCase().includes('console') ||
          tag.name?.toLowerCase().includes('xbox')
        )
      );
    } else if (sectionKey === 'xbox4_games') {
      filteredProducts = products.filter(product => 
        product.tags?.some(tag => 
          tag.name?.toLowerCase().includes('game') ||
          tag.name?.toLowerCase().includes('jogo')
        ) && product.tags?.some(tag => 
          tag.name?.toLowerCase().includes('xbox')
        )
      );
    } else if (sectionKey === 'xbox4_accessories') {
      filteredProducts = products.filter(product => 
        product.tags?.some(tag => 
          tag.name?.toLowerCase().includes('accessory') ||
          tag.name?.toLowerCase().includes('acessorio')
        ) && product.tags?.some(tag => 
          tag.name?.toLowerCase().includes('xbox')
        )
      );
    }

    // Apply limit if specified in config
    const limit = config.filter?.limit || config.limit || 8;
    const limitedProducts = filteredProducts.slice(0, limit);
    
    console.log(`[PlatformSectionRenderer] Final filtered products for ${sectionKey}:`, {
      originalCount: products.length,
      filteredCount: filteredProducts.length,
      finalCount: limitedProducts.length,
      limit
    });

    return limitedProducts;
  };

  const sectionProducts = getFilteredProducts();

  // Don't render if no products
  if (sectionProducts.length === 0) {
    console.log(`[PlatformSectionRenderer] No products found for section ${sectionKey}, not rendering`);
    return null;
  }

  // Determine card variant based on section
  const getCardVariant = () => {
    if (sectionKey.includes('deals') || sectionKey.includes('offers') || section.title === 'OFERTAS IMPERDÍVEIS') {
      return 'deal';
    }
    if (sectionKey.includes('games')) {
      return 'game';
    }
    if (sectionKey.includes('accessories')) {
      return 'accessory';
    }
    return 'default';
  };

  const cardVariant = getCardVariant();

  return (
    <section className="py-12 md:py-16 bg-gray-900 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
            {section.title}
          </h2>
        </div>

        <div className={cn(
          "grid gap-6",
          cardVariant === 'game' 
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-5" 
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        )}>
          {sectionProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onProductClick={onProductClick}
              variant={cardVariant}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformSectionRenderer;
