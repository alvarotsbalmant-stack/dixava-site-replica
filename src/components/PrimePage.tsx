
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { usePrimePages, PrimePage, PrimePageLayoutItem } from '@/hooks/usePrimePages';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/hooks/useProducts';
import PlatformPageLoading from './PlatformPage/PlatformPageLoading';
import PlatformPageNotFound from './PlatformPage/PlatformPageNotFound';
import PlatformPageContent from './PlatformPage/PlatformPageContent';

// Base component for Prime pages
const PrimePageComponent: React.FC<{ slug?: string }> = ({ slug: propSlug }) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = propSlug || paramSlug || '';
  
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { getPageBySlug, fetchPageLayout, pageLayouts, loading: pageLoading } = usePrimePages();
  
  const [page, setPage] = useState<PrimePage | null>(null);
  const [layout, setLayout] = useState<PrimePageLayoutItem[]>([]);
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
        console.error('Erro ao carregar layout Prime:', error);
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
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
      );
      setLayout(sortedLayout);
    }
  }, [page, pageLayouts]);

  // Open product modal
  const handleProductCardClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  // Wrapper function to adapt addToCart signature
  const handleAddToCart = (product: Product, quantity?: number) => {
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

  // Convert Prime page data to Platform page format for reusing existing components
  const platformPage = {
    id: page.id,
    title: page.title,
    slug: page.slug,
    description: page.description || '',
    isActive: page.is_active,
    theme: {
      primaryColor: '#107C10',
      secondaryColor: '#3A3A3A'
    },
    filters: {
      tagIds: [],
      categoryIds: [],
      excludeTagIds: [],
      excludeCategoryIds: []
    },
    createdAt: page.created_at,
    updatedAt: page.updated_at
  };

  // Convert Prime layout items to Platform layout format
  const platformLayout = layout.map(item => ({
    id: item.id,
    page_id: item.page_id,
    section_key: item.section_key,
    title: '',
    display_order: item.display_order,
    is_visible: item.is_visible,
    section_type: item.section_type as 'banner' | 'products' | 'featured' | 'custom' | 'news',
    sectionConfig: item.section_config,
    pageId: item.page_id,
    sectionKey: item.section_key,
    displayOrder: item.display_order,
    isVisible: item.is_visible,
    sectionType: item.section_type as 'banner' | 'products' | 'featured' | 'custom' | 'news'
  }));

  return (
    <PlatformPageContent
      page={platformPage}
      layout={platformLayout}
      products={products}
      onAddToCart={handleAddToCart}
      isModalOpen={isModalOpen}
      selectedProductId={selectedProductId}
      setIsModalOpen={setIsModalOpen}
      handleProductCardClick={handleProductCardClick}
    />
  );
};

export default PrimePageComponent;
