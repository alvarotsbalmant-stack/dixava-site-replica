import { z } from 'zod';

// Enums para tipos de seção
export const SectionType = {
  BANNER_HERO: 'banner_hero',
  PRODUCT_CAROUSEL: 'product_carousel', 
  CATEGORY_GRID: 'category_grid',
  PROMOTIONAL_BANNER: 'promotional_banner',
  NEWS_SECTION: 'news_section',
  CUSTOM_HTML: 'custom_html'
} as const;

export type SectionTypeValue = typeof SectionType[keyof typeof SectionType];

// Enums para visibilidade
export const VisibilityType = {
  DESKTOP_ONLY: 'desktop_only',
  MOBILE_ONLY: 'mobile_only',
  BOTH: 'both',
  HIDDEN: 'hidden'
} as const;

export type VisibilityTypeValue = typeof VisibilityType[keyof typeof VisibilityType];

// Enums para posição de imagem
export const ImagePosition = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom'
} as const;

export type ImagePositionValue = typeof ImagePosition[keyof typeof ImagePosition];

// Schema base para validação
export const BaseSectionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    SectionType.BANNER_HERO,
    SectionType.PRODUCT_CAROUSEL,
    SectionType.CATEGORY_GRID,
    SectionType.PROMOTIONAL_BANNER,
    SectionType.NEWS_SECTION,
    SectionType.CUSTOM_HTML
  ]),
  title: z.string().min(1, 'Título é obrigatório'),
  order: z.number().int().min(0),
  isVisible: z.boolean(),
  visibility: z.enum([
    VisibilityType.DESKTOP_ONLY,
    VisibilityType.MOBILE_ONLY,
    VisibilityType.BOTH,
    VisibilityType.HIDDEN
  ]),
  createdAt: z.date(),
  updatedAt: z.date(),
  config: z.record(z.any()) // Será refinado por tipo específico
});

// Interface base para seções
export interface BaseSection {
  id: string;
  type: SectionTypeValue;
  title: string;
  order: number;
  isVisible: boolean;
  visibility: VisibilityTypeValue;
  createdAt: Date;
  updatedAt: Date;
  config: Record<string, any>;
}

