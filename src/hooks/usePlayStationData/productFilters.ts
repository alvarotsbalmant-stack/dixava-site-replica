import { PlayStationProduct } from './types';

export const processProductsFromRows = (rows: any[]): PlayStationProduct[] => {
  if (!rows || !Array.isArray(rows)) return [];

  // Remover duplicatas baseado no ID
  const uniqueProducts = rows.reduce((acc, row) => {
    if (!acc.find(p => p.id === row.id)) {
      acc.push(row);
    }
    return acc;
  }, []);

  // Converter para formato PlayStation
  return uniqueProducts.map(row => ({
    id: row.id,
    name: row.name || 'Produto sem nome',
    price: parseFloat(row.price) || 0,
    originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
    discount: row.discount_percentage || undefined,
    rating: row.rating || 4.5,
    imageUrl: row.image || 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=750&fit=crop&crop=center',
    category: row.category || 'Produto',
    isNew: row.is_new || false,
    isFeatured: row.is_featured || false,
    isExclusive: row.tags?.includes('exclusivo') || false,
    isOnSale: row.discount_percentage > 0 || false
  }));
};

export const filterProductsByTags = (products: PlayStationProduct[], tags: string[]): PlayStationProduct[] => {
  if (!tags || tags.length === 0) return products;
  
  // Para PlayStation, vamos filtrar por tags relacionadas
  const playstationTags = tags.map(tag => tag.toLowerCase());
  
  return products.filter(product => {
    // Simular filtro por tags PlayStation (adaptável quando houver mais dados)
    const productName = product.name.toLowerCase();
    return playstationTags.some(tag => 
      productName.includes(tag) || 
      productName.includes('playstation') ||
      productName.includes('ps5') ||
      productName.includes('ps4') ||
      productName.includes('sony')
    );
  });
};

export const categorizeProducts = (products: PlayStationProduct[]) => {
  const consoles = products.filter(p => 
    p.category.toLowerCase().includes('console') ||
    p.name.toLowerCase().includes('playstation 5') ||
    p.name.toLowerCase().includes('ps5') ||
    p.name.toLowerCase().includes('ps4')
  );

  const games = products.filter(p => 
    p.category.toLowerCase().includes('jogo') ||
    p.category.toLowerCase().includes('game') ||
    (p.name.toLowerCase().includes('game') && !consoles.find(c => c.id === p.id))
  );

  const accessories = products.filter(p => 
    p.category.toLowerCase().includes('acessório') ||
    p.category.toLowerCase().includes('accessory') ||
    p.name.toLowerCase().includes('controle') ||
    p.name.toLowerCase().includes('headset') ||
    p.name.toLowerCase().includes('dualsense') ||
    (!consoles.find(c => c.id === p.id) && !games.find(g => g.id === p.id))
  );

  const deals = products.filter(p => p.isOnSale || p.discount > 0);

  return { consoles, games, accessories, deals };
};

