export interface PlayStationProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  imageUrl: string;
  category: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isExclusive?: boolean;
  isOnSale?: boolean;
}

export interface PlayStationSection {
  id: string;
  section_key: string;
  display_order: number;
  is_visible: boolean;
  content_config: any;
}

export interface PlayStationData {
  consoles: PlayStationProduct[];
  games: PlayStationProduct[];
  accessories: PlayStationProduct[];
  deals: PlayStationProduct[];
  newsArticles: any[];
  loading: boolean;
  error: string | null;
}

export interface ProductOverride {
  id: string;
  name?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  imageUrl?: string;
  category?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isExclusive?: boolean;
  isOnSale?: boolean;
}

export interface SectionConfig {
  title?: string;
  subtitle?: string;
  productIds?: string[];
  productOverrides?: ProductOverride[];
  maxProducts?: number;
  filterTags?: string[];
  sortBy?: 'price' | 'name' | 'rating' | 'featured';
  sortOrder?: 'asc' | 'desc';
}

