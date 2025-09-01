// Sistema de correção de erros de digitação e sugestões "Você quis dizer"

import { normalizeText, calculateLevenshteinSimilarity } from './smartSearch';

// Dicionário de termos comuns de jogos e produtos
const GAMING_DICTIONARY = [
  // Consoles
  'playstation', 'xbox', 'nintendo', 'switch', 'ps5', 'ps4', 'xbox series', 'xbox one',
  
  // Jogos populares
  'resident evil', 'call of duty', 'fifa', 'god of war', 'spider-man', 'spiderman',
  'the last of us', 'grand theft auto', 'gta', 'minecraft', 'fortnite', 'valorant',
  'league of legends', 'counter strike', 'cs', 'cyberpunk', 'witcher', 'assassins creed',
  'mortal kombat', 'street fighter', 'tekken', 'final fantasy', 'zelda', 'mario',
  'sonic', 'crash bandicoot', 'uncharted', 'horizon', 'bloodborne', 'dark souls',
  'elden ring', 'sekiro', 'nioh', 'devil may cry', 'metal gear', 'silent hill',
  'tomb raider', 'far cry', 'watch dogs', 'rainbow six', 'battlefield', 'apex legends',
  'overwatch', 'destiny', 'borderlands', 'fallout', 'elder scrolls', 'skyrim',
  'mass effect', 'dragon age', 'bioshock', 'dishonored', 'prey', 'doom', 'wolfenstein',
  
  // Gêneros
  'acao', 'aventura', 'rpg', 'fps', 'mmorpg', 'estrategia', 'simulacao', 'corrida',
  'esporte', 'luta', 'plataforma', 'puzzle', 'terror', 'survival', 'sandbox',
  
  // Acessórios
  'controle', 'joystick', 'headset', 'fone', 'microfone', 'teclado', 'mouse',
  'mousepad', 'cadeira', 'monitor', 'webcam', 'cabo', 'carregador', 'bateria',
  'memoria', 'ssd', 'hd', 'placa de video', 'processador'
];

// Erros comuns de digitação para termos específicos
const COMMON_TYPOS: Record<string, string[]> = {
  // PlayStation
  'playstation': ['playsation', 'playstaton', 'playstaion', 'plaistation', 'pleisteiton'],
  'ps5': ['ps 5', 'playstation5', 'play5'],
  'ps4': ['ps 4', 'playstation4', 'play4'],
  
  // Xbox
  'xbox': ['x box', 'xbos', 'xbox', 'exbox'],
  'xbox series': ['xbox serie', 'xbox series x', 'xbox series s'],
  'xbox one': ['xboxone', 'xbox 1'],
  
  // Nintendo
  'nintendo': ['nintedo', 'nitendo', 'nintendo'],
  'switch': ['swich', 'swicth', 'switc'],
  
  // Jogos populares
  'resident evil': ['residente evil', 'resident evill', 'residen evil', 'resident evi'],
  'call of duty': ['call of duti', 'cal of duty', 'call duty'],
  'spider-man': ['spiderman', 'spider man', 'spidermen', 'homem aranha'],
  'god of war': ['god war', 'god of wars', 'godofwar'],
  'grand theft auto': ['grand theft', 'gta', 'grand teft auto'],
  'the last of us': ['last of us', 'the last us', 'lastofus'],
  'assassins creed': ['assassin creed', 'assasins creed', 'assassins cred'],
  'mortal kombat': ['mortal combat', 'mortal kombat', 'mortalkombat'],
  'final fantasy': ['final fantasi', 'final fantasy', 'finalfantasy'],
  'counter strike': ['counter-strike', 'counterstrike', 'cs go', 'csgo'],
  
  // Termos gerais
  'controle': ['controle', 'controle', 'controle'],
  'joystick': ['joy stick', 'joistick', 'joystic'],
  'headset': ['head set', 'hedset', 'headset'],
  'teclado': ['teclado', 'tecaldo', 'teclado'],
  'mouse': ['mause', 'mousse', 'mous']
};

