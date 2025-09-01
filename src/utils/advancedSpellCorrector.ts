// Algoritmo Completo e Robusto de Correção Ortográfica
// Detecta erros complexos como "spoder" → "spider"

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: { id: string; name: string; }[];
  platform?: string;
}

interface CorrectionResult {
  needsCorrection: boolean;
  suggestion: string | null;
  confidence: number;
  correctionType: string;
  matchedIn: string;
  algorithm: string;
}

// Cache global para otimização
const globalCache = new Map<string, CorrectionResult>();
const dictionaryCache = new Map<string, Set<string>>();
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutos

// Dicionário base expandido para games
const GAME_DICTIONARY = new Set([
  'spider', 'spiderman', 'spider-man', 'resident', 'evil', 'fifa', 'call', 'duty',
  'god', 'war', 'playstation', 'xbox', 'nintendo', 'switch', 'mario', 'zelda',
  'pokemon', 'sonic', 'crash', 'bandicoot', 'final', 'fantasy', 'street',
  'fighter', 'mortal', 'kombat', 'tekken', 'assassin', 'creed', 'grand',
  'theft', 'auto', 'minecraft', 'fortnite', 'apex', 'legends', 'valorant',
  'overwatch', 'league', 'legends', 'dota', 'counter', 'strike', 'cyberpunk',
  'witcher', 'elder', 'scrolls', 'fallout', 'bioshock', 'borderlands',
  'destiny', 'halo', 'gears', 'forza', 'horizon', 'uncharted', 'last',
  'tomb', 'raider', 'metal', 'gear', 'solid', 'silent', 'hill', 'dark',
  'souls', 'bloodborne', 'sekiro', 'elden', 'ring', 'monster', 'hunter',
  'dragon', 'ball', 'naruto', 'one', 'piece', 'attack', 'titan'
]);

// Função para extrair dicionário completo dos produtos
function buildCompleteDictionary(products: Product[]): Set<string> {
  const cacheKey = `complete_dict_${products.length}`;
  
  if (dictionaryCache.has(cacheKey)) {
    return dictionaryCache.get(cacheKey)!;
  }

  const dictionary = new Set<string>(GAME_DICTIONARY);
  
  products.forEach(product => {
    // Extrair todas as palavras possíveis
    const tagNames = (product.tags || []).map(tag => tag.name);
    const allText = [
      product.name,
      product.description || '',
      product.category || '',
      product.platform || '',
      ...tagNames
    ].join(' ');
    
    // Processar texto para extrair palavras
    const words = allText.toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/[\s-]+/)
      .filter(word => word.length >= 3 && word.length <= 20);
    
    words.forEach(word => {
      dictionary.add(word);
      
      // Adicionar variações comuns
      if (word.includes('man')) {
        dictionary.add(word.replace('man', '-man'));
      }
      if (word.includes('-')) {
        dictionary.add(word.replace('-', ''));
        dictionary.add(word.replace('-', ' '));
      }
    });
  });
  
  // Cache do dicionário
  dictionaryCache.set(cacheKey, dictionary);
  setTimeout(() => dictionaryCache.delete(cacheKey), CACHE_EXPIRY);
  
  return dictionary;
}

// Algoritmo de Distância de Damerau-Levenshtein (mais avançado)
function damerauLevenshteinDistance(source: string, target: string): number {
  const sourceLength = source.length;
  const targetLength = target.length;
  
  if (sourceLength === 0) return targetLength;
  if (targetLength === 0) return sourceLength;
  
  const maxDistance = sourceLength + targetLength;
  const H: number[][] = [];
  
  // Inicializar matriz
  for (let i = 0; i <= sourceLength + 1; i++) {
    H[i] = [];
    for (let j = 0; j <= targetLength + 1; j++) {
      H[i][j] = maxDistance;
    }
  }
  
  H[0][0] = maxDistance;
  for (let i = 0; i <= sourceLength; i++) {
    H[i + 1][0] = maxDistance;
    H[i + 1][1] = i;
  }
  for (let j = 0; j <= targetLength; j++) {
    H[0][j + 1] = maxDistance;
    H[1][j + 1] = j;
  }
  
  const lastRow: { [key: string]: number } = {};
  
  for (let i = 1; i <= sourceLength; i++) {
    let lastMatchCol = 0;
    for (let j = 1; j <= targetLength; j++) {
      const i1 = lastRow[target[j - 1]] || 0;
      const j1 = lastMatchCol;
      let cost = 1;
      if (source[i - 1] === target[j - 1]) {
        cost = 0;
        lastMatchCol = j;
      }
      
      H[i + 1][j + 1] = Math.min(
        H[i][j] + cost,           // substitution
        H[i + 1][j] + 1,          // insertion
        H[i][j + 1] + 1,          // deletion
        H[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1) // transposition
      );
    }
    lastRow[source[i - 1]] = i;
  }
  
  return H[sourceLength + 1][targetLength + 1];
}

