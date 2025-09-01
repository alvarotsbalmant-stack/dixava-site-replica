// Corretor Ortográfico Completo e Robusto
// Sistema avançado que detecta letras digitadas sem querer e otimiza performance

import { normalizeText } from './smartSearch';

// Cache para otimização de performance
const correctionCache = new Map<string, CorrectionResult>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos

interface CorrectionResult {
  needsCorrection: boolean;
  suggestion: string | null;
  confidence: number;
  correctionType: 'extra_letter' | 'typo' | 'phonetic' | 'none';
  timestamp: number;
}

// Dicionário completo e otimizado
const COMPLETE_GAMING_DICTIONARY = new Set([
  // Consoles principais
  'playstation', 'xbox', 'nintendo', 'switch', 'ps5', 'ps4', 'ps3', 'ps2', 'ps1',
  'xbox series x', 'xbox series s', 'xbox one', 'xbox 360', 'nintendo switch',
  'steam deck', 'vita', 'psp', 'gameboy', 'wii', 'wiiu', 'gamecube', 'dreamcast',
  
  // Marcas e termos base
  'play', 'station', 'microsoft', 'sony', 'nintendo', 'steam', 'epic', 'ubisoft',
  'activision', 'blizzard', 'ea', 'electronic arts', 'rockstar', 'bethesda',
  
  // Jogos populares (base)
  'resident', 'evil', 'call', 'duty', 'fifa', 'god', 'war', 'spider', 'man',
  'last', 'us', 'grand', 'theft', 'auto', 'gta', 'minecraft', 'fortnite',
  'valorant', 'league', 'legends', 'counter', 'strike', 'cyberpunk', 'witcher',
  'assassins', 'creed', 'mortal', 'kombat', 'street', 'fighter', 'tekken',
  'final', 'fantasy', 'zelda', 'mario', 'sonic', 'crash', 'bandicoot',
  'uncharted', 'horizon', 'bloodborne', 'dark', 'souls', 'elden', 'ring',
  'sekiro', 'nioh', 'devil', 'may', 'cry', 'metal', 'gear', 'silent', 'hill',
  'tomb', 'raider', 'far', 'cry', 'watch', 'dogs', 'rainbow', 'six',
  'battlefield', 'apex', 'legends', 'overwatch', 'destiny', 'borderlands',
  'fallout', 'elder', 'scrolls', 'skyrim', 'mass', 'effect', 'dragon', 'age',
  'bioshock', 'dishonored', 'prey', 'doom', 'wolfenstein', 'halo', 'gears',
  'forza', 'fable', 'ori', 'cuphead', 'hollow', 'knight', 'celeste',
  'stardew', 'valley', 'terraria', 'among', 'fall', 'guys', 'rocket', 'league',
  
  // Gêneros
  'acao', 'aventura', 'rpg', 'fps', 'mmorpg', 'estrategia', 'simulacao',
  'corrida', 'esporte', 'luta', 'plataforma', 'puzzle', 'terror', 'survival',
  'sandbox', 'roguelike', 'metroidvania', 'battle', 'royale', 'moba', 'rts',
  
  // Acessórios
  'controle', 'joystick', 'headset', 'fone', 'microfone', 'teclado', 'mouse',
  'mousepad', 'cadeira', 'monitor', 'webcam', 'cabo', 'carregador', 'bateria',
  'memoria', 'ssd', 'hd', 'placa', 'video', 'processador', 'cooler', 'fonte'
]);

// Padrões de letras extras comuns
const EXTRA_LETTER_PATTERNS = [
  // Letras duplicadas
  /(.)\1{2,}/g, // 3+ letras iguais seguidas
  
  // Letras extras no final de palavras conhecidas
  /^(play)([a-z])$/i,
  /^(xbox)([a-z])$/i,
  /^(nintendo)([a-z])$/i,
  /^(fifa)([a-z])$/i,
  /^(god)([a-z])$/i,
  /^(war)([a-z])$/i,
  /^(call)([a-z])$/i,
  /^(duty)([a-z])$/i,
  
  // Espaços seguidos de letra única
  /\s+[a-z]$/i,
  
  // Letras soltas no meio
  /^([a-z]+)\s+[a-z]\s+([a-z]+)$/i
];

// Algoritmo otimizado de distância de Levenshtein com limite
const fastLevenshtein = (a: string, b: string, maxDistance: number = 3): number => {
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
      
      // Early termination se exceder limite
      if (matrix[i][j] > maxDistance) {
        return maxDistance + 1;
      }
    }
  }
  
  return matrix[b.length][a.length];
};

