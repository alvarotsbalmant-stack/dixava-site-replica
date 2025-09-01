// Sistema Avançado de Correção Ortográfica com Algoritmos Inteligentes
// Capaz de detectar erros complexos como "soider" → "spider"

import { normalizeText } from './smartSearch';

// Dicionário expandido com termos de jogos e variações
const EXPANDED_GAMING_DICTIONARY = [
  // Consoles
  'playstation', 'xbox', 'nintendo', 'switch', 'ps5', 'ps4', 'xbox series', 'xbox one',
  'steam deck', 'vita', 'psp', 'gameboy', 'wii', 'wiiu', 'gamecube', 'dreamcast',
  
  // Jogos populares
  'resident evil', 'call of duty', 'fifa', 'god of war', 'spider-man', 'spiderman', 'spider',
  'the last of us', 'grand theft auto', 'gta', 'minecraft', 'fortnite', 'valorant',
  'league of legends', 'counter strike', 'cs', 'cyberpunk', 'witcher', 'assassins creed',
  'mortal kombat', 'street fighter', 'tekken', 'final fantasy', 'zelda', 'mario',
  'sonic', 'crash bandicoot', 'uncharted', 'horizon', 'bloodborne', 'dark souls',
  'elden ring', 'sekiro', 'nioh', 'devil may cry', 'metal gear', 'silent hill',
  'tomb raider', 'far cry', 'watch dogs', 'rainbow six', 'battlefield', 'apex legends',
  'overwatch', 'destiny', 'borderlands', 'fallout', 'elder scrolls', 'skyrim',
  'mass effect', 'dragon age', 'bioshock', 'dishonored', 'prey', 'doom', 'wolfenstein',
  'halo', 'gears of war', 'forza', 'fable', 'ori', 'cuphead', 'hollow knight',
  'celeste', 'stardew valley', 'terraria', 'among us', 'fall guys', 'rocket league',
  
  // Gêneros e categorias
  'acao', 'aventura', 'rpg', 'fps', 'mmorpg', 'estrategia', 'simulacao', 'corrida',
  'esporte', 'luta', 'plataforma', 'puzzle', 'terror', 'survival', 'sandbox',
  'roguelike', 'metroidvania', 'battle royale', 'moba', 'rts', 'turn based',
  
  // Acessórios e hardware
  'controle', 'joystick', 'headset', 'fone', 'microfone', 'teclado', 'mouse',
  'mousepad', 'cadeira', 'monitor', 'webcam', 'cabo', 'carregador', 'bateria',
  'memoria', 'ssd', 'hd', 'placa de video', 'processador', 'cooler', 'fonte'
];

// Algoritmo Soundex para similaridade fonética
const soundex = (str: string): string => {
  const s = str.toLowerCase().replace(/[^a-z]/g, '');
  if (!s) return '0000';
  
  const firstLetter = s[0];
  let code = firstLetter;
  
  const mapping: Record<string, string> = {
    'b': '1', 'f': '1', 'p': '1', 'v': '1',
    'c': '2', 'g': '2', 'j': '2', 'k': '2', 'q': '2', 's': '2', 'x': '2', 'z': '2',
    'd': '3', 't': '3',
    'l': '4',
    'm': '5', 'n': '5',
    'r': '6'
  };
  
  for (let i = 1; i < s.length; i++) {
    const char = s[i];
    const mapped = mapping[char] || '0';
    
    if (mapped !== '0' && mapped !== code[code.length - 1]) {
      code += mapped;
    }
  }
  
  return (code + '0000').substring(0, 4);
};

// Distância de Levenshtein otimizada
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // insertion
        matrix[j - 1][i] + 1,     // deletion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }
  
  return matrix[b.length][a.length];
};

// Similaridade baseada em Levenshtein (0-1)
const calculateSimilarity = (a: string, b: string): number => {
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(a, b);
  return 1 - (distance / maxLength);
};

// Algoritmo de subsequência comum mais longa
const longestCommonSubsequence = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp[m][n];
};

// Similaridade baseada em LCS
const lcssimilarity = (a: string, b: string): number => {
  const lcs = longestCommonSubsequence(a, b);
  const maxLength = Math.max(a.length, b.length);
  return maxLength > 0 ? lcs / maxLength : 0;
};

// Algoritmo de n-gramas para similaridade
const getNGrams = (str: string, n: number): Set<string> => {
  const ngrams = new Set<string>();
  for (let i = 0; i <= str.length - n; i++) {
    ngrams.add(str.substring(i, i + n));
  }
  return ngrams;
};

