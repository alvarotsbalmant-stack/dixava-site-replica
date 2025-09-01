// Algoritmo de busca inteligente que separa resultados exatos de produtos relacionados
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
};

export const calculateExactMatch = (query: string, text: string): number => {
  const normalizedQuery = normalizeText(query);
  const normalizedText = normalizeText(text);
  
  // Correspondência exata completa
  if (normalizedText === normalizedQuery) {
    return 1.0;
  }
  
  // Correspondência exata de palavras
  const queryWords = normalizedQuery.split(' ');
  const textWords = normalizedText.split(' ');
  
  // Verifica se todas as palavras da query estão presentes na mesma ordem
  let queryIndex = 0;
  for (const textWord of textWords) {
    if (queryIndex < queryWords.length && textWord === queryWords[queryIndex]) {
      queryIndex++;
    }
  }
  
  if (queryIndex === queryWords.length) {
    return 0.95; // Correspondência exata de todas as palavras
  }
  
  // Verifica se o texto contém a query completa
  if (normalizedText.includes(normalizedQuery)) {
    return 0.9;
  }
  
  return 0;
};

export const calculatePartialMatch = (query: string, text: string): number => {
  const normalizedQuery = normalizeText(query);
  const normalizedText = normalizeText(text);
  
  const queryWords = normalizedQuery.split(' ');
  const textWords = normalizedText.split(' ');
  
  let matchedWords = 0;
  
  for (const queryWord of queryWords) {
    for (const textWord of textWords) {
      // Correspondência exata de palavra
      if (textWord === queryWord) {
        matchedWords += 1;
        break;
      }
      // Correspondência parcial (palavra contém a query word)
      if (textWord.includes(queryWord) && queryWord.length > 2) {
        matchedWords += 0.7;
        break;
      }
      // Correspondência fuzzy para palavras similares
      if (calculateLevenshteinSimilarity(queryWord, textWord) > 0.8 && queryWord.length > 3) {
        matchedWords += 0.5;
        break;
      }
    }
  }
  
  return matchedWords / queryWords.length;
};

export const calculateLevenshteinSimilarity = (str1: string, str2: string): number => {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,
        matrix[j][i - 1] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  const distance = matrix[len2][len1];
  const maxLen = Math.max(len1, len2);
  
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
};

export interface SearchResult {
  product: any;
  exactScore: number;
  partialScore: number;
  totalScore: number;
  isExactMatch: boolean;
  isRelated: boolean;
}

export const smartSearchProducts = (products: any[], query: string) => {
  if (!query.trim()) {
    // Filtrar produtos master mesmo quando não há query
    const filteredProducts = products.filter(product => product.product_type !== 'master');
    return { exactMatches: filteredProducts, relatedProducts: [] };
  }
  
  // Filtrar produtos master antes da busca
  const filteredProducts = products.filter(product => product.product_type !== 'master');
  
  const results: SearchResult[] = [];
  
  for (const product of filteredProducts) {
    const searchFields = [
      { field: product.name, weight: 1.0 },
      { field: product.description, weight: 0.7 },
      { field: product.platform, weight: 0.8 },
      { field: product.category, weight: 0.6 }
    ].filter(item => item.field);
    
    let maxExactScore = 0;
    let maxPartialScore = 0;
    
    for (const { field, weight } of searchFields) {
      const exactScore = calculateExactMatch(query, field) * weight;
      const partialScore = calculatePartialMatch(query, field) * weight;
      
      maxExactScore = Math.max(maxExactScore, exactScore);
      maxPartialScore = Math.max(maxPartialScore, partialScore);
    }
    
    const totalScore = maxExactScore + (maxPartialScore * 0.5);
    
    // Critérios para classificação
    const isExactMatch = maxExactScore >= 0.8;
    const isRelated = !isExactMatch && (maxPartialScore >= 0.4 || totalScore >= 0.3);
    
    if (isExactMatch || isRelated) {
      results.push({
        product,
        exactScore: maxExactScore,
        partialScore: maxPartialScore,
        totalScore,
        isExactMatch,
        isRelated
      });
    }
  }
  
  // Separar e ordenar resultados
  const exactMatches = results
    .filter(r => r.isExactMatch)
    .sort((a, b) => b.totalScore - a.totalScore)
    .map(r => r.product);
  
  const relatedProducts = results
    .filter(r => r.isRelated && !r.isExactMatch)
    .sort((a, b) => b.totalScore - a.totalScore)
    .map(r => r.product)
    .slice(0, 8); // Limitar produtos relacionados
  
  return { exactMatches, relatedProducts };
};

// Função para compatibilidade com o código existente
export const searchProducts = (products: any[], query: string) => {
  const { exactMatches } = smartSearchProducts(products, query);
  return exactMatches;
};

