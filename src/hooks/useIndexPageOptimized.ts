import { useMemo } from 'react';
import { useHomepageProducts } from '@/hooks/useHomepageProducts';
import { useHomepageLayoutOptimized } from '@/hooks/useHomepageLayoutOptimized';
import { useProductSectionsOptimized } from '@/hooks/useProductSectionsOptimized';
import { useSpecialSectionsOptimized } from '@/hooks/useSpecialSectionsOptimized';

export const useIndexPageOptimized = () => {
  // Usar hooks otimizados com React Query
  const { data: products, isLoading: productsLoading, refetch } = useHomepageProducts();
  const { data: layoutItems, isLoading: layoutLoading } = useHomepageLayoutOptimized();
  const { data: sections, isLoading: sectionsLoading } = useProductSectionsOptimized();
  const { data: specialSections, isLoading: specialSectionsLoading } = useSpecialSectionsOptimized();

  // Memoizar banner data (dados estáticos)
  const bannerData = useMemo(() => ({
    imageUrl: "",
    title: 'Desbloqueie Vantagens com UTI PRO!',
    description: 'Tenha acesso a descontos exclusivos, frete grátis e muito mais. Torne-se membro hoje mesmo!',
    buttonText: 'Saiba Mais sobre UTI PRO',
    buttonLink: '/uti-pro',
    targetBlank: false,
  }), []);

  // Calcular loading geral
  const isLoading = productsLoading || layoutLoading || sectionsLoading || specialSectionsLoading;

  // Log para debug
  console.log('[useIndexPageOptimized] Loading states:', {
    productsLoading,
    layoutLoading,
    sectionsLoading,
    specialSectionsLoading,
    isLoading
  });

  return {
    products: products || [],
    productsLoading,
    layoutItems: layoutItems || [],
    sections: sections || [],
    specialSections: specialSections || [],
    bannerData,
    isLoading,
    loading: isLoading, // Compatibilidade com código existente
    sectionsLoading, // Compatibilidade
    specialSectionsLoading, // Compatibilidade
    handleRetryProducts: refetch,
    retryCount: 0,
    MAX_RETRIES: 3
  };
};

