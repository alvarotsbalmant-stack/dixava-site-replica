
export type ElementType = 
  | 'banner_full'
  | 'banner_medium' 
  | 'banner_small'
  | 'banner_product_highlight'
  | 'product_carousel'
  | 'text_block';

export type BackgroundType = 'color' | 'image' | 'gradient' | 'transparent';

export interface ElementFormData {
  title: string;
  subtitle: string;
  element_type: ElementType;
  image_url: string;
  link_url: string;
  link_text: string;
  display_order: number;
  is_active: boolean;
  background_type: BackgroundType;
  background_value: string;
  text_color: string;
  font_size: number;
  font_weight: number;
  text_align: string;
  padding_top: number;
  padding_bottom: number;
  padding_left: number;
  padding_right: number;
  margin_top: number;
  margin_bottom: number;
  border_width: number;
  border_color: string;
  border_radius: number;
  shadow_type: string;
  animation_type: string;
  custom_css: string;
}

// Helper function to convert database element to form data
export const convertElementToFormData = (element: any): Partial<ElementFormData> => {
  return {
    title: element.title || '',
    subtitle: element.subtitle || '',
    element_type: element.element_type as ElementType,
    image_url: element.image_url || '',
    link_url: element.link_url || '',
    link_text: element.link_text || '',
    display_order: element.display_order || 0,
    is_active: element.is_active !== false,
    background_type: (element.background_type as BackgroundType) || 'color',
    background_value: element.background_value || '',
    text_color: element.text_color || '#000000',
    font_size: element.font_size || 16,
    font_weight: element.font_weight || 400,
    text_align: element.text_align || 'left',
    padding_top: element.padding_top || 0,
    padding_bottom: element.padding_bottom || 0,
    padding_left: element.padding_left || 0,
    padding_right: element.padding_right || 0,
    margin_top: element.margin_top || 0,
    margin_bottom: element.margin_bottom || 0,
    border_width: element.border_width || 0,
    border_color: element.border_color || '#000000',
    border_radius: element.border_radius || 0,
    shadow_type: element.shadow_type || 'none',
    animation_type: element.animation_type || 'none',
    custom_css: element.custom_css || ''
  };
};
