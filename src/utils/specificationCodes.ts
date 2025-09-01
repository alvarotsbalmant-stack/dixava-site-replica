// Sistema centralizado de códigos para especificações de produtos
// Mapeia códigos para emojis e nomes de categorias

export interface SpecificationCodeMapping {
  code: string;
  emoji: string;
  categoryName: string;
  description: string;
}

export const SPECIFICATION_CODES: Record<string, SpecificationCodeMapping> = {
  // Especificações técnicas básicas
  'TECH': {
    code: 'TECH',
    emoji: '⚙️',
    categoryName: 'Especificações Técnicas',
    description: 'Especificações técnicas gerais do produto'
  },
  'PERF': {
    code: 'PERF',
    emoji: '🚀',
    categoryName: 'Performance',
    description: 'Especificações relacionadas à performance'
  },
  'STORAGE': {
    code: 'STORAGE',
    emoji: '💾',
    categoryName: 'Armazenamento',
    description: 'Especificações de armazenamento e memória'
  },
  'DISPLAY': {
    code: 'DISPLAY',
    emoji: '🖥️',
    categoryName: 'Display',
    description: 'Especificações de tela e display'
  },
  'AUDIO': {
    code: 'AUDIO',
    emoji: '🔊',
    categoryName: 'Áudio',
    description: 'Especificações de áudio e som'
  },
  'CONNECT': {
    code: 'CONNECT',
    emoji: '🔌',
    categoryName: 'Conectividade',
    description: 'Especificações de conectividade e portas'
  },
  'POWER': {
    code: 'POWER',
    emoji: '🔋',
    categoryName: 'Energia',
    description: 'Especificações de energia e consumo'
  },
  'DESIGN': {
    code: 'DESIGN',
    emoji: '🎨',
    categoryName: 'Design',
    description: 'Especificações de design e aparência'
  },
  'SIZE': {
    code: 'SIZE',
    emoji: '📐',
    categoryName: 'Dimensões',
    description: 'Especificações de tamanho e peso'
  },
  'COMPAT': {
    code: 'COMPAT',
    emoji: '🔗',
    categoryName: 'Compatibilidade',
    description: 'Especificações de compatibilidade'
  },
  'FEATURE': {
    code: 'FEATURE',
    emoji: '✨',
    categoryName: 'Recursos',
    description: 'Recursos e funcionalidades especiais'
  },
  'CTRL': {
    code: 'CTRL',
    emoji: '🎮',
    categoryName: 'Controles',
    description: 'Especificações de controles e input'
  },
  'NET': {
    code: 'NET',
    emoji: '🌐',
    categoryName: 'Rede',
    description: 'Especificações de rede e conectividade online'
  },
  'SEC': {
    code: 'SEC',
    emoji: '🔒',
    categoryName: 'Segurança',
    description: 'Especificações de segurança e proteção'
  },
  'SOFT': {
    code: 'SOFT',
    emoji: '💿',
    categoryName: 'Software',
    description: 'Especificações de software e sistema operacional'
  },
  'WARRANTY': {
    code: 'WARRANTY',
    emoji: '🛡️',
    categoryName: 'Garantia',
    description: 'Informações de garantia e suporte'
  },
  'PACK': {
    code: 'PACK',
    emoji: '📦',
    categoryName: 'Conteúdo da Embalagem',
    description: 'Itens inclusos na embalagem'
  },
  'REQ': {
    code: 'REQ',
    emoji: '📋',
    categoryName: 'Requisitos',
    description: 'Requisitos mínimos do sistema'
  },
  'RATING': {
    code: 'RATING',
    emoji: '⭐',
    categoryName: 'Classificação',
    description: 'Classificações etárias e ratings'
  },
  'GENRE': {
    code: 'GENRE',
    emoji: '🎯',
    categoryName: 'Gênero',
    description: 'Gênero e categoria do produto'
  }
};

// Função para obter o mapeamento por código
export const getSpecificationByCode = (code: string): SpecificationCodeMapping | null => {
  return SPECIFICATION_CODES[code] || null;
};

// Função para obter todos os códigos disponíveis
export const getAllSpecificationCodes = (): SpecificationCodeMapping[] => {
  return Object.values(SPECIFICATION_CODES);
};

// Função para obter código por emoji (útil para migração)
export const getCodeByEmoji = (emoji: string): string | null => {
  const entry = Object.values(SPECIFICATION_CODES).find(spec => spec.emoji === emoji);
  return entry?.code || null;
};

// Função para validar se um código existe
export const isValidSpecificationCode = (code: string): boolean => {
  return code in SPECIFICATION_CODES;
};

// Função para extrair código de uma string de categoria (para compatibilidade)
export const extractCodeFromCategory = (category: string): { code: string | null; cleanCategory: string } => {
  // Procura por padrão [CÓDIGO] no início da string
  const codeMatch = category.match(/^\[([A-Z_]+)\]\s*/);
  
  if (codeMatch) {
    const code = codeMatch[1];
    const cleanCategory = category.replace(codeMatch[0], '').trim();
    
    if (isValidSpecificationCode(code)) {
      return { code, cleanCategory };
    }
  }
  
  return { code: null, cleanCategory: category };
};

// Função para formatar categoria com código (para exibição no template)
export const formatCategoryWithCode = (code: string): string => {
  const spec = getSpecificationByCode(code);
  if (!spec) return code;
  
  return `[${code}] ${spec.emoji} ${spec.categoryName}`;
};