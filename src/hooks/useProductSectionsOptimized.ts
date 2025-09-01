import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types matching DB structure
export type SectionItemType = 'product' | 'tag';

export interface ProductSectionItem {
  id?: number;
  section_id: string;
  item_type: SectionItemType;
  item_id: string;
  display_order?: number;
}

export interface ProductSection {
  id: string;
  title: string;
  view_all_link?: string | null;
  created_at?: string;
  updated_at?: string;
  items?: ProductSectionItem[];
}

// Função para buscar seções de produtos
const fetchProductSections = async (): Promise<ProductSection[]> => {
  console.log('[useProductSectionsOptimized] Fetching sections...');
  
  // 1. Fetch all sections
  const { data: sectionsData, error: sectionsError } = await supabase
    .from('product_sections')
    .select('*')
    .order('created_at', { ascending: true });

  if (sectionsError) throw sectionsError;
  if (!sectionsData) return [];

  // 2. Fetch all items for all sections
  const sectionIds = sectionsData.map(section => section.id);
  
  if (sectionIds.length === 0) {
    return sectionsData.map(section => ({ ...section, items: [] }));
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from('product_section_items')
    .select('*')
    .in('section_id', sectionIds)
    .order('display_order', { ascending: true });

  if (itemsError) throw itemsError;

  // 3. Group items by section
  const itemsBySection = (itemsData || []).reduce((acc, item) => {
    if (!acc[item.section_id]) {
      acc[item.section_id] = [];
    }
    acc[item.section_id].push(item);
    return acc;
  }, {} as Record<string, ProductSectionItem[]>);

  // 4. Combine sections with their items
  const sectionsWithItems = sectionsData.map(section => ({
    ...section,
    items: itemsBySection[section.id] || []
  }));

  console.log('[useProductSectionsOptimized] Final sections:', sectionsWithItems);
  return sectionsWithItems;
};

// Hook otimizado com React Query
export const useProductSectionsOptimized = () => {
  return useQuery({
    queryKey: ['product-sections-optimized'],
    queryFn: fetchProductSections,
    staleTime: 10 * 60 * 1000, // 10 minutos - cache moderado
    gcTime: 20 * 60 * 1000, // 20 minutos
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

