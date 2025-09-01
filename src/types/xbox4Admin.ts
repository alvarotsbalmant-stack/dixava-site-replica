
export interface ProductOverride {
  productId: string;
  imageUrl?: string;
  title?: string;
  badge?: { text: string; color: string };
}

export interface CardSettings {
  imageAspectRatio: string; // e.g., '16:9', '1:1', '3:4'
  imageObjectFit: string; // e.g., 'cover', 'contain', 'fill'
  cardLayout: string; // e.g., 'compact', 'detailed', 'minimal'
  showBadges: boolean;
  showPrices: boolean;
  hoverEffects: string; // e.g., 'scale', 'lift', 'glow'
}

export interface GridSettings {
  columns: number;
  gap: string;
  responsiveBreakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export interface Xbox4FeaturedProductsConfig {
  products: ProductOverride[];
  cardSettings: CardSettings;
  gridSettings: GridSettings;
}

export interface Xbox4NewsConfig {
  // Define structure for news and trailers
  newsItems: Array<{ id: string; title: string; imageUrl?: string; link: string }>;
  trailerItems: Array<{ id: string; title: string; videoUrl: string; thumbnailUrl?: string }>;
  layout: string; // e.g., 'carousel', 'grid'
}

export interface Xbox4OffersConfig {
  // Define structure for offers
  offers: Array<{ id: string; title: string; description: string; imageUrl?: string; link: string; discount?: string }>;
  layout: string;
}

export interface Xbox4BannersConfig {
  // Define structure for secondary banners
  banners: Array<{ id: string; imageUrl: string; link: string; altText?: string }>;
  layout: string;
}

export interface PageLayoutItemConfig {
  // New simple structure for xbox4_featured_products
  filter?: {
    tagIds?: string[];
    limit?: number;
  };
  products?: ProductOverride[];
  
  // Legacy support for advanced configurations
  news?: Xbox4NewsConfig;
  offers?: Xbox4OffersConfig;
  banners?: Xbox4BannersConfig;
}
