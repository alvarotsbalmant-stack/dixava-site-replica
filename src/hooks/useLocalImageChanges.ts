
import { useState, useCallback } from 'react';
import { Product } from '@/hooks/useProducts/types';

export interface ImageChange {
  productId: string;
  type: 'add' | 'remove';
  imageUrl: string;
  isMainImage: boolean;
}

export interface ProductWithChanges extends Product {
  localChanges?: {
    mainImageUrl?: string | null;
    additionalImages?: string[];
    hasChanges: boolean;
  };
}

export const useLocalImageChanges = (originalProducts: Product[]) => {
  const [pendingChanges, setPendingChanges] = useState<ImageChange[]>([]);
  
  // Aplicar mudanças locais aos produtos para visualização
  const getProductsWithLocalChanges = useCallback((): ProductWithChanges[] => {
    return originalProducts.map(product => {
      const productChanges = pendingChanges.filter(change => change.productId === product.id);
      
      if (productChanges.length === 0) {
        return { ...product, localChanges: { hasChanges: false } };
      }

      let mainImageUrl = product.image;
      let additionalImages = Array.isArray(product.additional_images) ? [...product.additional_images] : [];

      // Aplicar mudanças na ordem que foram feitas
      productChanges.forEach(change => {
        if (change.isMainImage) {
          if (change.type === 'add') {
            mainImageUrl = change.imageUrl;
          } else if (change.type === 'remove') {
            mainImageUrl = null;
          }
        } else {
          if (change.type === 'add' && !additionalImages.includes(change.imageUrl)) {
            additionalImages.push(change.imageUrl);
          } else if (change.type === 'remove') {
            additionalImages = additionalImages.filter(img => img !== change.imageUrl);
          }
        }
      });

      return {
        ...product,
        image: mainImageUrl,
        additional_images: additionalImages,
        localChanges: {
          mainImageUrl,
          additionalImages,
          hasChanges: true
        }
      };
    });
  }, [originalProducts, pendingChanges]);

  // Adicionar mudança local
  const addLocalChange = useCallback((productId: string, imageUrl: string, isMainImage: boolean) => {
    const newChange: ImageChange = {
      productId,
      type: 'add',
      imageUrl,
      isMainImage
    };

    setPendingChanges(prev => {
      // Remover mudanças anteriores conflitantes
      const filtered = prev.filter(change => 
        !(change.productId === productId && 
          change.imageUrl === imageUrl && 
          change.isMainImage === isMainImage)
      );
      
      return [...filtered, newChange];
    });
  }, []);

  // Remover mudança local
  const removeLocalChange = useCallback((productId: string, imageUrl: string, isMainImage: boolean) => {
    const newChange: ImageChange = {
      productId,
      type: 'remove',
      imageUrl,
      isMainImage
    };

    setPendingChanges(prev => [...prev, newChange]);
  }, []);

  // Limpar todas as mudanças
  const clearAllChanges = useCallback(() => {
    setPendingChanges([]);
  }, []);

  // Verificar se há mudanças pendentes
  const hasChanges = pendingChanges.length > 0;

  // Contar produtos com mudanças
  const changedProductsCount = new Set(pendingChanges.map(change => change.productId)).size;

  return {
    productsWithChanges: getProductsWithLocalChanges(),
    pendingChanges,
    addLocalChange,
    removeLocalChange,
    clearAllChanges,
    hasChanges,
    changedProductsCount
  };
};
