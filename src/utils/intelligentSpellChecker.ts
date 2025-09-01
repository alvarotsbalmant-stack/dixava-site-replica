// Sistema Inteligente de Correção com Tentativa-Erro
// Analisa produtos/tags do site para encontrar correspondências corretas

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  platform?: string;
}

interface SpellCheckResult {
  needsCorrection: boolean;
  suggestion: string | null;
  confidence: number;
  correctionType: string;
  matchedIn: string; // 'product_name' | 'description' | 'tags' | 'category'
}

// Cache para otimização de performance
const dictionaryCache = new Map<string, Set<string>>();
const correctionCache = new Map<string, SpellCheckResult>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos

// Função para extrair todas as palavras relevantes dos produtos
function extractProductDictionary(products: Product[]): Set<string> {
  const cacheKey = `dictionary_${products.length}`;
  
  if (dictionaryCache.has(cacheKey)) {
    return dictionaryCache.get(cacheKey)!;
  }

  const dictionary = new Set<string>();
  
  products.forEach(product => {
    // Extrair palavras do nome do produto
    const nameWords = product.name.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 3);
    
    nameWords.forEach(word => dictionary.add(word));
    
    // Extrair palavras da descrição
    if (product.description) {
      const descWords = product.description.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 3);
      
      descWords.forEach(word => dictionary.add(word));
    }
    
    // Extrair palavras das tags
    if (product.tags) {
      product.tags.forEach(tag => {
        const tagWords = tag.toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length >= 3);
        
        tagWords.forEach(word => dictionary.add(word));
      });
    }
    
    // Extrair palavras da categoria e plataforma
    if (product.category) {
      const categoryWords = product.category.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 3);
      
      categoryWords.forEach(word => dictionary.add(word));
    }
    
    if (product.platform) {
      const platformWords = product.platform.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 3);
      
      platformWords.forEach(word => dictionary.add(word));
    }
  });
  
  // Cache do dicionário
  dictionaryCache.set(cacheKey, dictionary);
  setTimeout(() => dictionaryCache.delete(cacheKey), CACHE_EXPIRY);
  
  return dictionary;
}

// Algoritmo de distância de Levenshtein otimizado
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator   // substitution
      );
    }
  }
  
  return matrix[b.length][a.length];
}

// Algoritmo de similaridade fonética (Soundex simplificado)
function soundexSimilarity(word1: string, word2: string): number {
  const soundex = (word: string): string => {
    const code = word.toLowerCase()
      .replace(/[hw]/g, '')
      .replace(/[bfpv]/g, '1')
      .replace(/[cgjkqsxz]/g, '2')
      .replace(/[dt]/g, '3')
      .replace(/[l]/g, '4')
      .replace(/[mn]/g, '5')
      .replace(/[r]/g, '6')
      .replace(/[^0-9]/g, '');
    
    return (word[0] + code + '000').substring(0, 4);
  };
  
  const code1 = soundex(word1);
  const code2 = soundex(word2);
  
  let matches = 0;
  for (let i = 0; i < 4; i++) {
    if (code1[i] === code2[i]) matches++;
  }
  
  return matches / 4;
}

// Algoritmo de subsequência comum mais longa
function longestCommonSubsequence(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}

