
export interface Product {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  price: number;
  list_price?: number;
  pro_price?: number;
  pro_discount_percent?: number;
  new_price?: number;
  digital_price?: number;
  discount_price?: number;
  promotional_price?: number;
  discount_percentage?: number;
  pix_discount_percentage?: number;
  uti_pro_price?: number;


  installment_options?: number;
  image: string;
  image_url?: string; // Added for backward compatibility
  images?: string[];
  additional_images?: string[];
  sizes?: string[];
  colors?: string[];
  stock?: number;
  category_id?: string;
  tags?: { id: string; name: string; }[];
  tagIds?: string[];
  sku?: string;
  badge_text?: string;
  badge_color?: string;
  badge_visible?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  rating?: number;
  rating_average?: number;
  rating_count?: number;
  reviews_enabled?: boolean;
  show_stock?: boolean;
  show_rating?: boolean;
  created_at: string;
  updated_at: string;
  specifications?: Array<{
    label: string;
    value: string;
  }>;
  technical_specs?: any;
  product_features?: any;
  shipping_weight?: number;
  shipping_dimensions?: any;
  free_shipping?: boolean;
  shipping_time_min?: number;
  shipping_time_max?: number;
  store_pickup_available?: boolean;
  related_products?: any;
  related_products_auto?: boolean;
  meta_title?: string;
  meta_description?: string;
  slug?: string;
  
  // Campos adicionais necessários
  platform?: string;
  is_on_sale?: boolean;
  category?: string;
  condition?: string;
  title?: string;
  genre?: string; // Added for ProductTabsMobile
  developer?: string; // Added for ProductTabsMobile
  
  // Novos campos expandidos
  product_videos?: any;
  product_faqs?: any;
  product_highlights?: any;
  features?: any; // Added for ProductTabsMobile backward compatibility
  reviews_config?: any;
  trust_indicators?: any;
  manual_related_products?: any;
  breadcrumb_config?: any;
  product_descriptions?: any;
  delivery_config?: any;
  display_config?: any;

  // Campos do sistema de SKUs
  parent_product_id?: string;
  is_master_product?: boolean;
  product_type?: 'simple' | 'master' | 'sku';
  sku_code?: string;
  variant_attributes?: {
    platform?: string;
    edition?: string;
    region?: string;
    [key: string]: any;
  };
  sort_order?: number;
  available_variants?: {
    platforms?: string[];
    editions?: string[];
    [key: string]: any;
  };
  master_slug?: string;
  inherit_from_master?: {
    description?: boolean;
    images?: boolean;
    specifications?: boolean;
    [key: string]: boolean;
  };

  // Campos configuráveis do UTI Pro
  uti_pro_enabled?: boolean;
  uti_pro_type?: 'percentage' | 'fixed';
  uti_pro_value?: number;
  uti_pro_custom_price?: number;

  // Campos UTI Coins
  uti_coins_cashback_percentage?: number;
  uti_coins_discount_percentage?: number;
}

// Tipos específicos para SKUs
export interface ProductSKU extends Product {
  parent_product_id: string;
  product_type: 'sku';
  sku_code: string;
  variant_attributes: {
    platform: string;
    [key: string]: any;
  };
}

// Tipos específicos para produtos mestre
export interface MasterProduct extends Product {
  product_type: 'master';
  is_master_product: true;
  available_variants: {
    platforms: string[];
    [key: string]: any;
  };
}

// Interface para navegação entre SKUs
export interface SKUNavigation {
  masterProduct: MasterProduct;
  currentSKU?: ProductSKU;
  availableSKUs: ProductSKU[];
  platforms: {
    platform: string;
    sku: ProductSKU | null;
    available: boolean;
  }[];
}

// Tipos para plataformas suportadas
export type Platform = 'xbox' | 'playstation' | 'pc' | 'nintendo' | 'mobile';

export interface PlatformInfo {
  id: Platform;
  name: string;
  icon: string;
  color: string;
}
