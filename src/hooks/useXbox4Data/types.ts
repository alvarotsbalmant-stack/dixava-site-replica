
import { Product } from '@/hooks/useProducts';

export interface Xbox4Section {
  id: string;
  section_key: string;
  title: string;
  sectionConfig: any;
  is_visible: boolean;
}

export interface Xbox4Data {
  consoles: Product[];
  games: Product[];
  accessories: Product[];
  deals: Product[];
  newsArticles: any[];
  loading: boolean;
  error: string | null;
}

export interface ProductOverride {
  productId: string;
  title?: string;
  imageUrl?: string;
  badge?: { text: string; color: string };
  isFeatured?: boolean;
  isOnSale?: boolean;
  originalPrice?: number;
  discount?: number;
}

export interface SectionConfig {
  products?: ProductOverride[];
  filter?: {
    tagIds?: string[];
    limit?: number;
  };
  articles?: any[];
}
