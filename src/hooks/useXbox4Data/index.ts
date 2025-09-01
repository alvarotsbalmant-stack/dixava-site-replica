
import { useState, useEffect } from 'react';
import { Xbox4Data } from './types';
import { fetchXbox4Page, fetchXbox4Sections } from './dataFetchers';
import { processSections } from './sectionProcessor';
import { useHomepageProducts } from '../useHomepageProducts';

export const useXbox4Data = (): Xbox4Data => {
  // Usar produtos otimizados com cache
  const { data: products, isLoading: productsLoading, error: productsError } = useHomepageProducts();
  
  const [data, setData] = useState<Xbox4Data>({
    consoles: [],
    games: [],
    accessories: [],
    deals: [],
    newsArticles: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadXbox4Data = async () => {
      try {
        // Se ainda carregando produtos, aguardar
        if (productsLoading) {
          return;
        }

        // Se houve erro nos produtos
        if (productsError) {
          setData(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Erro ao carregar produtos' 
          }));
          return;
        }

        // Se não há produtos
        if (!products || products.length === 0) {
          setData(prev => ({ ...prev, loading: false }));
          return;
        }

        // Buscar a página Xbox4 e suas seções
        const page = await fetchXbox4Page();
        
        if (!page) {
          setData(prev => ({ ...prev, loading: false }));
          return;
        }

        // Buscar seções da página
        const sections = await fetchXbox4Sections(page.id);

        // Usar produtos otimizados diretamente (já processados)
        const sectionData = processSections(sections, products);

        setData({
          ...sectionData,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Erro ao carregar dados Xbox4:', error);
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Erro ao carregar dados' 
        }));
      }
    };

    loadXbox4Data();
  }, [products, productsLoading, productsError]);

  return data;
};

// Export types for external use
export type { Xbox4Data, Xbox4Section, ProductOverride, SectionConfig } from './types';
