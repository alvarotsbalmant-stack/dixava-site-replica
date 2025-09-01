
import { Product } from '@/hooks/useProducts';
import { getProductsForSection } from './productFilters';

export const processSections = (sections: any[], products: Product[]) => {
  let consoles: Product[] = [];
  let games: Product[] = [];
  let accessories: Product[] = [];
  let deals: Product[] = [];
  let newsArticles: any[] = [];

  sections?.forEach((section: any) => {
    const config = section.section_config || {};
    
    switch (section.section_key) {
      case 'xbox4_consoles':
        consoles = getProductsForSection(products, config);
        break;
      case 'xbox4_games':
        games = getProductsForSection(products, config);
        break;
      case 'xbox4_accessories':
        accessories = getProductsForSection(products, config);
        break;
      case 'xbox4_deals':
        deals = getProductsForSection(products, config);
        break;
      case 'xbox4_news':
        newsArticles = config.articles || [];
        break;
    }
  });

  return {
    consoles,
    games,
    accessories,
    deals,
    newsArticles
  };
};
