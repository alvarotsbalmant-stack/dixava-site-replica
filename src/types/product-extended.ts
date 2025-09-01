// Tipos específicos para os novos campos de produtos expandidos

export interface ProductVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  type: 'youtube' | 'vimeo' | 'mp4';
  order: number;
  is_featured: boolean;
}

export interface ProductFAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  is_visible: boolean;
  category: string;
}

export interface ProductHighlight {
  id: string;
  text: string;
  icon: string;
  order: number;
  is_featured: boolean;
}

export interface ReviewsConfig {
  enabled: boolean;
  show_rating: boolean;
  show_count: boolean;
  allow_reviews: boolean;
  custom_rating: {
    value: number;
    count: number;
    use_custom: boolean;
  };
}

export interface TrustIndicator {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  is_visible: boolean;
  text: string;
  type: string;
}

export interface ManualRelatedProduct {
  product_id: string;
  relationship_type: 'accessory' | 'bundle' | 'alternative';
  order: number;
  custom_title?: string;
}

export interface BreadcrumbConfig {
  custom_path: string[];
  use_custom: boolean;
  show_breadcrumb: boolean;
}

export interface ProductDescriptions {
  short?: string;
  detailed?: string;
  technical?: string;
  marketing?: string;
}

export interface DeliveryConfig {
  custom_shipping_time?: string;
  shipping_regions?: string[];
  express_available?: boolean;
  pickup_locations?: Array<{
    name: string;
    address: string;
    hours: string;
  }>;
  shipping_notes?: string;
}

export interface DisplayConfig {
  show_stock_counter: boolean;
  show_view_counter: boolean;
  custom_view_count?: number;
  show_urgency_banner: boolean;
  urgency_text?: string;
  show_social_proof: boolean;
  social_proof_text?: string;
}

export interface SpecCategory {
  name: string;
  specs: Array<{
    label: string;
    value: string;
    highlight: boolean;
  }>;
}

export interface TechnicalSpecs {
  categories: SpecCategory[];
}

export interface ProductFeatures {
  category: string;
  features: string[];
}

// Interface estendida para produtos com todos os novos campos
export interface ExtendedProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  image?: string;
  additional_images?: string[];
  sizes?: string[];
  colors?: string[];
  badge_text?: string;
  badge_color?: string;
  badge_visible?: boolean;
  specifications?: TechnicalSpecs;
  product_features?: ProductFeatures[];
  meta_title?: string;
  meta_description?: string;
  slug?: string;
  is_active?: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
  
  // Novos campos expandidos
  product_videos?: ProductVideo[];
  product_faqs?: ProductFAQ[];
  product_highlights?: ProductHighlight[];
  reviews_config?: ReviewsConfig;
  trust_indicators?: TrustIndicator[];
  manual_related_products?: ManualRelatedProduct[];
  breadcrumb_config?: BreadcrumbConfig;
  product_descriptions?: ProductDescriptions;
  delivery_config?: DeliveryConfig;
  display_config?: DisplayConfig;
}

// Tipos para formulários de edição
export interface ProductFormData {
  id?: string; // ID opcional para produtos em edição
  name: string;
  description?: string;
  price: number;
  stock?: number;
  image?: string;
  additional_images?: string[];
  sizes?: string[];
  colors?: string[];
  badge_text?: string;
  badge_color?: string;
  badge_visible?: boolean;
  specifications?: TechnicalSpecs;
  product_features?: ProductFeatures[];
  meta_title?: string;
  meta_description?: string;
  slug?: string;
  is_active?: boolean;
  is_featured?: boolean;
  
  // Novos campos expandidos
  product_videos?: ProductVideo[];
  product_faqs?: ProductFAQ[];
  product_highlights?: ProductHighlight[];
  reviews_config?: ReviewsConfig;
  trust_indicators?: TrustIndicator[];
  manual_related_products?: ManualRelatedProduct[];
  breadcrumb_config?: BreadcrumbConfig;
  product_descriptions?: ProductDescriptions;
  delivery_config?: DeliveryConfig;
  display_config?: DisplayConfig;
  
  tagIds?: string[];
  list_price?: number;
  pro_price?: number;
}

// Tipos para abas do ProductManager
export type ProductTab = 
  | 'basic'
  | 'media'
  | 'highlights'
  | 'specs'
  | 'faq'
  | 'reviews'
  | 'trust'
  | 'related'
  | 'delivery'
  | 'display'
  | 'navigation'
  | 'tags';

export interface TabConfig {
  id: ProductTab;
  label: string;
  icon: string;
  description: string;
}

