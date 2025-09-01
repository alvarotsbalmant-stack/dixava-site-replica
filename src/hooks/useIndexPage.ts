
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useHomepageProducts } from '@/hooks/useHomepageProducts';
import { useHomepageLayout } from '@/hooks/useHomepageLayout';
import { useProductSections } from '@/hooks/useProductSections';
import { useSpecialSections } from '@/hooks/useSpecialSections';

export const useIndexPage = () => {
  const { data: products, isLoading: productsLoading, refetch } = useHomepageProducts();
  const { layoutItems, loading: layoutLoading } = useHomepageLayout();
  const { sections, loading: sectionsLoading } = useProductSections();
  const { sections: specialSections, loading: specialSectionsLoading } = useSpecialSections();

  // Memoizar banner data (dados estáticos)
  const bannerData = useMemo(() => ({
    imageUrl: "",
    title: 'Desbloqueie Vantagens com UTI PRO!',
    description: 'Tenha acesso a descontos exclusivos, frete grátis e muito mais. Torne-se membro hoje mesmo!',
    buttonText: 'Saiba Mais sobre UTI PRO',
    buttonLink: '/uti-pro',
    targetBlank: false,
  }), []);

  // Retry mechanism otimizado
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Memoizar função de retry
  const handleRetryProducts = useCallback(() => {
    setRetryCount(0);
    refetch();
  }, [refetch]);

  useEffect(() => {
    // Otimizar retry - apenas se necessário e com limite
    if (products?.length === 0 && !productsLoading && retryCount < MAX_RETRIES) {
      const timer = setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
        }
        setRetryCount(prev => prev + 1);
        refetch();
      }, 2000 * (retryCount + 1));

      return () => clearTimeout(timer);
    }
  }, [products?.length, productsLoading, retryCount, refetch]);

  // Loading state - mostrar loading se qualquer um estiver carregando
  const isLoading = useMemo(() => 
    layoutLoading || sectionsLoading || specialSectionsLoading, 
    [layoutLoading, sectionsLoading, specialSectionsLoading]
  );

  const showErrorState = useMemo(() => 
    !productsLoading && (products?.length === 0) && retryCount >= MAX_RETRIES,
    [productsLoading, products?.length, retryCount]
  );

  // Memoizar retorno do hook
  return useMemo(() => ({
    products,
    productsLoading,
    layoutItems,
    sections,
    specialSections,
    bannerData,
    isLoading,
    showErrorState,
    sectionsLoading,
    specialSectionsLoading,
    handleRetryProducts
  }), [
    products,
    productsLoading,
    layoutItems,
    sections,
    specialSections,
    bannerData,
    isLoading,
    showErrorState,
    sectionsLoading,
    specialSectionsLoading,
    handleRetryProducts
  ]);
};

