import { supabase } from '@/integrations/supabase/client';

export const fetchPlayStationPage = async () => {
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'playstation')
    .single();

  if (pageError || !page) {
    console.log('Página PlayStation não encontrada, usando dados fallback');
    return null;
  }

  return page;
};

export const fetchPlayStationSections = async (pageId: string) => {
  const { data: sections, error: sectionsError } = await supabase
    .from('page_layout_items')
    .select('*')
    .eq('page_id', pageId)
    .eq('is_visible', true)
    .order('display_order');

  if (sectionsError) {
    console.error('Erro ao carregar seções PlayStation:', sectionsError);
    throw new Error('Erro ao carregar seções PlayStation');
  }

  return sections;
};

export const fetchAllProducts = async () => {
  const { data: allProducts, error: productsError } = await supabase
    .from('view_product_with_tags')
    .select('*');

  if (productsError) {
    console.error('Erro ao carregar produtos:', productsError);
    throw new Error('Erro ao carregar produtos');
  }

  return allProducts;
};

