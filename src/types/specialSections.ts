
import { Database } from "../integrations/supabase/types";
import { SpecialSectionConfig } from "./specialSectionConfig";

// Tipos mais específicos para evitar transformações manuais
export type BackgroundType = 'color' | 'image';
export type BackgroundImagePosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type SelectionMode = 'tags' | 'products' | 'combined';

// Base type for Special Section from the database com tipos mais específicos
export interface SpecialSection {
  id: string;
  title: string;
  description?: string;
  background_type: string;
  background_color?: string;
  background_gradient?: string;
  background_image_url?: string;
  background_image_position?: string;
  background_value?: string;
  content_config?: SpecialSectionConfig;
  is_active: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
  // Add missing properties from database
  title_color1?: string;
  title_color2?: string;
  title_part1?: string;
  title_part2?: string;
  padding_top?: number;
  padding_bottom?: number;
  padding_left?: number;
  padding_right?: number;
  margin_top?: number;
  margin_bottom?: number;
  border_radius?: number;
  mobile_settings?: any;
  // Add computed properties for compatibility
  type?: string;
  order?: number;
  isVisible?: boolean;
  // New color customization properties (removed carousel_background_color - using existing background_value)
  carousel_title_color?: string;
  view_all_button_bg_color?: string;
  view_all_button_text_color?: string;
  scrollbar_color?: string;
  scrollbar_hover_color?: string;
}

// Base type for Special Section Element from the database
export type SpecialSectionElement = Database["public"]["Tables"]["special_section_elements"]["Row"] & {
  content_ids?: string[];
};

// Base type for Special Section Grid Layout from the database
export type SpecialSectionGridLayout = Database["public"]["Tables"]["special_section_grid_layouts"]["Row"];

// Input type for creating a new Special Section (excluding auto-generated fields)
export type SpecialSectionCreateInput = Omit<
  SpecialSection,
  "id" | "created_at" | "updated_at"
>;

// Input type for updating an existing Special Section (all fields optional)
export type SpecialSectionUpdateInput = Partial<SpecialSectionCreateInput>;

// Input type for creating a new Special Section Element
export type SpecialSectionElementCreateInput = Omit<
  SpecialSectionElement,
  "id" | "created_at" | "updated_at"
>;

// Input type for updating an existing Special Section Element
export type SpecialSectionElementUpdateInput = Partial<SpecialSectionElementCreateInput>;

// Input type for creating a new Special Section Grid Layout
export type SpecialSectionGridLayoutCreateInput = Omit<
  SpecialSectionGridLayout,
  "id" | "created_at" | "updated_at"
>;

// Input type for updating an existing Special Section Grid Layout
export type SpecialSectionGridLayoutUpdateInput = Partial<SpecialSectionGridLayoutCreateInput>;

// Add the missing CarouselConfig type
export interface CarouselConfig {
  title?: string;
  selection_mode?: 'tags' | 'products' | 'combined';
  tag_ids?: string[];
  product_ids?: string[];
  showTitle?: boolean;
  titleAlignment?: 'left' | 'center' | 'right';
}

// New type for Carousel Row (similar to BannerRowConfig)
export interface CarouselRowConfig {
  row_id: string; // Unique ID for the row
  title?: string;
  showTitle?: boolean;
  titleAlignment?: 'left' | 'center' | 'right';
  selection_mode?: 'tags' | 'products' | 'combined';
  tag_ids?: string[];
  product_ids?: string[];
  margin_included_in_banner?: boolean; // New field for horizontal margin control
}

// Define new banner types for flexibility
export type BannerType = 'full_width' | 'half_width' | 'third_width' | 'quarter_width' | 'product_highlight';

export interface BannerConfig {
  type: BannerType;
  image_url?: string;
  link_url?: string;
  title?: string;
  subtitle?: string;
  button_text?: string;
  enable_hover_animation?: boolean; // New property for hover animation control
}

// Define a row of banners, allowing different layouts per row
export interface BannerRowConfig {
  row_id: string; // Unique ID for the row
  layout: '1_col_full' | '2_col_half' | '3_col_third' | '4_col_quarter'; // Predefined layouts
  banners: BannerConfig[]; // Array of banners for this row, matching the layout
  margin_included_in_banner?: boolean; // New field for horizontal margin control
}

// Update FixedContentFormData to use dynamic banner rows and carousel rows
export interface FixedContentFormData {
  banner_rows?: BannerRowConfig[]; // Array of banner rows
  carousel_rows?: CarouselRowConfig[]; // Array of carousel rows
  carrossel_1?: CarouselConfig; // Legacy support
  carrossel_2?: CarouselConfig; // Legacy support
}