// Detectar letras extras/sem querer
const detectExtraLetters = (query: string): string | null => {
  const normalized = normalizeText(query);
  
  // Verificar padrões de letras extras
  for (const pattern of EXTRA_LETTER_PATTERNS) {
    const match = normalized.match(pattern);
    if (match) {
      // Para padrões como "play p" → "play"
      if (pattern.source.includes('\\s+[a-z]$')) {
        return normalized.replace(/\s+[a-z]$/i, '');
      }
      
      // Para padrões como "playp" → "play"
      if (match[1] && COMPLETE_GAMING_DICTIONARY.has(match[1])) {
        return match[1];
      }
    }
  }
  
  // Verificar se removendo última letra resulta em palavra conhecida
  if (normalized.length > 3) {
    const withoutLast = normalized.slice(0, -1);
    if (COMPLETE_GAMING_DICTIONARY.has(withoutLast)) {
      return withoutLast;
    }
    
    // Verificar removendo últimas 2 letras
    if (normalized.length > 4) {
      const withoutLast2 = normalized.slice(0, -2);
      if (COMPLETE_GAMING_DICTIONARY.has(withoutLast2)) {
        return withoutLast2;
      }
    }
  }
  
  // Verificar palavras compostas com letra extra
  const words = normalized.split(/\s+/);
  if (words.length > 1) {
    const correctedWords: string[] = [];
    let hasCorrection = false;
    
    for (const word of words) {
      if (word.length === 1) {
        // Pular letras soltas
        hasCorrection = true;
        continue;
      }
      
      const corrected = detectExtraLetters(word);
      if (corrected) {
        correctedWords.push(corrected);
        hasCorrection = true;
      } else {
        correctedWords.push(word);
      }
    }
    
    if (hasCorrection && correctedWords.length > 0) {
      return correctedWords.join(' ');
    }
  }
  
  return null;
};

// Algoritmo de correção fonética otimizado
const phoneticCorrection = (query: string): string | null => {
  const normalized = normalizeText(query);
  
  const phoneticMap: Record<string, string[]> = {
    'c': ['k', 's'],
    'k': ['c'],
    's': ['c', 'z'],
    'z': ['s'],
    'f': ['ph', 'v'],
    'v': ['f'],
    'w': ['v', 'u'],
    'i': ['y', 'e'],
    'y': ['i'],
    'o': ['u'],
    'u': ['o'],
    'a': ['e'],
    'e': ['a', 'i']
  };
  
  // Tentar substituições fonéticas simples
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const alternatives = phoneticMap[char] || [];
    
    for (const alt of alternatives) {
      const candidate = normalized.substring(0, i) + alt + normalized.substring(i + 1);
      if (COMPLETE_GAMING_DICTIONARY.has(candidate)) {
        return candidate;
      }
    }
  }
  
  return null;
};

// Busca fuzzy otimizada com timeout
const fuzzySearch = (query: string, maxResults: number = 3, timeoutMs: number = 100): string[] => {
  const startTime = Date.now();
  const normalized = normalizeText(query);
  const results: Array<{term: string, distance: number}> = [];
  
  // Busca otimizada no dicionário
  for (const term of COMPLETE_GAMING_DICTIONARY) {
    // Timeout protection
    if (Date.now() - startTime > timeoutMs) {
      break;
    }
    
    // Filtros rápidos para otimização
    if (Math.abs(term.length - normalized.length) > 3) continue;
    if (term[0] !== normalized[0] && fastLevenshtein(term.substring(0, 2), normalized.substring(0, 2)) > 1) continue;
    
    const distance = fastLevenshtein(normalized, term, 3);
    if (distance <= 3) {
      results.push({ term, distance });
    }
  }
  
  // Ordenar por distância e retornar melhores
  return results
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults)
    .map(r => r.term);
};

// Sistema de cache otimizado
const getCachedResult = (query: string): CorrectionResult | null => {
  const cached = correctionCache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached;
  }
  return null;
};

const setCachedResult = (query: string, result: CorrectionResult): void => {
  result.timestamp = Date.now();
  correctionCache.set(query, result);
  
  // Limpar cache antigo periodicamente
  if (correctionCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of correctionCache.entries()) {
      if (now - value.timestamp > CACHE_EXPIRY) {
        correctionCache.delete(key);
      }
    }
  }
};

