
import { supabase } from '@/integrations/supabase/client';
import { Product } from './types';

// Interface para configuração de critérios
interface ProductCriteriaConfig {
  product_ids?: string[];
  filter_featured?: boolean;
  sort_by?: 'name' | 'price' | 'created_at';
  sort_order?: 'asc' | 'desc';
  category_id?: string;
  tags?: string[];
  price_range?: {
    min: number;
    max: number;
  };
}

// Versão simplificada do produto para listagens
export interface ProductLight {
  id: string;
  name: string;
  price: number;
  pro_price?: number;
  list_price?: number;
  image: string;
  badge_text?: string;
  badge_color?: string;
  badge_visible?: boolean;
  slug: string;
  is_active: boolean;
  is_featured: boolean;
  uti_pro_enabled: boolean;
  uti_pro_value?: number;
  uti_pro_custom_price?: number;
  uti_pro_type: 'fixed' | 'percentage';
}

// Cache simples em memória
const productCache = new Map<string, { data: Product[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Helper function para garantir tipo correto do uti_pro_type
const normalizeUtiProType = (type: any): 'fixed' | 'percentage' => {
  return (type === 'fixed' || type === 'percentage') ? type : 'percentage';
};

// Helper function para converter valores numéricos
const toNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Helper function para arrays
const ensureArray = (value: any): any[] => {
  return Array.isArray(value) ? value : [];
};

const mapRowToProductLight = (row: any): ProductLight => ({
  id: row.product_id || '',
  name: row.product_name || '',
  price: toNumber(row.product_price),
  pro_price: row.pro_price ? toNumber(row.pro_price) : undefined,
  list_price: row.list_price ? toNumber(row.list_price) : undefined,
  image: row.product_image || '',
  badge_text: row.badge_text || '',
  badge_color: row.badge_color || '#22c55e',
  badge_visible: Boolean(row.badge_visible),
  slug: row.slug || '',
  is_active: row.is_active !== false,
  is_featured: Boolean(row.is_featured),
  uti_pro_enabled: Boolean(row.uti_pro_enabled),
  uti_pro_value: row.uti_pro_value ? toNumber(row.uti_pro_value) : undefined,
  uti_pro_custom_price: row.uti_pro_custom_price ? toNumber(row.uti_pro_custom_price) : undefined,
  uti_pro_type: normalizeUtiProType(row.uti_pro_type),
});

// Simplified product mapping to avoid deep type instantiation
const mapRowToProduct = (row: any): Product => {
  // Basic product properties
  const basicProduct = {
    id: row.product_id || '',
    name: row.product_name || '',
    description: row.product_description || '',
    price: toNumber(row.product_price),
    pro_price: row.pro_price ? toNumber(row.pro_price) : undefined,
    list_price: row.list_price ? toNumber(row.list_price) : undefined,
    image: row.product_image || '',
    additional_images: ensureArray(row.additional_images),
    sizes: ensureArray(row.sizes),
    colors: ensureArray(row.colors),
    stock: toNumber(row.product_stock),
    badge_text: row.badge_text || '',
    badge_color: row.badge_color || '#22c55e',
    badge_visible: Boolean(row.badge_visible),
    specifications: ensureArray(row.specifications),
    technical_specs: row.technical_specs || {},
    product_features: row.product_features || {},
    shipping_weight: row.shipping_weight ? toNumber(row.shipping_weight) : undefined,
    free_shipping: Boolean(row.free_shipping),
    meta_title: row.meta_title || '',
    meta_description: row.meta_description || '',
    slug: row.slug || '',
    is_active: row.is_active !== false,
    is_featured: Boolean(row.is_featured),
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString()
  };

  // UTI PRO properties
  const utiProProps = {
    uti_pro_enabled: Boolean(row.uti_pro_enabled),
    uti_pro_value: row.uti_pro_value ? toNumber(row.uti_pro_value) : undefined,
    uti_pro_custom_price: row.uti_pro_custom_price ? toNumber(row.uti_pro_custom_price) : undefined,
    uti_pro_type: normalizeUtiProType(row.uti_pro_type)
  };

  // SKU system properties
  const skuProps = {
    parent_product_id: row.parent_product_id || undefined,
    is_master_product: Boolean(row.is_master_product),
    product_type: (row.product_type || 'simple') as 'simple' | 'master' | 'sku',
    sku_code: row.sku_code || undefined,
    variant_attributes: row.variant_attributes || {},
    sort_order: toNumber(row.sort_order),
    available_variants: row.available_variants || {},
    master_slug: row.master_slug || undefined,
    inherit_from_master: row.inherit_from_master || {}
  };

  // Extended properties with default values
  const extendedProps = {
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
    tags: []
  };

  // Combine all properties
  return {
    ...basicProduct,
    ...utiProProps,
    ...skuProps,
    ...extendedProps
  } as Product;
};

// Função otimizada para carregar produtos com paginação
export const fetchProductsLightPaginated = async (
  page: number = 0, 
  limit: number = 20
): Promise<{ products: ProductLight[], hasMore: boolean, total: number }> => {
  try {
    const offset = page * limit;
    
    // Consulta otimizada com apenas campos essenciais
    const { data, error, count } = await supabase
      .from('products')
      .select(`
        id as product_id,
        name as product_name,
        price as product_price,
        pro_price,
        list_price,
        image as product_image,
        badge_text,
        badge_color,
        badge_visible,
        slug,
        is_active,
        is_featured,
        uti_pro_enabled,
        uti_pro_value,
        uti_pro_custom_price,
        uti_pro_type
      `, { count: 'exact' })
      .eq('is_active', true)
      .neq('product_type', 'master')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching products light:', error);
      throw error;
    }

    const products = data?.map(mapRowToProductLight) || [];
    const total = count || 0;
    const hasMore = offset + limit < total;

    console.log(`[fetchProductsLightPaginated] Página ${page}: ${products.length} produtos, total: ${total}`);
    
    return { products, hasMore, total };
  } catch (error) {
    console.error('Error in fetchProductsLightPaginated:', error);
    throw error;
  }
};

// Função para carregar detalhes completos de um produto específico
export const fetchProductDetails = async (productId: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('view_product_with_tags')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return mapRowToProduct(data);
  } catch (error) {
    console.error('Error in fetchProductDetails:', error);
    return null;
  }
};