// Função para gerar variações de um termo
const generateTypoVariations = (term: string): string[] => {
  const variations: string[] = [];
  const normalized = normalizeText(term);
  
  // Adicionar variações do dicionário de erros comuns
  for (const [correct, typos] of Object.entries(COMMON_TYPOS)) {
    if (normalizeText(correct) === normalized) {
      variations.push(...typos);
    }
  }
  
  // Gerar variações automáticas
  const chars = normalized.split('');
  
  // Omissão de caracteres
  for (let i = 0; i < chars.length; i++) {
    const variation = chars.slice(0, i).concat(chars.slice(i + 1)).join('');
    if (variation.length > 2) variations.push(variation);
  }
  
  // Troca de caracteres adjacentes
  for (let i = 0; i < chars.length - 1; i++) {
    const variation = [...chars];
    [variation[i], variation[i + 1]] = [variation[i + 1], variation[i]];
    variations.push(variation.join(''));
  }
  
  // Substituição de caracteres comuns
  const commonSubstitutions: Record<string, string[]> = {
    'a': ['e', 'o'],
    'e': ['a', 'i'],
    'i': ['e', 'o'],
    'o': ['a', 'u'],
    'u': ['o', 'i'],
    'c': ['k', 's'],
    'k': ['c', 'q'],
    's': ['c', 'z'],
    'z': ['s'],
    'ph': ['f'],
    'f': ['ph'],
    'y': ['i'],
    'w': ['v'],
    'x': ['ks', 'z']
  };
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const substitutes = commonSubstitutions[char] || [];
    
    for (const substitute of substitutes) {
      const variation = [...chars];
      variation[i] = substitute;
      variations.push(variation.join(''));
    }
  }
  
  return [...new Set(variations)]; // Remove duplicatas
};

// Função para encontrar a melhor sugestão
export const findBestSuggestion = (query: string, products: any[]): string | null => {
  const normalizedQuery = normalizeText(query);
  
  // Se a query é muito curta, não sugerir
  if (normalizedQuery.length < 3) return null;
  
  // Extrair todos os termos únicos dos produtos
  const allTerms = new Set<string>();
  
  // Adicionar termos do dicionário
  GAMING_DICTIONARY.forEach(term => allTerms.add(term));
  
  // Extrair termos dos produtos
  products.forEach(product => {
    if (product.name) {
      const words = normalizeText(product.name).split(' ');
      words.forEach(word => {
        if (word.length > 2) allTerms.add(word);
      });
    }
    
    if (product.platform) {
      allTerms.add(normalizeText(product.platform));
    }
    
    if (product.category) {
      allTerms.add(normalizeText(product.category));
    }
  });
  
  let bestMatch = '';
  let bestScore = 0;
  const minSimilarity = 0.6; // Similaridade mínima para sugerir
  
  // Verificar similaridade com cada termo
  for (const term of allTerms) {
    const similarity = calculateLevenshteinSimilarity(normalizedQuery, term);
    
    if (similarity > bestScore && similarity >= minSimilarity) {
      bestScore = similarity;
      bestMatch = term;
    }
    
    // Verificar se a query é uma variação conhecida
    const variations = generateTypoVariations(term);
    for (const variation of variations) {
      if (normalizedQuery === variation) {
        return term; // Correspondência exata de erro conhecido
      }
    }
  }
  
  // Verificar correspondências parciais para queries com múltiplas palavras
  if (normalizedQuery.includes(' ')) {
    const queryWords = normalizedQuery.split(' ');
    const suggestions: string[] = [];
    
    for (const word of queryWords) {
      const suggestion = findBestSuggestion(word, products);
      if (suggestion) {
        suggestions.push(suggestion);
      } else {
        suggestions.push(word);
      }
    }
    
    const suggestedQuery = suggestions.join(' ');
    if (suggestedQuery !== normalizedQuery) {
      return suggestedQuery;
    }
  }
  
  return bestScore >= minSimilarity ? bestMatch : null;
};

// Função para verificar se uma query precisa de correção
export const needsSpellCorrection = (query: string, products: any[]): boolean => {
  const normalizedQuery = normalizeText(query);
  
  // Verificar se há resultados exatos
  for (const product of products) {
    const searchFields = [product.name, product.platform, product.category, product.description];
    
    for (const field of searchFields) {
      if (field && normalizeText(field).includes(normalizedQuery)) {
        return false; // Há correspondência exata, não precisa correção
      }
    }
  }
  
  // Se não há correspondência exata e há uma sugestão, precisa correção
  const suggestion = findBestSuggestion(query, products);
  return suggestion !== null && suggestion !== normalizedQuery;
};

// Função principal para obter sugestão de correção
export const getSpellingSuggestion = (query: string, products: any[]): {
  needsCorrection: boolean;
  suggestion: string | null;
  originalQuery: string;
} => {
  const needsCorrection = needsSpellCorrection(query, products);
  const suggestion = needsCorrection ? findBestSuggestion(query, products) : null;
  
  return {
    needsCorrection,
    suggestion,
    originalQuery: query
  };
};

// Função para aplicar correção automática em casos óbvios
export const autoCorrectQuery = (query: string, products: any[]): string => {
  const { needsCorrection, suggestion } = getSpellingSuggestion(query, products);
  
  // Auto-corrigir apenas se a similaridade for muito alta (>0.9)
  if (needsCorrection && suggestion) {
    const similarity = calculateLevenshteinSimilarity(normalizeText(query), normalizeText(suggestion));
    if (similarity > 0.9) {
      return suggestion;
    }
  }
  
  return query;
};

