import React, { useEffect } from 'react';
import { useProductPreloader } from '@/hooks/useProductPreloader';

interface HomepageProductPreloaderProps {
  children: React.ReactNode;
  products?: any[];
}

export const HomepageProductPreloader: React.FC<HomepageProductPreloaderProps> = ({ 
  children, 
  products = [] 
}) => {
  const { addHomepageProducts, addCategoryProducts, getStats } = useProductPreloader();

  useEffect(() => {
    if (products && products.length > 0) {
      // Aguardar um pouco para garantir que a homepage carregou
      const timer = setTimeout(() => {
        console.log('🏠 Iniciando preload de produtos da homepage');

        // Produtos em destaque (alta prioridade)
        const featuredProducts = products
          .filter(p => p.is_featured)
          .slice(0, 12)
          .map(p => p.id);

        // Produtos mais vendidos/populares (baseado em algum critério)
        const popularProducts = products
          .filter(p => !p.is_featured && p.stock > 0)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 10)
          .map(p => p.id);

        // Produtos por categoria (PlayStation, Xbox, etc.)
        const playstationProducts = products
          .filter(p => p.platform?.toLowerCase().includes('playstation'))
          .slice(0, 8)
          .map(p => p.id);

        const xboxProducts = products
          .filter(p => p.platform?.toLowerCase().includes('xbox'))
          .slice(0, 8)
          .map(p => p.id);

        const nintendoProducts = products
          .filter(p => p.platform?.toLowerCase().includes('nintendo'))
          .slice(0, 6)
          .map(p => p.id);

        // Adicionar à fila de preload com prioridades
        if (featuredProducts.length > 0) {
          console.log(`📌 Adicionando ${featuredProducts.length} produtos em destaque ao preload`);
          addHomepageProducts(featuredProducts);
        }

        if (popularProducts.length > 0) {
          console.log(`⭐ Adicionando ${popularProducts.length} produtos populares ao preload`);
          addHomepageProducts(popularProducts);
        }

        // Produtos por categoria (prioridade menor)
        const categoryProducts = [
          ...playstationProducts,
          ...xboxProducts,
          ...nintendoProducts
        ];

        if (categoryProducts.length > 0) {
          console.log(`🎮 Adicionando ${categoryProducts.length} produtos por categoria ao preload`);
          addCategoryProducts(categoryProducts);
        }

        // Log estatísticas após 5 segundos
        setTimeout(() => {
          const stats = getStats();
          if (stats) {
            console.log('📊 Estatísticas de preload de produtos:', stats);
          }
        }, 5000);

      }, 2000); // Aguardar 2 segundos após produtos carregarem

      return () => clearTimeout(timer);
    }
  }, [products, addHomepageProducts, addCategoryProducts, getStats]);

  return <>{children}</>;
};