// Função otimizada para seções específicas (carrosséis)
export const fetchProductsByCriteriaOptimized = async (
  config: ProductCriteriaConfig,
  limit: number = 12
): Promise<ProductLight[]> => {
  try {
    let query = supabase
      .from('products')
      .select(`
        id as product_id,
        name as product_name,
        price as product_price,
        pro_price,
        list_price,
        image as product_image,
        badge_text,
        badge_color,
        badge_visible,
        slug,
        is_active,
        is_featured,
        uti_pro_enabled,
        uti_pro_value,
        uti_pro_custom_price,
        uti_pro_type
      `)
      .eq('is_active', true)
      .neq('product_type', 'master')
      .limit(limit);
    
    // Filter by product IDs if specified
    if (config.product_ids && config.product_ids.length > 0) {
      query = query.in('id', config.product_ids);
    }
    
    // Filter by featured if specified
    if (config.filter_featured) {
      query = query.eq('is_featured', true);
    }
    
    // Apply sorting
    if (config.sort_by) {
      const ascending = config.sort_order === 'asc';
      switch (config.sort_by) {
        case 'name':
          query = query.order('name', { ascending });
          break;
        case 'price':
          query = query.order('price', { ascending });
          break;
        case 'created_at':
          query = query.order('created_at', { ascending });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products by criteria:', error);
      throw error;
    }

    const products = data?.map(mapRowToProductLight) || [];
    console.log(`[fetchProductsByCriteriaOptimized] Carregados ${products.length} produtos para seção`);
    
    return products;
  } catch (error) {
    console.error('Error in fetchProductsByCriteriaOptimized:', error);
    throw error;
  }
};

// Função com cache para produtos frequentemente acessados
export const fetchProductsFromDatabaseCached = async (): Promise<Product[]> => {
  const cacheKey = 'all_products';
  const cached = productCache.get(cacheKey);
  
  // Verificar se o cache é válido
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log('[fetchProductsFromDatabaseCached] Retornando dados do cache');
    return cached.data;
  }

  try {
    const { data, error } = await supabase
      .from('view_product_with_tags')
      .select('*')
      .neq('product_type', 'master');

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

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

    const products = Array.from(productsMap.values());
    
    // Salvar no cache
    productCache.set(cacheKey, {
      data: products,
      timestamp: Date.now()
    });

    console.log(`[fetchProductsFromDatabaseCached] Carregados ${products.length} produtos únicos (cached)`);
    return products;
  } catch (error) {
    console.error('Error in fetchProductsFromDatabaseCached:', error);
    throw error;
  }
};

// Função para invalidar cache
export const invalidateProductCache = () => {
  productCache.clear();
  console.log('[invalidateProductCache] Cache de produtos invalidado');
};

// Função para pré-carregar imagens críticas
export const preloadCriticalImages = (products: ProductLight[], count: number = 6) => {
  const criticalProducts = products.slice(0, count);
  
  criticalProducts.forEach(product => {
    if (product.image) {
      const img = new Image();
      img.src = product.image;
    }
  });
  
  console.log(`[preloadCriticalImages] Pré-carregando ${criticalProducts.length} imagens críticas`);
};
