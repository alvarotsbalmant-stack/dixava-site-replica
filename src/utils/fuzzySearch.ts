
// Utilitário para busca fuzzy que ignora acentos, espaços e pequenos erros
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
};

export const calculateSimilarity = (str1: string, str2: string): number => {
  const norm1 = normalizeText(str1);
  const norm2 = normalizeText(str2);
  
  // Verifica se uma string contém a outra
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return 0.9;
  }
  
  // Algoritmo de distância de Levenshtein simplificado
  const len1 = norm1.length;
  const len2 = norm2.length;
  
  if (len1 === 0) return len2;
  if (len2 === 0) return len1;
  
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = norm1[i - 1] === norm2[j - 1] ? 0 : 1;
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

export const fuzzySearch = (query: string, text: string, threshold: number = 0.3): boolean => {
  const similarity = calculateSimilarity(query, text);
  return similarity >= threshold;
};

export const searchProducts = (products: any[], query: string) => {
  if (!query.trim()) return products;
  
  const normalizedQuery = normalizeText(query);
  
  return products.filter(product => {
    const searchFields = [
      product.name,
      product.description,
      product.platform,
      product.category
    ].filter(Boolean);
    
    return searchFields.some(field => 
      fuzzySearch(normalizedQuery, field, 0.3) ||
      normalizeText(field).includes(normalizedQuery)
    );
  });
};
