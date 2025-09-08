import { supabase } from '@/integrations/supabase/client';
import { Product } from './types';

const mapRowToProduct = (row: any): Product => ({
  id: row.id || row.product_id,
  name: row.name || row.product_name || '',
  description: row.description || row.product_description || '',
  price: Number(row.price || row.product_price) || 0,
  pro_price: row.pro_price ? Number(row.pro_price) : undefined,
  list_price: row.list_price ? Number(row.list_price) : undefined,
  image: row.image || row.product_image || '',
  additional_images: row.additional_images || [],
  sizes: row.sizes || [],
  colors: row.colors || [],
  stock: row.stock || row.product_stock || 0,
  badge_text: row.badge_text || '',
  badge_color: row.badge_color || '#22c55e',
  badge_visible: row.badge_visible || false,
  specifications: row.specifications || [],
  technical_specs: row.technical_specs || {},
  product_features: row.product_features || {},
  shipping_weight: row.shipping_weight ? Number(row.shipping_weight) : undefined,
  free_shipping: row.free_shipping || false,
  meta_title: row.meta_title || '',
  meta_description: row.meta_description || '',
  slug: row.slug || '',
  is_active: row.is_active !== false,
  is_featured: row.is_featured || false,
  
  // Campos UTI PRO
  uti_pro_enabled: row.uti_pro_enabled || false,
  uti_pro_value: row.uti_pro_value ? Number(row.uti_pro_value) : undefined,
  uti_pro_custom_price: row.uti_pro_custom_price ? Number(row.uti_pro_custom_price) : undefined,
  uti_pro_type: row.uti_pro_type || 'percentage',
  
  // Campos do sistema de SKUs
  parent_product_id: row.parent_product_id || undefined,
  is_master_product: row.is_master_product || false,
  product_type: row.product_type || 'simple',
  sku_code: row.sku_code || undefined,
  variant_attributes: row.variant_attributes || {},
  sort_order: row.sort_order || 0,
  available_variants: row.available_variants || {},
  master_slug: row.master_slug || undefined,
  inherit_from_master: row.inherit_from_master || {},
  
  // Novos campos expandidos
  product_videos: row.product_videos || [],
  product_faqs: row.product_faqs || [],
  product_highlights: row.product_highlights || [],
  reviews_config: row.reviews_config || {
    enabled: true,
    show_rating: true,
    show_count: true,
    allow_reviews: true,
    custom_rating: { value: 0, count: 0, use_custom: false }
  },
  trust_indicators: row.trust_indicators || [],
  manual_related_products: row.manual_related_products || [],
  breadcrumb_config: row.breadcrumb_config || {
    custom_path: [],
    use_custom: false,
    show_breadcrumb: true
  },
  product_descriptions: row.product_descriptions || {
    short: '',
    detailed: '',
    technical: '',
    marketing: ''
  },
  delivery_config: row.delivery_config || {
    custom_shipping_time: '',
    shipping_regions: [],
    express_available: false,
    pickup_locations: [],
    shipping_notes: ''
  },
  display_config: row.display_config || {
    show_stock_counter: true,
    show_view_counter: false,
    custom_view_count: 0,
    show_urgency_banner: false,
    urgency_text: '',
    show_social_proof: false,
    social_proof_text: ''
  },
  
  // UTI Coins Cashback
  uti_coins_cashback_percentage: row.uti_coins_cashback_percentage ? Number(row.uti_coins_cashback_percentage) : undefined,
  
  // UTI Coins Desconto
  uti_coins_discount_percentage: row.uti_coins_discount_percentage ? Number(row.uti_coins_discount_percentage) : undefined,
  
  tags: [],
  created_at: row.created_at || new Date().toISOString(),
  updated_at: row.updated_at || new Date().toISOString()
});

// Função específica para buscar produtos mestres no admin
export const fetchMasterProductsForAdmin = async (): Promise<Product[]> => {
  try {
    console.log('[fetchMasterProductsForAdmin] Buscando produtos mestres...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_master_product', true)
      .eq('product_type', 'master')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[fetchMasterProductsForAdmin] Erro ao buscar produtos mestres:', error);
      throw error;
    }

    console.log('[fetchMasterProductsForAdmin] Dados brutos do banco:', data);

    const masterProducts = (data || []).map(mapRowToProduct);
    
    console.log('[fetchMasterProductsForAdmin] Produtos mestres processados:', masterProducts);
    
    // Buscar tags para cada produto mestre
    for (const product of masterProducts) {
      const { data: tagsData } = await supabase
        .from('product_tags')
        .select(`
          tag_id,
          tags:tag_id (
            id,
            name
          )
        `)
        .eq('product_id', product.id);

      if (tagsData) {
        product.tags = tagsData
          .filter(item => item.tags)
          .map(item => ({
            id: item.tags.id,
            name: item.tags.name
          }));
      }
    }

    return masterProducts;
  } catch (error) {
    console.error('[fetchMasterProductsForAdmin] Erro:', error);
    throw error;
  }
};

// Função para buscar todos os produtos (incluindo mestres) para o admin
export const fetchAllProductsForAdmin = async (): Promise<Product[]> => {
  try {
    console.log('[fetchAllProductsForAdmin] Buscando todos os produtos...');
    
    const { data, error } = await supabase
      .from('view_product_with_tags')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[fetchAllProductsForAdmin] Erro ao buscar produtos:', error);
      throw error;
    }

    console.log('[fetchAllProductsForAdmin] Dados brutos do banco:', data?.length || 0, 'registros');

    // Agrupar produtos por ID para evitar duplicatas devido às tags
    const productsMap = new Map<string, Product>();
    
    data?.forEach((row: any) => {
      const productId = row.product_id;
      
      if (!productsMap.has(productId)) {
        productsMap.set(productId, mapRowToProduct(row));
      }
      
      // Adicionar tag se existir e não for duplicata
      if (row.tag_id && row.tag_name) {
        const product = productsMap.get(productId)!;
        const tagExists = product.tags?.some(tag => tag.id === row.tag_id);
        
        if (!tagExists) {
          product.tags = product.tags || [];
          product.tags.push({
            id: row.tag_id,
            name: row.tag_name
          });
        }
      }
    });

    const allProducts = Array.from(productsMap.values());
    console.log('[fetchAllProductsForAdmin] Produtos processados:', allProducts.length);
    
    return allProducts;
  } catch (error) {
    console.error('[fetchAllProductsForAdmin] Erro:', error);
    throw error;
  }
};