
import { Product } from '@/hooks/useProducts';
import { ProductSection } from '@/hooks/useProductSections';

export interface SectionRendererProps {
  sectionKey: string;
  bannerData: {
    imageUrl: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    targetBlank: boolean;
  };
  products: Product[];
  sections: ProductSection[];
  productsLoading: boolean;
  sectionsLoading: boolean;
  onAddToCart: (product: any, size?: string, color?: string) => void;
}
