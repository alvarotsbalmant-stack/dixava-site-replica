import { useQuery } from '@tanstack/react-query';
import { fetchProductsFromDatabase } from './useProducts/productApi';
import { Product } from './useProducts/types';

// Hook otimizado para produtos da homepage com cache moderado
export const useHomepageProducts = () => {
  return useQuery({
    queryKey: ['homepage-products'],
    queryFn: () => fetchProductsFromDatabase(),
    staleTime: 10 * 60 * 1000, // 10 minutos - cache moderado
    gcTime: 20 * 60 * 1000, // 20 minutos
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

// Hook para produtos em destaque (otimizado)
export const useFeaturedProducts = (limit: number = 8) => {
  const { data: allProducts, isLoading, error } = useHomepageProducts();
  
  // Filtrar produtos em destaque no cliente para aproveitamento do cache
  const featuredProducts = allProducts?.filter(p => p.is_featured).slice(0, limit) || [];
  
  return {
    data: featuredProducts,
    isLoading,
    error,
    isEmpty: featuredProducts.length === 0 && !isLoading
  };
};

// Hook para produtos por categoria (otimizado)
export const useProductsByCategory = (category: string, limit: number = 12) => {
  const { data: allProducts, isLoading, error } = useHomepageProducts();
  
  // Filtrar por categoria no cliente
  const categoryProducts = allProducts
    ?.filter(p => p.tags?.some(tag => 
      tag.name.toLowerCase() === category.toLowerCase() ||
      tag.id === category
    ))
    .slice(0, limit) || [];
  
  return {
    data: categoryProducts,
    isLoading,
    error,
    isEmpty: categoryProducts.length === 0 && !isLoading
  };
};

// Hook para produtos de uma seção específica 
export const useProductsForSection = (sectionConfig: any) => {
  const { data: allProducts, isLoading, error } = useHomepageProducts();
  
  if (!sectionConfig || !allProducts) {
    return {
      data: [],
      isLoading,
      error,
      isEmpty: true
    };
  }

  // Se há produtos específicos configurados
  if (sectionConfig.products?.length > 0) {
    const sectionProducts = sectionConfig.products
      .map((productOverride: any) => {
        const baseProduct = allProducts.find(p => p.id === productOverride.productId);
        if (!baseProduct) return null;
        
        // Aplicar overrides
        return {
          ...baseProduct,
          name: productOverride.title || baseProduct.name,
          image: productOverride.imageUrl || baseProduct.image,
          badge_text: productOverride.badge?.text || baseProduct.badge_text,
          badge_color: productOverride.badge?.color || baseProduct.badge_color,
          is_featured: productOverride.isFeatured || productOverride.isOnSale || baseProduct.is_featured,
        };
      })
      .filter(Boolean);
    
    return {
      data: sectionProducts,
      isLoading,
      error,
      isEmpty: sectionProducts.length === 0
    };
  }

  // Fallback: filtrar por tags
  const { tagIds, limit = 10 } = sectionConfig.filter || {};
  
  let filtered = allProducts;
  
  if (tagIds?.length > 0) {
    filtered = filtered.filter(product => 
      product.tags?.some(tag => 
        tagIds.includes(tag.id) || tagIds.includes(tag.name.toLowerCase())
      )
    );
  }
  
  return {
    data: filtered.slice(0, limit),
    isLoading,
    error,
    isEmpty: filtered.length === 0 && !isLoading
  };
};