// Configurações específicas por tipo de seção
export interface BannerHeroConfig {
  imageUrl: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  overlayOpacity: number;
  textPosition: ImagePositionValue;
  enableHoverAnimation: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export interface ProductCarouselConfig {
  title: string;
  subtitle?: string;
  productSelectionType: 'manual' | 'by_tag' | 'by_category';
  productIds?: string[];
  tagIds?: string[];
  categoryIds?: string[];
  maxProducts: number;
  showPrice: boolean;
  showRating: boolean;
  enableAutoplay: boolean;
  autoplayInterval: number;
  itemsPerView: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
}

export interface CategoryGridConfig {
  title: string;
  subtitle?: string;
  categories: Array<{
    id: string;
    name: string;
    imageUrl: string;
    url: string;
  }>;
  gridColumns: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  enableHoverEffects: boolean;
}

export interface PromotionalBannerConfig {
  imageUrl: string;
  imageAlt: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  bannerType: 'full_width' | 'half_width' | 'third_width';
  enableHoverAnimation: boolean;
  backgroundColor?: string;
}

export interface NewsSectionConfig {
  title: string;
  subtitle?: string;
  newsSelectionType: 'latest' | 'manual' | 'by_tag';
  newsIds?: string[];
  tagIds?: string[];
  maxNews: number;
  showDate: boolean;
  showAuthor: boolean;
  showExcerpt: boolean;
  layoutType: 'grid' | 'list' | 'carousel';
}

export interface CustomHtmlConfig {
  title: string;
  htmlContent: string;
  cssStyles?: string;
  enableSanitization: boolean;
}

// Union type para todas as configurações
export type SectionConfig = 
  | BannerHeroConfig
  | ProductCarouselConfig
  | CategoryGridConfig
  | PromotionalBannerConfig
  | NewsSectionConfig
  | CustomHtmlConfig;

// Interfaces específicas para cada tipo de seção
export interface BannerHeroSection extends BaseSection {
  type: typeof SectionType.BANNER_HERO;
  config: BannerHeroConfig;
}

export interface ProductCarouselSection extends BaseSection {
  type: typeof SectionType.PRODUCT_CAROUSEL;
  config: ProductCarouselConfig;
}

export interface CategoryGridSection extends BaseSection {
  type: typeof SectionType.CATEGORY_GRID;
  config: CategoryGridConfig;
}

export interface PromotionalBannerSection extends BaseSection {
  type: typeof SectionType.PROMOTIONAL_BANNER;
  config: PromotionalBannerConfig;
}

export interface NewsSectionSection extends BaseSection {
  type: typeof SectionType.NEWS_SECTION;
  config: NewsSectionConfig;
}

export interface CustomHtmlSection extends BaseSection {
  type: typeof SectionType.CUSTOM_HTML;
  config: CustomHtmlConfig;
}

// Union type para todas as seções
export type SpecialSection = 
  | BannerHeroSection
  | ProductCarouselSection
  | CategoryGridSection
  | PromotionalBannerSection
  | NewsSectionSection
  | CustomHtmlSection;

// Schemas de validação específicos
export const BannerHeroConfigSchema = z.object({
  imageUrl: z.string().url('URL da imagem inválida'),
  imageAlt: z.string().min(1, 'Texto alternativo é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().url().optional().or(z.literal('')),
  overlayOpacity: z.number().min(0).max(1),
  textPosition: z.enum([
    ImagePosition.LEFT,
    ImagePosition.CENTER,
    ImagePosition.RIGHT,
    ImagePosition.TOP,
    ImagePosition.BOTTOM
  ]),
  enableHoverAnimation: z.boolean(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional()
});

export const ProductCarouselConfigSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string().optional(),
  productSelectionType: z.enum(['manual', 'by_tag', 'by_category']),
  productIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  maxProducts: z.number().int().min(1).max(50),
  showPrice: z.boolean(),
  showRating: z.boolean(),
  enableAutoplay: z.boolean(),
  autoplayInterval: z.number().int().min(1000),
  itemsPerView: z.object({
    desktop: z.number().int().min(1).max(8),
    tablet: z.number().int().min(1).max(6),
    mobile: z.number().int().min(1).max(3)
  })
});

// Tipos para operações CRUD
export interface CreateSectionRequest {
  type: SectionTypeValue;
  title: string;
  config: Partial<SectionConfig>;
  order?: number;
  isVisible?: boolean;
  visibility?: VisibilityTypeValue;
  background_type?: string;
  background_color?: string;
  background_gradient?: string;
  background_image_url?: string;
  background_image_position?: string;
  background_value?: string;
  content_config?: any;
  display_order?: number;
  description?: string;
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
  is_active?: boolean;
}

export interface UpdateSectionRequest {
  id?: string;
  title?: string;
  config?: Partial<SectionConfig>;
  order?: number;
  isVisible?: boolean;
  visibility?: VisibilityTypeValue;
  is_active?: boolean;
  background_type?: string;
  background_color?: string;
  background_gradient?: string;
  background_image_url?: string;
  background_image_position?: string;
  background_value?: string;
  content_config?: any;
  display_order?: number;
  description?: string;
  [key: string]: any;
}

export interface SectionListResponse {
  sections: SpecialSection[];
  total: number;
  page: number;
  limit: number;
}

// Tipos para UI
export interface SectionFormProps {
  section?: SpecialSection;
  onSave: (section: CreateSectionRequest | UpdateSectionRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface SectionPreviewProps {
  section: SpecialSection;
  isEditing?: boolean;
}

export interface DragDropItem {
  id: string;
  order: number;
  type?: string;
  isVisible?: boolean;
}

// Tipos para hooks
export interface UseSectionsOptions {
  page?: number;
  limit?: number;
  type?: SectionTypeValue;
  visibility?: VisibilityTypeValue;
}

export interface UseSectionsReturn {
  sections: SpecialSection[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  refetch: () => Promise<void>;
  createSection: (data: CreateSectionRequest) => Promise<SpecialSection>;
  updateSection: (data: UpdateSectionRequest) => Promise<SpecialSection>;
  deleteSection: (id: string) => Promise<void>;
  reorderSections: (items: DragDropItem[]) => Promise<void>;
}

