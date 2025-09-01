import { useCallback, useMemo } from 'react';
import { useOptimizedCache, CacheKeys } from './useOptimizedCache';
import { supabase } from '@/integrations/supabase/client';

// Tipos para a view unificada
export interface OptimizedHomepageLayoutItem {
  id: number;
  section_key: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  
  // Product section data
  product_section_title?: string;
  product_section_title_part1?: string;
  product_section_title_part2?: string;
  product_section_title_color1?: string;
  product_section_title_color2?: string;
  product_section_view_all_link?: string;
  
  // Special section data
  special_section_title?: string;
  special_section_title_color1?: string;
  special_section_title_color2?: string;
  special_section_background_color?: string;
  special_section_is_active?: boolean;
  special_section_display_order?: number;
  special_section_content_config?: any;
}

// Função para buscar dados da view unificada
const fetchOptimizedHomepageLayout = async (): Promise<OptimizedHomepageLayoutItem[]> => {
  console.log('🚀 Buscando layout otimizado da view unificada...');
  
  const { data, error } = await supabase
    .from('view_homepage_layout_complete')
    .select('*')
    .order('display_order');

  if (error) {
    console.error('❌ Erro ao buscar layout otimizado:', error);
    throw error;
  }

  console.log('✅ Layout otimizado carregado:', data?.length, 'itens');
  return data || [];
};

// Hook principal para layout otimizado
export const useOptimizedHomepageLayout = () => {
  const queryKey = useMemo(() => 
    CacheKeys.layout(), 
    []
  );

  const query = useOptimizedCache(
    queryKey,
    fetchOptimizedHomepageLayout,
    'layout', // 2 minutos de cache
    {
      staleTime: 2 * 60 * 1000, // 2 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    }
  );

  // Processar dados para compatibilidade com componentes existentes
  const processedLayoutItems = useMemo(() => {
    if (!query.data) return [];

    return query.data.map(item => ({
      ...item,
      title: getDisplayTitle(item),
      section_data: getSectionData(item)
    }));
  }, [query.data]);

  return {
    ...query,
    layoutItems: processedLayoutItems,
    isOptimized: true // Flag para indicar que está usando a view otimizada
  };
};

// Função para gerar título de exibição
const getDisplayTitle = (item: OptimizedHomepageLayoutItem): string => {
  // Títulos fixos
  const fixedTitles: Record<string, string> = {
    'hero_banner': 'Carrossel de Banners Principal',
    'hero_quick_links': 'Links Rápidos (Categorias)',
    'promo_banner': 'Banner Promocional (UTI PRO)',
    'specialized_services': 'Seção: Nossos Serviços Especializados',
    'why_choose_us': 'Seção: Por que escolher a UTI DOS GAMES?',
    'contact_help': 'Seção: Precisa de Ajuda/Contato'
  };

  // Verificar se é título fixo
  if (fixedTitles[item.section_key]) {
    return fixedTitles[item.section_key];
  }

  // Product sections
  if (item.section_key.startsWith('product_section_')) {
    if (item.product_section_title) {
      return `Seção Produtos: ${item.product_section_title}`;
    }
    return `Seção Produtos: ${item.section_key.substring(16, 24)}...`;
  }

  // Special sections
  if (item.section_key.startsWith('special_section_')) {
    if (item.special_section_title) {
      return `Seção Especial: ${item.special_section_title}`;
    }
    return `Seção Especial: ${item.section_key.substring(16, 24)}...`;
  }

  return item.section_key;
};

// Função para gerar dados da seção
const getSectionData = (item: OptimizedHomepageLayoutItem) => {
  // Product sections
  if (item.section_key.startsWith('product_section_') && item.product_section_title) {
    return {
      type: 'product_section',
      id: item.section_key.replace('product_section_', ''),
      title: item.product_section_title,
      title_part1: item.product_section_title_part1,
      title_part2: item.product_section_title_part2,
      title_color1: item.product_section_title_color1,
      title_color2: item.product_section_title_color2,
      view_all_link: item.product_section_view_all_link
    };
  }

  // Special sections
  if (item.section_key.startsWith('special_section_') && item.special_section_title) {
    return {
      type: 'special_section',
      id: item.section_key.replace('special_section_', ''),
      title: item.special_section_title,
      title_color1: item.special_section_title_color1,
      title_color2: item.special_section_title_color2,
      background_color: item.special_section_background_color,
      is_active: item.special_section_is_active,
      display_order: item.special_section_display_order,
      content_config: item.special_section_content_config
    };
  }

  return null;
};

// Hook para prefetch do layout otimizado
export const useOptimizedLayoutPrefetch = () => {
  const { prefetchData } = useCacheInvalidation();

  const prefetchOptimizedLayout = useCallback(async () => {
    await prefetchData(
      CacheKeys.layout(),
      fetchOptimizedHomepageLayout,
      'layout'
    );
    console.log('⚡ Layout otimizado prefetch concluído');
  }, [prefetchData]);

  return { prefetchOptimizedLayout };
};

// Hook para comparar performance
export const useLayoutPerformanceComparison = () => {
  const startTime = useMemo(() => Date.now(), []);
  
  const { data: optimizedData, isLoading: optimizedLoading } = useOptimizedHomepageLayout();
  
  const endTime = useMemo(() => {
    if (optimizedData && !optimizedLoading) {
      return Date.now();
    }
    return null;
  }, [optimizedData, optimizedLoading]);

  const loadTime = useMemo(() => {
    if (endTime) {
      return endTime - startTime;
    }
    return null;
  }, [startTime, endTime]);

  return {
    loadTime,
    isOptimized: true,
    itemCount: optimizedData?.length || 0,
    performance: loadTime ? (loadTime < 1000 ? 'excellent' : loadTime < 2000 ? 'good' : 'needs_improvement') : null
  };
};

// Importar hook de invalidação
import { useCacheInvalidation } from './useOptimizedCache';