const ngramSimilarity = (a: string, b: string, n: number = 2): number => {
  const ngramsA = getNGrams(a, n);
  const ngramsB = getNGrams(b, n);
  
  const intersection = new Set([...ngramsA].filter(x => ngramsB.has(x)));
  const union = new Set([...ngramsA, ...ngramsB]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
};

// Padrões de erro comuns específicos
const ERROR_PATTERNS: Array<{pattern: RegExp, replacement: string}> = [
  // Troca de letras comuns
  { pattern: /oi/g, replacement: 'oi|io' },
  { pattern: /ei/g, replacement: 'ei|ie' },
  { pattern: /ou/g, replacement: 'ou|uo' },
  { pattern: /ph/g, replacement: 'ph|f' },
  { pattern: /ck/g, replacement: 'ck|k|c' },
  { pattern: /x/g, replacement: 'x|ks|z|s' },
  { pattern: /w/g, replacement: 'w|v|u' },
  { pattern: /y/g, replacement: 'y|i' },
  
  // Duplicação de letras
  { pattern: /(.)\1/g, replacement: '$1|$1$1' },
  
  // Omissão de letras
  { pattern: /(.)/g, replacement: '$1|' }
];

// Gerar variações inteligentes de um termo
const generateIntelligentVariations = (term: string): string[] => {
  const variations = new Set<string>();
  const normalized = normalizeText(term);
  
  // Variações básicas
  variations.add(normalized);
  
  // Omissão de caracteres (especialmente no final)
  for (let i = 1; i < normalized.length; i++) {
    variations.add(normalized.substring(0, i) + normalized.substring(i + 1));
  }
  
  // Troca de caracteres adjacentes
  for (let i = 0; i < normalized.length - 1; i++) {
    const chars = normalized.split('');
    [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
    variations.add(chars.join(''));
  }
  
  // Substituições fonéticas comuns
  const phoneticSubs: Record<string, string[]> = {
    'c': ['k', 's', 'ck'],
    'k': ['c', 'ck'],
    's': ['c', 'z'],
    'z': ['s'],
    'f': ['ph', 'v'],
    'v': ['f', 'w'],
    'w': ['v', 'u'],
    'i': ['y', 'e'],
    'y': ['i'],
    'o': ['u', 'a'],
    'u': ['o', 'w'],
    'a': ['e', 'o'],
    'e': ['a', 'i']
  };
  
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const subs = phoneticSubs[char] || [];
    
    for (const sub of subs) {
      const variation = normalized.substring(0, i) + sub + normalized.substring(i + 1);
      variations.add(variation);
    }
  }
  
  // Inserção de caracteres comuns
  const commonInserts = ['h', 'e', 'i', 'a', 'o', 'u'];
  for (let i = 0; i <= normalized.length; i++) {
    for (const insert of commonInserts) {
      const variation = normalized.substring(0, i) + insert + normalized.substring(i);
      if (variation.length <= normalized.length + 2) {
        variations.add(variation);
      }
    }
  }
  
  return Array.from(variations);
};

// Sistema de pontuação avançado
const calculateAdvancedScore = (query: string, candidate: string): number => {
  const normalizedQuery = normalizeText(query);
  const normalizedCandidate = normalizeText(candidate);
  
  // Múltiplos algoritmos de similaridade
  const levenshteinScore = calculateSimilarity(normalizedQuery, normalizedCandidate);
  const lcsScore = lcssimilarity(normalizedQuery, normalizedCandidate);
  const bigramScore = ngramSimilarity(normalizedQuery, normalizedCandidate, 2);
  const trigramScore = ngramSimilarity(normalizedQuery, normalizedCandidate, 3);
  
  // Similaridade fonética
  const soundexScore = soundex(normalizedQuery) === soundex(normalizedCandidate) ? 0.3 : 0;
  
  // Bonus para correspondência de início
  const startsWithBonus = normalizedCandidate.startsWith(normalizedQuery.substring(0, 3)) ? 0.2 : 0;
  
  // Bonus para correspondência de fim
  const endsWithBonus = normalizedCandidate.endsWith(normalizedQuery.substring(-3)) ? 0.1 : 0;
  
  // Penalty para diferença de tamanho muito grande
  const lengthPenalty = Math.abs(normalizedQuery.length - normalizedCandidate.length) > 3 ? -0.2 : 0;
  
  // Peso combinado
  const combinedScore = (
    levenshteinScore * 0.3 +
    lcsScore * 0.25 +
    bigramScore * 0.2 +
    trigramScore * 0.15 +
    soundexScore +
    startsWithBonus +
    endsWithBonus +
    lengthPenalty
  );
  
  return Math.max(0, Math.min(1, combinedScore));
};

// Função principal de busca inteligente
export const findIntelligentSuggestion = (query: string, products: any[]): string | null => {
  const normalizedQuery = normalizeText(query);
  
  // Queries muito curtas não são corrigidas
  if (normalizedQuery.length < 3) return null;
  
  // Construir conjunto de candidatos
  const candidates = new Set<string>();
  
  // Adicionar dicionário
  EXPANDED_GAMING_DICTIONARY.forEach(term => candidates.add(term));
  
  // Extrair termos dos produtos
  products.forEach(product => {
    if (product.name) {
      const words = normalizeText(product.name).split(/\s+/);
      words.forEach(word => {
        if (word.length > 2) {
          candidates.add(word);
          // Adicionar também frases de 2-3 palavras
          const nameWords = normalizeText(product.name).split(/\s+/);
          for (let i = 0; i < nameWords.length - 1; i++) {
            const phrase = nameWords.slice(i, i + 2).join(' ');
            if (phrase.length > 4) candidates.add(phrase);
          }
        }
      });
    }
    
    ['platform', 'category', 'description'].forEach(field => {
      if (product[field]) {
        const normalized = normalizeText(product[field]);
        if (normalized.length > 2) candidates.add(normalized);
      }
    });
  });
  
  let bestMatch = '';
  let bestScore = 0;
  const minScore = 0.5; // Threshold mínimo
  
  // Avaliar cada candidato
  for (const candidate of candidates) {
    // Score direto
    const directScore = calculateAdvancedScore(normalizedQuery, candidate);
    
    if (directScore > bestScore && directScore >= minScore) {
      bestScore = directScore;
      bestMatch = candidate;
    }
    
    // Testar variações do candidato contra a query
    const variations = generateIntelligentVariations(candidate);
    for (const variation of variations) {
      if (variation === normalizedQuery) {
        return candidate; // Match exato de variação
      }
      
      const variationScore = calculateAdvancedScore(normalizedQuery, variation);
      if (variationScore > 0.8) { // Score alto para variações
        return candidate;
      }
    }
    
    // Testar variações da query contra o candidato
    const queryVariations = generateIntelligentVariations(normalizedQuery);
    for (const queryVar of queryVariations) {
      const varScore = calculateAdvancedScore(queryVar, candidate);
      if (varScore > 0.85) {
        return candidate;
      }
    }
  }
  
  // Para queries com múltiplas palavras
  if (normalizedQuery.includes(' ')) {
    const words = normalizedQuery.split(' ');
    const correctedWords: string[] = [];
    let hasCorrection = false;
    
    for (const word of words) {
      const suggestion = findIntelligentSuggestion(word, products);
      if (suggestion && suggestion !== word) {
        correctedWords.push(suggestion);
        hasCorrection = true;
      } else {
        correctedWords.push(word);
      }
    }
    
    if (hasCorrection) {
      return correctedWords.join(' ');
    }
  }
  
  return bestScore >= minScore ? bestMatch : null;
};

// Função para verificar se precisa correção
export const needsIntelligentCorrection = (query: string, products: any[]): boolean => {
  const normalizedQuery = normalizeText(query);
  
  // Verificar se há resultados diretos
  const hasDirectResults = products.some(product => {
    const searchableText = [
      product.name,
      product.platform,
      product.category,
      product.description
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchableText.includes(normalizedQuery);
  });
  
  if (hasDirectResults) return false;
  
  // Verificar se há sugestão válida
  const suggestion = findIntelligentSuggestion(query, products);
  return suggestion !== null && normalizeText(suggestion) !== normalizedQuery;
};

// Função principal para obter sugestão
export const getIntelligentSpellingSuggestion = (query: string, products: any[]): {
  needsCorrection: boolean;
  suggestion: string | null;
  originalQuery: string;
  confidence: number;
} => {
  const needsCorrection = needsIntelligentCorrection(query, products);
  const suggestion = needsCorrection ? findIntelligentSuggestion(query, products) : null;
  
  let confidence = 0;
  if (suggestion) {
    confidence = calculateAdvancedScore(normalizeText(query), normalizeText(suggestion));
  }
  
  return {
    needsCorrection,
    suggestion,
    originalQuery: query,
    confidence
  };
};

// Auto-correção para casos de alta confiança
export const autoCorrectIntelligent = (query: string, products: any[]): string => {
  const { suggestion, confidence } = getIntelligentSpellingSuggestion(query, products);
  
  // Auto-corrigir apenas com confiança muito alta
  if (suggestion && confidence > 0.9) {
    return suggestion;
  }
  
  return query;
};