// Algoritmo de similaridade fonética avançado
function advancedPhoneticSimilarity(word1: string, word2: string): number {
  // Mapeamento fonético mais completo
  const phoneticMap: { [key: string]: string } = {
    'ph': 'f', 'gh': 'f', 'ck': 'k', 'qu': 'kw',
    'x': 'ks', 'z': 's', 'c': 'k', 'y': 'i',
    'oo': 'u', 'ee': 'i', 'ea': 'i', 'ou': 'u',
    'tion': 'shun', 'sion': 'shun', 'ch': 'sh'
  };
  
  const normalize = (word: string): string => {
    let normalized = word.toLowerCase();
    
    // Aplicar mapeamentos fonéticos
    Object.entries(phoneticMap).forEach(([pattern, replacement]) => {
      normalized = normalized.replace(new RegExp(pattern, 'g'), replacement);
    });
    
    // Remover vogais duplicadas
    normalized = normalized.replace(/([aeiou])\1+/g, '$1');
    
    // Remover consoantes duplicadas (exceto algumas)
    normalized = normalized.replace(/([bcdfghjklmnpqrstvwxz])\1+/g, '$1');
    
    return normalized;
  };
  
  const norm1 = normalize(word1);
  const norm2 = normalize(word2);
  
  if (norm1 === norm2) return 1.0;
  
  // Calcular similaridade baseada na distância
  const distance = damerauLevenshteinDistance(norm1, norm2);
  const maxLength = Math.max(norm1.length, norm2.length);
  
  return Math.max(0, 1 - (distance / maxLength));
}

