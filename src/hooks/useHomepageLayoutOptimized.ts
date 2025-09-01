import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Define the structure for a layout item from the DB
export interface HomepageLayoutItem {
  id: number;
  section_key: string;
  display_order: number;
  is_visible: boolean;
  title?: string;
}

// Função para buscar layout da homepage
const fetchHomepageLayout = async (): Promise<HomepageLayoutItem[]> => {
  console.log('[useHomepageLayoutOptimized] Fetching layout...');
  
  // 1. Fetch layout order
  const { data: layoutData, error: layoutError } = await supabase
    .from('homepage_layout')
    .select('*')
    .order('display_order', { ascending: true });

  if (layoutError) throw layoutError;
  if (!layoutData) throw new Error('No layout data received');

  // 2. Identify keys for dynamic sections
  const productSectionKeys = layoutData
    .map(item => item.section_key)
    .filter(key => key.startsWith('product_section_'));
  const specialSectionKeys = layoutData
    .map(item => item.section_key)
    .filter(key => key.startsWith('special_section_'));

  // 3. Fetch titles for dynamic sections concurrently
  const fetchPromises = [];
  let productSectionsData: { id: string, title: string }[] = [];
  let specialSectionsData: { id: string, title: string }[] = [];

  if (productSectionKeys.length > 0) {
    const sectionIds = productSectionKeys.map(key => key.replace('product_section_', ''));
    fetchPromises.push(
      supabase
        .from('product_sections')
        .select('id, title')
        .in('id', sectionIds)
        .then(({ data, error }) => {
          if (error) throw error;
          productSectionsData = data || [];
        })
    );
  }

  if (specialSectionKeys.length > 0) {
    const sectionIds = specialSectionKeys.map(key => key.replace('special_section_', ''));
    fetchPromises.push(
      supabase
        .from('special_sections')
        .select('id, title')
        .in('id', sectionIds)
        .then(({ data, error }) => {
          if (error) throw error;
          specialSectionsData = data || [];
        })
    );
  }

  // Wait for all fetches to complete
  await Promise.all(fetchPromises);

  // 4. Map titles to layout items
  const getFixedSectionTitle = (key: string): string | null => {
    switch (key) {
      case 'hero_banner': return 'Carrossel de Banners Principal';
      case 'hero_quick_links': return 'Links Rápidos (Categorias)';
      case 'promo_banner': return 'Banner Promocional (UTI PRO)';
      case 'specialized_services': return 'Seção: Nossos Serviços Especializados';
      case 'why_choose_us': return 'Seção: Por que escolher a UTI DOS GAMES?';
      case 'contact_help': return 'Seção: Precisa de Ajuda/Contato';
      default: return null;
    }
  };

  const enrichedLayoutItems: HomepageLayoutItem[] = layoutData.map(item => {
    let title = getFixedSectionTitle(item.section_key);
    
    if (!title) {
      if (item.section_key.startsWith('product_section_')) {
        const sectionId = item.section_key.replace('product_section_', '');
        const productSection = productSectionsData.find(ps => ps.id === sectionId);
        title = productSection ? `Seção: ${productSection.title}` : `Seção de Produtos (${sectionId})`;
      } else if (item.section_key.startsWith('special_section_')) {
        const sectionId = item.section_key.replace('special_section_', '');
        const specialSection = specialSectionsData.find(ss => ss.id === sectionId);
        title = specialSection ? `Seção Especial: ${specialSection.title}` : `Seção Especial (${sectionId})`;
      } else {
        title = item.section_key;
      }
    }

    return {
      ...item,
      title
    };
  });

  console.log('[useHomepageLayoutOptimized] Final layout items:', enrichedLayoutItems);
  return enrichedLayoutItems;
};

// Hook otimizado com React Query
export const useHomepageLayoutOptimized = () => {
  return useQuery({
    queryKey: ['homepage-layout-optimized'],
    queryFn: fetchHomepageLayout,
    staleTime: 10 * 60 * 1000, // 10 minutos - cache moderado
    gcTime: 20 * 60 * 1000, // 20 minutos
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

