// Types for special section configuration

export interface BannerRowConfig {
  row_id?: string;
  layout: '1_col_full' | '2_col_half' | '3_col_third' | '4_col_quarter' | 'custom' | 'carousel';
  banners?: BannerConfig[];
  custom_sizes?: Array<{width: string, widthUnit: string, height: string}>;
  margin_included_in_banner?: boolean;
  
  // Carousel-specific properties
  type?: 'carousel';
  title?: string;
  showTitle?: boolean;
  titleAlignment?: 'left' | 'center' | 'right';
  selection_mode?: 'tags' | 'products' | 'combined';
  product_ids?: string[];
  tag_ids?: string[];
}

export interface BannerConfig {
  type: 'full_width' | 'half_width' | 'third_width' | 'quarter_width' | 'product_highlight';
  image_url?: string;
  link_url?: string;
  title?: string;
  subtitle?: string;
  button_text?: string;
  enable_hover_animation?: boolean;
}

export interface CarouselConfig {
  title: string;
  selection_mode: 'tags' | 'products' | 'combined';
  tag_ids: string[];
  product_ids: string[];
}

export interface SpecialSectionConfig {
  banner_rows?: BannerRowConfig[];
  carrossel_1?: CarouselConfig;
  carrossel_2?: CarouselConfig;
  layout_settings?: {
    show_background?: boolean;
    carousel_display?: string;
    device_visibility?: {
      mobile?: boolean;
      tablet?: boolean;
      desktop?: boolean;
    };
  };
}