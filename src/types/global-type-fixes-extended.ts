// Extended type fixes for build errors
export interface ImageUploadInputPropsExtended {
  label: string;
  currentImageUrl: string | undefined;
  onUploadComplete: (url: string) => void;
  folderName?: string;
  requiredWidth?: number;
  requiredHeight?: number;
  tolerancePercent?: number;
  value?: string;
  onChange?: (...event: any[]) => void;
  placeholder?: string;
  className?: string;
}

// Extend SpecialSection to include section_key
export interface SpecialSectionExtended {
  id: string;
  title: string;
  description?: string;
  background_type: string;
  background_color?: string;
  background_image_url?: string;
  background_gradient?: string;
  background_value?: string;
  background_image_position?: string;
  title_part1?: string;
  title_part2?: string;
  title_color1?: string;
  title_color2?: string;
  padding_top?: number;
  padding_bottom?: number;
  padding_left?: number;
  padding_right?: number;
  margin_top?: number;
  margin_bottom?: number;
  border_radius?: number;
  is_active?: boolean;
  display_order?: number;
  mobile_settings?: any;
  created_at: string;
  updated_at: string;
  content_config?: any;
  background_image_crop_data?: any;
  section_key?: string; // Add the missing property
}

// Product extensions
export interface ProductExtended {
  id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  stock?: number;
  tags?: any[];
  category?: string;
  originalPrice?: number;
  imageUrl?: string;
  image_url?: string;
  isFeatured?: boolean;
  is_featured?: boolean;
  isNew?: boolean;
  created_at: string;
  updated_at: string;
}

// Error state props
export interface ErrorStateProps {
  error?: string;
  message?: string;
  title?: string;
}

// Cart sheet props
export interface CartSheetProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  items?: any[];
  updateQuantity?: (productId: string, size: string, color: string, quantity: number) => void;
  getCartTotal?: () => number;
  getCartItemsCount?: () => number;
}

// Featured products section props
export interface FeaturedProductsSectionProps {
  products: any[];
  loading: boolean;
  onAddToCart: (product: any, size?: string, color?: string) => void;
  title: string;
  onCardClick?: (productId: string) => void;
}

// Homepage layout item
export interface HomepageLayoutItem {
  id: number;
  section_key: string;
  display_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

// Layout update payload
export interface LayoutUpdatePayload {
  id: number;
  display_order: number;
  is_visible: boolean;
}