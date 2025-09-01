
import { supabase } from '@/integrations/supabase/client';

export const fetchXbox4Page = async () => {
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'xbox4')
    .single();

  if (pageError || !page) {
    console.log('Página Xbox4 não encontrada, usando dados fallback');
    return null;
  }

  return page;
};

export const fetchXbox4Sections = async (pageId: string) => {
  const { data: sections, error: sectionsError } = await supabase
    .from('page_layout_items')
    .select('*')
    .eq('page_id', pageId)
    .eq('is_visible', true)
    .order('display_order');

  if (sectionsError) {
    console.error('Erro ao carregar seções:', sectionsError);
    throw new Error('Erro ao carregar seções');
  }

  return sections;
};

export const fetchAllProducts = async () => {
  const { data: allProducts, error: productsError } = await supabase
    .from('view_product_with_tags')
    .select('*');

  if (productsError) {
    console.error('Erro ao carregar produtos:', productsError);
    // Fallback to products table if view fails
    const { data: fallbackProducts, error: fallbackError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);
    
    if (fallbackError) {
      throw new Error('Erro ao carregar produtos');
    }
    
    return fallbackProducts;
  }

  return allProducts;
};