// Sistema de tentativa-erro inteligente
function findBestMatch(query: string, dictionary: Set<string>): { word: string; score: number; type: string } | null {
  const queryLower = query.toLowerCase();
  let bestMatch = { word: '', score: 0, type: 'none' };
  
  // Timeout para garantir performance
  const startTime = Date.now();
  const TIMEOUT = 50; // 50ms máximo
  
  for (const word of dictionary) {
    if (Date.now() - startTime > TIMEOUT) break;
    
    // Skip palavras muito diferentes em tamanho
    if (Math.abs(word.length - queryLower.length) > 3) continue;
    
    // 1. Correspondência exata
    if (word === queryLower) {
      return { word, score: 1.0, type: 'exact' };
    }
    
    // 2. Correspondência de início
    if (word.startsWith(queryLower) || queryLower.startsWith(word)) {
      const score = Math.min(word.length, queryLower.length) / Math.max(word.length, queryLower.length);
      if (score > bestMatch.score) {
        bestMatch = { word, score, type: 'prefix' };
      }
      continue;
    }
    
    // 3. Distância de Levenshtein
    const distance = levenshteinDistance(queryLower, word);
    const maxLength = Math.max(queryLower.length, word.length);
    const levenScore = 1 - (distance / maxLength);
    
    if (levenScore > 0.6 && levenScore > bestMatch.score) {
      bestMatch = { word, score: levenScore, type: 'levenshtein' };
    }
    
    // 4. Similaridade fonética
    const phoneticScore = soundexSimilarity(queryLower, word);
    if (phoneticScore > 0.75 && phoneticScore > bestMatch.score) {
      bestMatch = { word, score: phoneticScore, type: 'phonetic' };
    }
    
    // 5. Subsequência comum
    const lcs = longestCommonSubsequence(queryLower, word);
    const lcsScore = lcs / Math.max(queryLower.length, word.length);
    if (lcsScore > 0.7 && lcsScore > bestMatch.score) {
      bestMatch = { word, score: lcsScore, type: 'subsequence' };
    }
  }
  
  return bestMatch.score > 0.5 ? bestMatch : null;
}

// Função principal de correção inteligente
export function getIntelligentSpellingSuggestion(query: string, products: Product[]): SpellCheckResult {
  if (!query || query.length < 2) {
    return {
      needsCorrection: false,
      suggestion: null,
      confidence: 0,
      correctionType: 'none',
      matchedIn: 'none'
    };
  }
  
  // Verificar cache primeiro
  const cacheKey = `${query}_${products.length}`;
  if (correctionCache.has(cacheKey)) {
    return correctionCache.get(cacheKey)!;
  }
  
  try {
    // Extrair dicionário dos produtos
    const dictionary = extractProductDictionary(products);
    
    // Dividir query em palavras
    const queryWords = query.toLowerCase().split(/\s+/);
    let bestSuggestion = '';
    let bestConfidence = 0;
    let bestType = 'none';
    
    // Tentar corrigir cada palavra
    for (let i = 0; i < queryWords.length; i++) {
      const word = queryWords[i];
      if (word.length < 3) continue;
      
      const match = findBestMatch(word, dictionary);
      if (match && match.score > bestConfidence) {
        // Construir sugestão substituindo a palavra
        const newWords = [...queryWords];
        newWords[i] = match.word;
        bestSuggestion = newWords.join(' ');
        bestConfidence = match.score;
        bestType = match.type;
      }
    }
    
    // Tentar corrigir a query inteira se não encontrou palavras individuais
    if (bestConfidence < 0.7 && queryWords.length === 1) {
      const match = findBestMatch(query, dictionary);
      if (match && match.score > bestConfidence) {
        bestSuggestion = match.word;
        bestConfidence = match.score;
        bestType = match.type;
      }
    }
    
    const result: SpellCheckResult = {
      needsCorrection: bestConfidence > 0.5 && bestSuggestion !== query.toLowerCase(),
      suggestion: bestConfidence > 0.5 ? bestSuggestion : null,
      confidence: bestConfidence,
      correctionType: bestType,
      matchedIn: 'product_analysis'
    };
    
    // Cache do resultado
    correctionCache.set(cacheKey, result);
    setTimeout(() => correctionCache.delete(cacheKey), CACHE_EXPIRY);
    
    return result;
    
  } catch (error) {
    console.warn('Erro no sistema de correção inteligente:', error);
    return {
      needsCorrection: false,
      suggestion: null,
      confidence: 0,
      correctionType: 'error',
      matchedIn: 'none'
    };
  }
}

// Função de auto-correção inteligente
export function autoCorrectIntelligent(query: string, products: Product[]): string {
  const result = getIntelligentSpellingSuggestion(query, products);
  
  // Auto-corrigir apenas com alta confiança
  if (result.needsCorrection && result.suggestion && result.confidence >= 0.8) {
    return result.suggestion;
  }
  
  return query;
}