// Algoritmo de N-gramas para detectar padrões
function nGramSimilarity(word1: string, word2: string, n: number = 2): number {
  const getNGrams = (word: string, size: number): Set<string> => {
    const grams = new Set<string>();
    const paddedWord = '#'.repeat(size - 1) + word + '#'.repeat(size - 1);
    
    for (let i = 0; i <= paddedWord.length - size; i++) {
      grams.add(paddedWord.substring(i, i + size));
    }
    
    return grams;
  };
  
  const grams1 = getNGrams(word1.toLowerCase(), n);
  const grams2 = getNGrams(word2.toLowerCase(), n);
  
  const intersection = new Set([...grams1].filter(x => grams2.has(x)));
  const union = new Set([...grams1, ...grams2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

// Algoritmo de detecção de transposições
function transpositionSimilarity(word1: string, word2: string): number {
  if (Math.abs(word1.length - word2.length) > 2) return 0;
  
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();
  
  // Verificar transposições adjacentes
  for (let i = 0; i < w1.length - 1; i++) {
    const transposed = w1.substring(0, i) + w1[i + 1] + w1[i] + w1.substring(i + 2);
    if (transposed === w2) return 0.95;
  }
  
  // Verificar transposições não-adjacentes
  for (let i = 0; i < w1.length; i++) {
    for (let j = i + 2; j < w1.length; j++) {
      const chars = w1.split('');
      [chars[i], chars[j]] = [chars[j], chars[i]];
      const transposed = chars.join('');
      if (transposed === w2) return 0.85;
    }
  }
  
  return 0;
}

// Algoritmo de padrões de erro comuns
function commonErrorPatterns(word1: string, word2: string): number {
  const patterns = [
    // Substituições comuns
    { from: 'o', to: 'a', score: 0.9 },
    { from: 'e', to: 'i', score: 0.9 },
    { from: 'i', to: 'e', score: 0.9 },
    { from: 'a', to: 'o', score: 0.9 },
    { from: 'u', to: 'o', score: 0.9 },
    { from: 'c', to: 'k', score: 0.95 },
    { from: 'k', to: 'c', score: 0.95 },
    { from: 's', to: 'z', score: 0.9 },
    { from: 'z', to: 's', score: 0.9 },
    { from: 'f', to: 'ph', score: 0.95 },
    { from: 'ph', to: 'f', score: 0.95 }
  ];
  
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();
  
  for (const pattern of patterns) {
    const modified = w1.replace(new RegExp(pattern.from, 'g'), pattern.to);
    if (modified === w2) return pattern.score;
    
    const reverseModified = w2.replace(new RegExp(pattern.from, 'g'), pattern.to);
    if (reverseModified === w1) return pattern.score;
  }
  
  return 0;
}

// Função principal de busca da melhor correspondência
function findBestCorrection(query: string, dictionary: Set<string>): CorrectionResult {
  const queryLower = query.toLowerCase().trim();
  
  if (queryLower.length < 2) {
    return {
      needsCorrection: false,
      suggestion: null,
      confidence: 0,
      correctionType: 'too_short',
      matchedIn: 'none',
      algorithm: 'none'
    };
  }
  
  let bestMatch = {
    word: '',
    score: 0,
    algorithm: 'none',
    type: 'none'
  };
  
  const startTime = Date.now();
  const TIMEOUT = 100; // 100ms máximo
  
  for (const word of dictionary) {
    if (Date.now() - startTime > TIMEOUT) break;
    
    // Skip palavras muito diferentes
    if (Math.abs(word.length - queryLower.length) > 3) continue;
    
    // 1. Correspondência exata
    if (word === queryLower) {
      return {
        needsCorrection: false,
        suggestion: word,
        confidence: 1.0,
        correctionType: 'exact',
        matchedIn: 'dictionary',
        algorithm: 'exact_match'
      };
    }
    
    // 2. Verificar transposições
    const transScore = transpositionSimilarity(queryLower, word);
    if (transScore > bestMatch.score) {
      bestMatch = { word, score: transScore, algorithm: 'transposition', type: 'transposition' };
    }
    
    // 3. Padrões de erro comuns
    const patternScore = commonErrorPatterns(queryLower, word);
    if (patternScore > bestMatch.score) {
      bestMatch = { word, score: patternScore, algorithm: 'common_patterns', type: 'pattern' };
    }
    
    // 4. Similaridade fonética avançada
    const phoneticScore = advancedPhoneticSimilarity(queryLower, word);
    if (phoneticScore > 0.8 && phoneticScore > bestMatch.score) {
      bestMatch = { word, score: phoneticScore, algorithm: 'phonetic', type: 'phonetic' };
    }
    
    // 5. N-gramas (bi-gramas e tri-gramas)
    const bigram = nGramSimilarity(queryLower, word, 2);
    const trigram = nGramSimilarity(queryLower, word, 3);
    const ngramScore = (bigram * 0.6 + trigram * 0.4);
    
    if (ngramScore > 0.7 && ngramScore > bestMatch.score) {
      bestMatch = { word, score: ngramScore, algorithm: 'ngram', type: 'ngram' };
    }
    
    // 6. Damerau-Levenshtein
    const distance = damerauLevenshteinDistance(queryLower, word);
    const maxLength = Math.max(queryLower.length, word.length);
    const dlScore = 1 - (distance / maxLength);
    
    if (dlScore > 0.6 && dlScore > bestMatch.score) {
      bestMatch = { word, score: dlScore, algorithm: 'damerau_levenshtein', type: 'edit_distance' };
    }
  }
  
  // Determinar se precisa de correção
  const needsCorrection = bestMatch.score >= 0.6 && bestMatch.word !== queryLower;
  
  return {
    needsCorrection,
    suggestion: needsCorrection ? bestMatch.word : null,
    confidence: bestMatch.score,
    correctionType: bestMatch.type,
    matchedIn: 'dictionary',
    algorithm: bestMatch.algorithm
  };
}

// Função principal exportada
export function getAdvancedSpellCorrection(query: string, products: Product[]): CorrectionResult {
  if (!query || query.trim().length === 0) {
    return {
      needsCorrection: false,
      suggestion: null,
      confidence: 0,
      correctionType: 'empty',
      matchedIn: 'none',
      algorithm: 'none'
    };
  }
  
  const cacheKey = `advanced_${query.toLowerCase()}_${products.length}`;
  
  // Verificar cache
  if (globalCache.has(cacheKey)) {
    return globalCache.get(cacheKey)!;
  }
  
  try {
    // Construir dicionário completo
    const dictionary = buildCompleteDictionary(products);
    
    // Processar query (pode ter múltiplas palavras)
    const words = query.toLowerCase().trim().split(/\s+/);
    
    if (words.length === 1) {
      // Palavra única
      const result = findBestCorrection(words[0], dictionary);
      
      // Cache do resultado
      globalCache.set(cacheKey, result);
      setTimeout(() => globalCache.delete(cacheKey), CACHE_EXPIRY);
      
      return result;
    } else {
      // Múltiplas palavras - corrigir a palavra com menor confiança
      let bestCorrection: CorrectionResult = {
        needsCorrection: false,
        suggestion: null,
        confidence: 0,
        correctionType: 'none',
        matchedIn: 'none',
        algorithm: 'none'
      };
      
      let correctedWords = [...words];
      
      for (let i = 0; i < words.length; i++) {
        const wordResult = findBestCorrection(words[i], dictionary);
        
        if (wordResult.needsCorrection && wordResult.confidence > bestCorrection.confidence) {
          bestCorrection = wordResult;
          correctedWords[i] = wordResult.suggestion || words[i];
        }
      }
      
      if (bestCorrection.needsCorrection) {
        const finalResult: CorrectionResult = {
          needsCorrection: true,
          suggestion: correctedWords.join(' '),
          confidence: bestCorrection.confidence,
          correctionType: bestCorrection.correctionType,
          matchedIn: bestCorrection.matchedIn,
          algorithm: bestCorrection.algorithm
        };
        
        // Cache do resultado
        globalCache.set(cacheKey, finalResult);
        setTimeout(() => globalCache.delete(cacheKey), CACHE_EXPIRY);
        
        return finalResult;
      }
      
      return bestCorrection;
    }
    
  } catch (error) {
    console.warn('Erro no corretor ortográfico avançado:', error);
    return {
      needsCorrection: false,
      suggestion: null,
      confidence: 0,
      correctionType: 'error',
      matchedIn: 'none',
      algorithm: 'error'
    };
  }
}

// Função de auto-correção
export function autoCorrectAdvanced(query: string, products: Product[]): string {
  const result = getAdvancedSpellCorrection(query, products);
  
  // Auto-corrigir com alta confiança
  if (result.needsCorrection && result.suggestion && result.confidence >= 0.8) {
    return result.suggestion;
  }
  
  return query;
}

