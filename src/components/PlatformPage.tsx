
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { usePages, Page, PageLayoutItem } from '@/hooks/usePages';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/hooks/useProducts';
import PlatformPageLoading from './PlatformPage/PlatformPageLoading';
import PlatformPageNotFound from './PlatformPage/PlatformPageNotFound';
import PlatformPageContent from './PlatformPage/PlatformPageContent';

// Base component for platform pages
const PlatformPage: React.FC<{ slug?: string }> = ({ slug: propSlug }) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = propSlug || paramSlug || '';
  
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { getPageBySlug, fetchPageLayout, pageLayouts, loading: pageLoading } = usePages();
  
  const [page, setPage] = useState<Page | null>(null);
  const [layout, setLayout] = useState<PageLayoutItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize page to avoid unnecessary re-renders
  const currentPage = useMemo(() => {
    return getPageBySlug(slug);
  }, [slug, getPageBySlug]);

  // Load page data once
  useEffect(() => {
    const loadPageData = async () => {
      if (!currentPage) {
        setIsInitialized(true);
        return;
      }

      setPage(currentPage);
      
      try {
        // Load layout only if necessary
        if (currentPage.id && !pageLayouts[currentPage.id]) {
          await fetchPageLayout(currentPage.id);
        }
      } catch (error) {
        console.error('Erro ao carregar layout:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadPageData();
  }, [currentPage, fetchPageLayout, pageLayouts]);

  // Update layout when data is available
  useEffect(() => {
    if (page && pageLayouts[page.id]) {
      const sortedLayout = [...pageLayouts[page.id]].sort(
        (a, b) => (a.display_order || a.displayOrder || 0) - (b.display_order || b.displayOrder || 0)
      );
      setLayout(sortedLayout);
    }
  }, [page, pageLayouts]);

  // Open product modal
  const handleProductCardClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  // Wrapper function to adapt addToCart signature for FeaturedProductsSection
  const handleAddToCart = (product: Product, quantity?: number) => {
    // Call the cart's addToCart function with the expected signature
    addToCart(product);
  };

  // Show loading only during initialization
  if (!isInitialized || pageLoading) {
    return <PlatformPageLoading />;
  }

  // Page not found
  if (!page) {
    return <PlatformPageNotFound />;
  }

  return (
    <PlatformPageContent
      page={page}
      layout={layout}
      products={products}
      onAddToCart={handleAddToCart}
      isModalOpen={isModalOpen}
      selectedProductId={selectedProductId}
      setIsModalOpen={setIsModalOpen}
      handleProductCardClick={handleProductCardClick}
    />
  );
};

export default PlatformPage;
