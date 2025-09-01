import { useState, useEffect } from 'react';
import { PlayStationData } from './types';
import { fetchPlayStationPage, fetchPlayStationSections, fetchAllProducts } from './dataFetchers';
import { processProductsFromRows } from './productFilters';
import { processSections } from './sectionProcessor';

export const usePlayStationData = (): PlayStationData => {
  const [data, setData] = useState<PlayStationData>({
    consoles: [],
    games: [],
    accessories: [],
    deals: [],
    newsArticles: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadPlayStationData = async () => {
      try {
        console.log('[usePlayStationData] Iniciando carregamento de dados...');
        
        // Buscar a página PlayStation e suas seções
        const page = await fetchPlayStationPage();
        
        if (!page) {
          console.log('[usePlayStationData] Página não encontrada, usando dados fallback');
          // Mesmo sem página, vamos processar com dados fallback
        }

        // Buscar seções da página (se existir)
        let sections = [];
        if (page) {
          sections = await fetchPlayStationSections(page.id);
          console.log(`[usePlayStationData] ${sections.length} seções encontradas`);
        }

        // Buscar todos os produtos
        const allProductsRows = await fetchAllProducts();
        console.log(`[usePlayStationData] ${allProductsRows.length} produtos encontrados`);

        // Processar produtos (remover duplicatas e converter formato)
        const products = processProductsFromRows(allProductsRows);
        console.log(`[usePlayStationData] ${products.length} produtos processados`);

        // Processar cada seção para extrair produtos específicos
        const sectionData = processSections(sections, products);
        console.log('[usePlayStationData] Dados processados:', {
          consoles: sectionData.consoles.length,
          games: sectionData.games.length,
          accessories: sectionData.accessories.length,
          deals: sectionData.deals.length
        });

        setData({
          ...sectionData,
          loading: false,
          error: null
        });

        console.log('[usePlayStationData] Carregamento concluído com sucesso');

      } catch (error) {
        console.error('[usePlayStationData] Erro ao carregar dados:', error);
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Erro ao carregar dados PlayStation' 
        }));
      }
    };

    loadPlayStationData();
  }, []);

  return data;
};

// Export types for external use
export type { PlayStationData, PlayStationSection, ProductOverride, SectionConfig } from './types';

