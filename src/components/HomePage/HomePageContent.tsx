
import React from 'react';
import { CachedProduct } from '@/utils/ProductCacheManager';
import { ProductSection, HomepageLayoutItem } from '@/hooks/useProductSections';
import SectionRenderer from './SectionRenderer';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';

interface HomePageContentProps {
  layoutItems: HomepageLayoutItem[];
  products: CachedProduct[];
  sections: ProductSection[];
  bannerData: {
    imageUrl: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    targetBlank: boolean;
  };
  isLoading: boolean;
  showErrorState: boolean;
  productsLoading: boolean;
  sectionsLoading: boolean;
  onAddToCart: (product: any, size?: string, color?: string) => void;
  onRetryProducts: () => void;
}

const HomePageContent: React.FC<HomePageContentProps> = ({
  layoutItems,
  products,
  sections,
  bannerData,
  isLoading,
  showErrorState,
  productsLoading,
  sectionsLoading,
  onAddToCart,
  onRetryProducts
}) => {
  if (showErrorState) {
    return <ErrorState onRetry={onRetryProducts} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      {layoutItems
        .filter(item => item.is_visible) // Only show visible sections
        .sort((a, b) => a.display_order - b.display_order) // Sort by display order
        .map(item => (
          <SectionRenderer
            key={item.section_key}
            sectionKey={item.section_key}
            bannerData={bannerData}
            products={products}
            sections={sections}
            productsLoading={productsLoading}
            sectionsLoading={sectionsLoading}
            onAddToCart={onAddToCart}
          />
        ))
        .filter(Boolean) // Remove null sections
      }
    </>
  );
};

export default HomePageContent;
