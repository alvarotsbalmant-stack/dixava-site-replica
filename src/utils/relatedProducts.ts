import { Product } from '@/hooks/useProducts/types';

/**
 * Interface para resultado de produtos relacionados
 */
export interface RelatedProductsResult {
  products: Product[];
  algorithm: 'tags' | 'fallback';
  tagMatches: { [productId: string]: number };
}

/**
 * Calcula produtos relacionados baseado em tags em comum
 * @param currentProduct - Produto atual da página
 * @param allProducts - Todos os produtos disponíveis (do cache)
 * @param maxResults - Número máximo de produtos a retornar (padrão: 8)
 * @returns Array com exatamente maxResults produtos relacionados
 */
export const getRelatedProducts = (
  currentProduct: Product,
  allProducts: Product[],
  maxResults: number = 8
): RelatedProductsResult => {
  console.log(`[getRelatedProducts] Calculando produtos relacionados para: ${currentProduct.name}`);
  console.log(`[getRelatedProducts] Total de produtos disponíveis: ${allProducts.length}`);
  
  // 1. Filtrar produtos válidos (excluir produto atual e produtos mestre)
  const validProducts = allProducts.filter(product => 
    product.id !== currentProduct.id && // Excluir produto atual
    product.product_type !== 'master' && // Excluir produtos mestre
    product.is_active !== false // Apenas produtos ativos
  );
  
  console.log(`[getRelatedProducts] Produtos válidos após filtros: ${validProducts.length}`);
  
  // 2. Se não há tags no produto atual, usar fallback
  if (!currentProduct.tags || currentProduct.tags.length === 0) {
    console.log(`[getRelatedProducts] Produto atual sem tags, usando fallback aleatório`);
    return {
      products: getRandomProducts(validProducts, maxResults),
      algorithm: 'fallback',
      tagMatches: {}
    };
  }
  
  // 3. Calcular coincidências de tags
  const currentTags = currentProduct.tags.map(tag => tag.id);
  const productsWithMatches: { product: Product; matches: number }[] = [];
  
  validProducts.forEach(product => {
    if (!product.tags || product.tags.length === 0) {
      return; // Pular produtos sem tags
    }
    
    const productTags = product.tags.map(tag => tag.id);
    const matches = currentTags.filter(tagId => productTags.includes(tagId)).length;
    
    if (matches > 0) {
      productsWithMatches.push({ product, matches });
    }
  });
  
  console.log(`[getRelatedProducts] Produtos com tags em comum: ${productsWithMatches.length}`);
  
  // 4. Ordenar por número de coincidências (maior primeiro)
  productsWithMatches.sort((a, b) => {
    if (a.matches !== b.matches) {
      return b.matches - a.matches; // Maior número de matches primeiro
    }
    // Se mesmo número de matches, ordem aleatória
    return Math.random() - 0.5;
  });
  
  // 5. Extrair produtos ordenados
  const relatedProducts = productsWithMatches.map(item => item.product);
  
  // 6. Completar com produtos aleatórios se necessário
  let finalProducts = relatedProducts.slice(0, maxResults);
  
  if (finalProducts.length < maxResults) {
    const usedIds = new Set([
      currentProduct.id,
      ...finalProducts.map(p => p.id)
    ]);
    
    const remainingProducts = validProducts.filter(p => !usedIds.has(p.id));
    const additionalProducts = getRandomProducts(remainingProducts, maxResults - finalProducts.length);
    
    finalProducts = [...finalProducts, ...additionalProducts];
    
    console.log(`[getRelatedProducts] Completado com ${additionalProducts.length} produtos aleatórios`);
  }
  
  // 7. Criar mapa de matches para debug
  const tagMatches: { [productId: string]: number } = {};
  productsWithMatches.forEach(item => {
    tagMatches[item.product.id] = item.matches;
  });
  
  console.log(`[getRelatedProducts] Resultado final: ${finalProducts.length} produtos`);
  console.log(`[getRelatedProducts] Distribuição de matches:`, 
    Object.values(tagMatches).reduce((acc, matches) => {
      acc[matches] = (acc[matches] || 0) + 1;
      return acc;
    }, {} as { [matches: number]: number })
  );
  
  return {
    products: finalProducts,
    algorithm: productsWithMatches.length > 0 ? 'tags' : 'fallback',
    tagMatches
  };
};

/**
 * Seleciona produtos aleatórios de uma lista
 * @param products - Lista de produtos
 * @param count - Número de produtos a selecionar
 * @returns Array com produtos selecionados aleatoriamente
 */
const getRandomProducts = (products: Product[], count: number): Product[] => {
  if (products.length <= count) {
    return [...products];
  }
  
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * Filtra produtos mestre de qualquer lista de produtos
 * Deve ser usado em todos os lugares onde produtos são exibidos (exceto admin)
 * @param products - Lista de produtos
 * @returns Lista sem produtos mestre
 */
export const filterMasterProducts = (products: Product[]): Product[] => {
  return products.filter(product => product.product_type !== 'master');
};

/**
 * Verifica se um produto é mestre
 * @param product - Produto a verificar
 * @returns true se for produto mestre
 */
export const isMasterProduct = (product: Product): boolean => {
  return product.product_type === 'master' || product.is_master_product === true;
};

/**
 * Debug: Analisa a distribuição de tags nos produtos
 * @param products - Lista de produtos
 */
export const analyzeTagDistribution = (products: Product[]): void => {
  const tagCounts: { [tagName: string]: number } = {};
  const productsWithTags = products.filter(p => p.tags && p.tags.length > 0);
  
  productsWithTags.forEach(product => {
    product.tags?.forEach(tag => {
      tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
    });
  });
  
  console.log('[analyzeTagDistribution] Análise de tags:');
  console.log(`- Produtos com tags: ${productsWithTags.length}/${products.length}`);
  console.log(`- Tags únicas: ${Object.keys(tagCounts).length}`);
  console.log('- Top 10 tags mais usadas:', 
    Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => `${tag}: ${count}`)
  );
};

