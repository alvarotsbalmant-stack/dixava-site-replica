import { PlayStationSection, PlayStationProduct, SectionConfig } from './types';
import { categorizeProducts, filterProductsByTags } from './productFilters';

export const processSections = (sections: PlayStationSection[], products: PlayStationProduct[]) => {
  // Categorizar produtos
  const { consoles, games, accessories, deals } = categorizeProducts(products);

  // Dados padrão caso não haja seções configuradas
  let finalConsoles = consoles.length > 0 ? consoles : getFallbackConsoles();
  let finalGames = games.length > 0 ? games : getFallbackGames();
  let finalAccessories = accessories.length > 0 ? accessories : getFallbackAccessories();
  let finalDeals = deals.length > 0 ? deals : getFallbackDeals();

  // Processar seções específicas se existirem
  sections.forEach(section => {
    const config = section.content_config as SectionConfig;
    
    switch (section.section_key) {
      case 'ps-hero':
        // Seção hero - pode influenciar produtos em destaque
        if (config?.productIds) {
          const heroProducts = products.filter(p => config.productIds.includes(p.id));
          heroProducts.forEach(p => p.isFeatured = true);
        }
        break;
        
      case 'ps-exclusives':
        // Jogos exclusivos
        if (config?.filterTags) {
          const exclusiveGames = filterProductsByTags(products, config.filterTags);
          if (exclusiveGames.length > 0) {
            finalGames = exclusiveGames.map(g => ({ ...g, isExclusive: true }));
          }
        }
        break;
        
      case 'ps-news':
        // Seção de notícias - não afeta produtos
        break;
        
      default:
        // Outras seções personalizadas
        break;
    }
  });

  return {
    consoles: finalConsoles.slice(0, 6), // Limitar quantidade
    games: finalGames.slice(0, 8),
    accessories: finalAccessories.slice(0, 6),
    deals: finalDeals.slice(0, 4),
    newsArticles: getFallbackNews()
  };
};

// Dados fallback para garantir que sempre há conteúdo
const getFallbackConsoles = (): PlayStationProduct[] => [
  {
    id: 'ps5-console-fallback',
    name: 'PlayStation 5',
    price: 4199.99,
    originalPrice: 4699.99,
    discount: 11,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=750&fit=crop&crop=center',
    category: 'Console',
    isFeatured: true
  },
  {
    id: 'ps5-digital-fallback',
    name: 'PlayStation 5 Digital Edition',
    price: 3599.99,
    originalPrice: 3999.99,
    discount: 10,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=750&fit=crop&crop=center',
    category: 'Console',
    isNew: true
  }
];

const getFallbackGames = (): PlayStationProduct[] => [
  {
    id: 'spider-man-2-fallback',
    name: 'Marvel\'s Spider-Man 2',
    price: 299.99,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=750&fit=crop&crop=center',
    category: 'Jogo',
    isExclusive: true,
    isFeatured: true
  },
  {
    id: 'god-of-war-fallback',
    name: 'God of War Ragnarök',
    price: 249.99,
    originalPrice: 299.99,
    discount: 17,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=750&fit=crop&crop=center',
    category: 'Jogo',
    isExclusive: true,
    isOnSale: true
  }
];

const getFallbackAccessories = (): PlayStationProduct[] => [
  {
    id: 'dualsense-fallback',
    name: 'Controle DualSense',
    price: 449.99,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&h=750&fit=crop&crop=center',
    category: 'Acessório',
    isNew: true
  },
  {
    id: 'pulse-3d-fallback',
    name: 'Headset PULSE 3D',
    price: 599.99,
    originalPrice: 699.99,
    discount: 14,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=750&fit=crop&crop=center',
    category: 'Acessório',
    isOnSale: true
  }
];

const getFallbackDeals = (): PlayStationProduct[] => [
  {
    id: 'ps5-deal-fallback',
    name: 'PlayStation 5 + Spider-Man 2',
    price: 4399.99,
    originalPrice: 4999.99,
    discount: 12,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=750&fit=crop&crop=center',
    category: 'Bundle',
    isOnSale: true,
    isFeatured: true
  }
];

const getFallbackNews = () => [
  {
    id: 1,
    type: 'news',
    title: 'PlayStation 5: Novos Jogos Exclusivos',
    description: 'Confira os lançamentos exclusivos que chegam ao PS5 este mês.',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=400&fit=crop&crop=center',
    date: '2 dias atrás'
  },
  {
    id: 2,
    type: 'trailer',
    title: 'Spider-Man 2: Novo Trailer',
    description: 'Assista ao novo trailer de gameplay de Marvel\'s Spider-Man 2.',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&crop=center',
    date: '1 semana atrás'
  }
];