// Função principal de correção robusta
export const getRobustSpellingSuggestion = (query: string, products: any[] = []): CorrectionResult => {
  const normalized = normalizeText(query);
  
  // Verificar cache primeiro
  const cached = getCachedResult(normalized);
  if (cached) return cached;
  
  // Queries muito curtas ou vazias
  if (normalized.length < 2) {
    const result: CorrectionResult = {
      needsCorrection: false,
      suggestion: null,
      confidence: 0,
      correctionType: 'none',
      timestamp: Date.now()
    };
    setCachedResult(normalized, result);
    return result;
  }
  
  // 1. Detectar letras extras primeiro (mais comum)
  const extraLetterCorrection = detectExtraLetters(normalized);
  if (extraLetterCorrection && extraLetterCorrection !== normalized) {
    const result: CorrectionResult = {
      needsCorrection: true,
      suggestion: extraLetterCorrection,
      confidence: 0.95,
      correctionType: 'extra_letter',
      timestamp: Date.now()
    };
    setCachedResult(normalized, result);
    return result;
  }
  
  // 2. Verificar se já é uma palavra conhecida
  if (COMPLETE_GAMING_DICTIONARY.has(normalized)) {
    const result: CorrectionResult = {
      needsCorrection: false,
      suggestion: null,
      confidence: 1.0,
      correctionType: 'none',
      timestamp: Date.now()
    };
    setCachedResult(normalized, result);
    return result;
  }
  
  // 3. Correção fonética rápida
  const phoneticSuggestion = phoneticCorrection(normalized);
  if (phoneticSuggestion) {
    const result: CorrectionResult = {
      needsCorrection: true,
      suggestion: phoneticSuggestion,
      confidence: 0.85,
      correctionType: 'phonetic',
      timestamp: Date.now()
    };
    setCachedResult(normalized, result);
    return result;
  }
  
  // 4. Busca fuzzy com timeout
  const fuzzyResults = fuzzySearch(normalized, 1, 50); // Timeout muito baixo
  if (fuzzyResults.length > 0) {
    const suggestion = fuzzyResults[0];
    const distance = fastLevenshtein(normalized, suggestion, 3);
    const confidence = Math.max(0.5, 1 - (distance / Math.max(normalized.length, suggestion.length)));
    
    if (confidence >= 0.6) {
      const result: CorrectionResult = {
        needsCorrection: true,
        suggestion,
        confidence,
        correctionType: 'typo',
        timestamp: Date.now()
      };
      setCachedResult(normalized, result);
      return result;
    }
  }
  
  // 5. Verificar nos produtos (com timeout)
  if (products.length > 0) {
    const startTime = Date.now();
    const productTerms = new Set<string>();
    
    for (const product of products.slice(0, 100)) { // Limitar produtos
      if (Date.now() - startTime > 30) break; // Timeout de 30ms
      
      if (product.name) {
        const words = normalizeText(product.name).split(/\s+/);
        words.forEach(word => {
          if (word.length > 2) productTerms.add(word);
        });
      }
    }
    
    // Busca rápida nos termos dos produtos
    for (const term of productTerms) {
      if (Date.now() - startTime > 50) break;
      
      const distance = fastLevenshtein(normalized, term, 2);
      if (distance <= 2) {
        const confidence = 1 - (distance / Math.max(normalized.length, term.length));
        if (confidence >= 0.7) {
          const result: CorrectionResult = {
            needsCorrection: true,
            suggestion: term,
            confidence,
            correctionType: 'typo',
            timestamp: Date.now()
          };
          setCachedResult(normalized, result);
          return result;
        }
      }
    }
  }
  
  // Nenhuma correção encontrada
  const result: CorrectionResult = {
    needsCorrection: false,
    suggestion: null,
    confidence: 0,
    correctionType: 'none',
    timestamp: Date.now()
  };
  setCachedResult(normalized, result);
  return result;
};

// Função de verificação rápida
export const needsRobustCorrection = (query: string, products: any[] = []): boolean => {
  const result = getRobustSpellingSuggestion(query, products);
  return result.needsCorrection;
};

// Auto-correção para casos óbvios
export const autoCorrectRobust = (query: string, products: any[] = []): string => {
  const result = getRobustSpellingSuggestion(query, products);
  
  // Auto-corrigir apenas casos muito óbvios (letras extras)
  if (result.needsCorrection && result.suggestion && result.correctionType === 'extra_letter' && result.confidence > 0.9) {
    return result.suggestion;
  }
  
  return query;
};

// Função para limpar cache manualmente
export const clearSpellCheckCache = (): void => {
  correctionCache.clear();
};

// Função para estatísticas do cache
export const getSpellCheckStats = () => {
  return {
    cacheSize: correctionCache.size,
    cacheEntries: Array.from(correctionCache.entries()).map(([key, value]) => ({
      query: key,
      suggestion: value.suggestion,
      confidence: value.confidence,
      type: value.correctionType,
      age: Date.now() - value.timestamp
    }))
  };
};

