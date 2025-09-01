export interface ImportedProduct {
  // Campos básicos
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  image?: string;
  additional_images?: string;
  
  // Sistema SKU
  is_master_product?: boolean;
  parent_product_id?: string;
  sku_code?: string;
  variant_attributes?: string;
  master_slug?: string;
  inherit_from_master?: string;
  sort_order?: number;
  
  // Preços
  pro_price?: number;
  list_price?: number;
  uti_pro_price?: number;
  uti_pro_custom_price?: number;
  uti_pro_enabled?: boolean;
  uti_pro_value?: number;
  uti_pro_type?: string;
  
  // Mídia e conteúdo
  product_videos?: string;
  product_descriptions?: string;
  
  // Especificações
  specifications?: string;
  custom_specifications?: string;
  technical_specs?: string;
  product_features?: string;
  
  // Reviews
  product_highlights?: string;
  reviews_config?: string;
  
  // Trust indicators
  trust_indicators?: string;
  
  // Entrega
  delivery_config?: string;
  shipping_weight?: number;
  free_shipping?: boolean;
  
  // Display
  display_config?: string;
  badge_text?: string;
  badge_color?: string;
  badge_visible?: boolean;
  
  // SEO
  meta_title?: string;
  meta_description?: string;
  slug?: string;
  
  // Navegação
  breadcrumb_config?: string;
  
  // Categorização
  brand?: string;
  category?: string;
  platform?: string;
  condition?: string;
  tags?: string;
  colors?: string;
  sizes?: string;
  
  // Status
  is_active?: boolean;
  is_featured?: boolean;
  
  // Metadados do import
  _rowIndex?: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ImportResult {
  success: boolean;
  created: number;
  updated: number;
  error?: string;
}

export interface TemplateColumn {
  key: string;
  label: string;
  instructions?: string;
  required?: boolean;
  type: 'text' | 'number' | 'boolean' | 'json' | 'array';
  example?: any;
  width?: number;
}

export interface ProductTemplate {
  columns: TemplateColumn[];
  data: any[];
  instructions: any[];
  examples: any[];
}