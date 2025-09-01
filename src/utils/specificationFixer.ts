// Utility para corrigir especificações existentes que foram mal categorizadas
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SpecificationFixResult {
  success: boolean;
  message: string;
  details: {
    totalSpecs: number;
    fixedSpecs: number;
    categoriesUpdated: string[];
    errors?: string[];
  };
}

// Função melhorada de validação de categoria com abordagem de blacklist para segurança
function validateAndFixCategory(category: string): string {
  if (!category || typeof category !== 'string') {
    console.log(`[SPEC FIXER] Categoria inválida (tipo: ${typeof category}): "${category}"`);
    return 'Informações Gerais';
  }
  
  const cleanCategory = category.trim().slice(0, 50);
  
  if (!cleanCategory) {
    console.log(`[SPEC FIXER] Categoria vazia após limpeza: "${category}"`);
    return 'Informações Gerais';
  }
  
  // Primeiro, tentar re-categorizar baseado em palavras-chave
  const smartCategory = smartCategorizeByKeywords(cleanCategory);
  if (smartCategory !== cleanCategory) {
    console.log(`[SPEC FIXER] Categoria inteligente: "${cleanCategory}" → "${smartCategory}"`);
    return smartCategory;
  }
  
  // ABORDAGEM DE BLACKLIST PARA SEGURANÇA
  // Bloquear apenas caracteres perigosos que podem causar problemas de segurança
  const dangerousChars = /[<>'"\\\/\x00-\x1f\x7f]/;
  
  if (dangerousChars.test(cleanCategory)) {
    console.log(`[SPEC FIXER] Categoria contém caracteres perigosos: "${cleanCategory}"`);
    return 'Informações Gerais';
  }
  
  // Se passou na verificação de segurança, aceitar a categoria
  console.log(`[SPEC FIXER] Categoria aprovada: "${cleanCategory}"`);
  return cleanCategory;
}

// Nova função para categorização inteligente baseada em palavras-chave
function smartCategorizeByKeywords(category: string): string {
  const lowerCategory = category.toLowerCase().trim();
  
  // Mapeamentos inteligentes baseados em palavras-chave
  const keywordMappings: Record<string, string> = {
    // Armazenamento e instalação
    'armazenamento': '💾 Armazenamento e Instalação',
    'storage': '💾 Armazenamento e Instalação', 
    'instalação': '💾 Armazenamento e Instalação',
    'installation': '💾 Armazenamento e Instalação',
    'tamanho': '💾 Armazenamento e Instalação',
    'size': '💾 Armazenamento e Instalação',
    'gb': '💾 Armazenamento e Instalação',
    'mb': '💾 Armazenamento e Instalação',
    'space': '💾 Armazenamento e Instalação',
    
    // Recursos online/multiplayer
    'multiplayer': '🌐 Recursos Online',
    'online': '🌐 Recursos Online',
    'internet': '🌐 Recursos Online',
    'network': '🌐 Recursos Online',
    'co-op': '🌐 Recursos Online',
    'cooperative': '🌐 Recursos Online',
    'jogadores': '🌐 Recursos Online',
    'players': '🌐 Recursos Online',
    
    // Hardware/especificações técnicas
    'hardware': '🔧 Hardware',
    'processador': '🔧 Hardware',
    'processor': '🔧 Hardware',
    'cpu': '🔧 Hardware',
    'gpu': '🔧 Hardware',
    'placa': '🔧 Hardware',
    'memória': '🔧 Hardware',
    'memory': '🔧 Hardware',
    'ram': '🔧 Hardware',
    
    // Áudio e vídeo
    'áudio': '🔊 Áudio/Vídeo',
    'audio': '🔊 Áudio/Vídeo',
    'vídeo': '🔊 Áudio/Vídeo',
    'video': '🔊 Áudio/Vídeo',
    'som': '🔊 Áudio/Vídeo',
    'sound': '🔊 Áudio/Vídeo',
    'música': '🔊 Áudio/Vídeo',
    'music': '🔊 Áudio/Vídeo',
    
    // Performance
    'performance': '⚡ Performance',
    'fps': '⚡ Performance',
    'resolução': '⚡ Performance',
    'resolution': '⚡ Performance',
    '4k': '⚡ Performance',
    'hd': '⚡ Performance',
    'qualidade': '⚡ Performance',
    'quality': '⚡ Performance'
  };
  
  // Verificar se alguma palavra-chave está presente na categoria
  for (const [keyword, newCategory] of Object.entries(keywordMappings)) {
    if (lowerCategory.includes(keyword)) {
      return newCategory;
    }
  }
  
  return category; // Retorna categoria original se não encontrar correspondência
}

// Função para mapear categorias comuns mal categorizadas
function mapLegacyCategory(category: string): string {
  const categoryMappings: Record<string, string> = {
    'custom': 'Informações Gerais',
    'general': 'Informações Gerais',
    'geral': 'Informações Gerais',
    'basic': 'Informações Gerais',
    'info': 'Informações Gerais',
    'technical': 'Especificações Técnicas',
    'tech': 'Especificações Técnicas',
    'hardware': 'Hardware',
    'performance': 'Performance',
    'connectivity': 'Conectividade',
    'audio': 'Áudio/Vídeo',
    'video': 'Áudio/Vídeo',
    'storage': 'Armazenamento',
    'multiplayer': 'Multiplayer',
    'gameplay': 'Gameplay'
  };

  const lowerCategory = category.toLowerCase().trim();
  return categoryMappings[lowerCategory] || category;
}

// Função principal para corrigir especificações
export async function fixExistingSpecifications(): Promise<SpecificationFixResult> {
  console.log('[SPEC FIXER] Iniciando correção de especificações...');
  
  try {
    // Buscar todas as especificações existentes
    const { data: allSpecs, error: fetchError } = await supabase
      .from('product_specifications')
      .select('*')
      .order('product_id', { ascending: true })
      .order('order_index', { ascending: true });

    if (fetchError) {
      throw new Error(`Erro ao buscar especificações: ${fetchError.message}`);
    }

    if (!allSpecs || allSpecs.length === 0) {
      return {
        success: true,
        message: 'Nenhuma especificação encontrada para corrigir',
        details: {
          totalSpecs: 0,
          fixedSpecs: 0,
          categoriesUpdated: []
        }
      };
    }

    console.log(`[SPEC FIXER] Encontradas ${allSpecs.length} especificações para análise`);

    const specsToUpdate: any[] = [];
    const categoriesUpdated = new Set<string>();
    const errors: string[] = [];

    // Processar cada especificação
    allSpecs.forEach((spec) => {
      const originalCategory = spec.category;
      
      // Primeiro, mapear categorias legadas conhecidas
      const mappedCategory = mapLegacyCategory(originalCategory);
      
      // Depois, validar e corrigir a categoria
      const fixedCategory = validateAndFixCategory(mappedCategory);
      
      // Se a categoria mudou, adicionar à lista de atualizações
      if (fixedCategory !== originalCategory) {
        specsToUpdate.push({
          id: spec.id,
          category: fixedCategory,
          original_category: originalCategory
        });
        
        categoriesUpdated.add(`${originalCategory} → ${fixedCategory}`);
        
        console.log(`[SPEC FIXER] Spec ${spec.id}: "${originalCategory}" → "${fixedCategory}"`);
      }
    });

    console.log(`[SPEC FIXER] ${specsToUpdate.length} especificações precisam de correção`);

    // Atualizar especificações em lotes
    let fixedCount = 0;
    const batchSize = 50;

    for (let i = 0; i < specsToUpdate.length; i += batchSize) {
      const batch = specsToUpdate.slice(i, i + batchSize);
      
      try {
        // Atualizar cada especificação individualmente para garantir precisão
        for (const specUpdate of batch) {
          const { error: updateError } = await supabase
            .from('product_specifications')
            .update({ category: specUpdate.category })
            .eq('id', specUpdate.id);

          if (updateError) {
            errors.push(`Erro ao atualizar spec ${specUpdate.id}: ${updateError.message}`);
            console.error(`[SPEC FIXER] Erro ao atualizar spec ${specUpdate.id}:`, updateError);
          } else {
            fixedCount++;
          }
        }
        
        console.log(`[SPEC FIXER] Lote ${Math.ceil((i + batchSize) / batchSize)} processado`);
      } catch (batchError) {
        const errorMsg = `Erro no lote ${Math.ceil((i + batchSize) / batchSize)}: ${batchError}`;
        errors.push(errorMsg);
        console.error('[SPEC FIXER]', errorMsg);
      }
    }

    const result: SpecificationFixResult = {
      success: fixedCount > 0 || specsToUpdate.length === 0,
      message: fixedCount > 0 
        ? `Corrigidas ${fixedCount} de ${specsToUpdate.length} especificações`
        : specsToUpdate.length === 0 
          ? 'Todas as especificações já estão corretamente categorizadas'
          : 'Erro ao corrigir especificações',
      details: {
        totalSpecs: allSpecs.length,
        fixedSpecs: fixedCount,
        categoriesUpdated: Array.from(categoriesUpdated),
        errors: errors.length > 0 ? errors : undefined
      }
    };

    console.log('[SPEC FIXER] Resultado final:', result);
    return result;

  } catch (error) {
    console.error('[SPEC FIXER] Erro na correção:', error);
    return {
      success: false,
      message: `Erro durante correção: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: {
        totalSpecs: 0,
        fixedSpecs: 0,
        categoriesUpdated: [],
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      }
    };
  }
}

// Função para executar correção com feedback visual
// Função para executar correção avançada baseada em labels das especificações
export async function runAdvancedSpecificationFix(): Promise<SpecificationFixResult> {
  console.log('[ADVANCED SPEC FIXER] Iniciando correção avançada...');
  
  try {
    // Buscar todas as especificações existentes
    const { data: allSpecs, error: fetchError } = await supabase
      .from('product_specifications')
      .select('*')
      .order('product_id', { ascending: true });

    if (fetchError) {
      throw new Error(`Erro ao buscar especificações: ${fetchError.message}`);
    }

    if (!allSpecs || allSpecs.length === 0) {
      return {
        success: true,
        message: 'Nenhuma especificação encontrada',
        details: { totalSpecs: 0, fixedSpecs: 0, categoriesUpdated: [] }
      };
    }

    const specsToUpdate: any[] = [];
    const categoriesUpdated = new Set<string>();
    const errors: string[] = [];

    // Processar cada especificação com base no label
    allSpecs.forEach((spec) => {
      const originalCategory = spec.category;
      const label = spec.label?.toLowerCase() || '';
      
      let newCategory = originalCategory;
      
      // Categorização inteligente baseada no label
      if (label.includes('tamanho') || label.includes('size') || label.includes('gb') || label.includes('mb')) {
        newCategory = '💾 Armazenamento e Instalação';
      } else if (label.includes('multiplayer') || label.includes('jogador') || label.includes('player') || label.includes('co-op')) {
        newCategory = '🌐 Recursos Online';
      } else if (label.includes('audio') || label.includes('áudio') || label.includes('som') || label.includes('sound')) {
        newCategory = '🔊 Áudio/Vídeo';
      } else if (label.includes('video') || label.includes('vídeo') || label.includes('resolução') || label.includes('fps')) {
        newCategory = '📺 Vídeo e Gráficos';
      } else if (label.includes('hardware') || label.includes('processador') || label.includes('cpu') || label.includes('gpu') || label.includes('memória')) {
        newCategory = '🔧 Hardware';
      } else if (label.includes('performance') || label.includes('qualidade') || label.includes('4k') || label.includes('hd')) {
        newCategory = '⚡ Performance';
      } else if (label.includes('desenvolved') || label.includes('publisher') || label.includes('estúdio') || label.includes('studio')) {
        newCategory = '📋 Informações Gerais';
      }
      
      // Se a categoria mudou, adicionar à lista de atualizações
      if (newCategory !== originalCategory) {
        specsToUpdate.push({
          id: spec.id,
          category: newCategory,
          original_category: originalCategory,
          label: spec.label
        });
        
        categoriesUpdated.add(`${originalCategory} → ${newCategory} (${spec.label})`);
        console.log(`[ADVANCED SPEC FIXER] Spec "${spec.label}": "${originalCategory}" → "${newCategory}"`);
      }
    });

    console.log(`[ADVANCED SPEC FIXER] ${specsToUpdate.length} especificações precisam de correção`);

    // Atualizar especificações
    let fixedCount = 0;
    for (const specUpdate of specsToUpdate) {
      const { error: updateError } = await supabase
        .from('product_specifications')
        .update({ category: specUpdate.category })
        .eq('id', specUpdate.id);

      if (updateError) {
        errors.push(`Erro ao atualizar spec ${specUpdate.label}: ${updateError.message}`);
        console.error(`[ADVANCED SPEC FIXER] Erro:`, updateError);
      } else {
        fixedCount++;
      }
    }

    return {
      success: fixedCount > 0 || specsToUpdate.length === 0,
      message: fixedCount > 0 
        ? `Corrigidas ${fixedCount} especificações com categorização inteligente`
        : 'Todas as especificações já estão categorizadas corretamente',
      details: {
        totalSpecs: allSpecs.length,
        fixedSpecs: fixedCount,
        categoriesUpdated: Array.from(categoriesUpdated),
        errors: errors.length > 0 ? errors : undefined
      }
    };

  } catch (error) {
    console.error('[ADVANCED SPEC FIXER] Erro:', error);
    return {
      success: false,
      message: `Erro durante correção avançada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: {
        totalSpecs: 0,
        fixedSpecs: 0,
        categoriesUpdated: [],
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      }
    };
  }
}

export async function runSpecificationFix(): Promise<SpecificationFixResult> {
  try {
    toast({
      title: "Iniciando correção",
      description: "Corrigindo categorias de especificações...",
    });

    const result = await fixExistingSpecifications();

    if (result.success) {
      toast({
        title: "Correção concluída",
        description: result.message,
      });
      
      if (result.details.categoriesUpdated.length > 0) {
        console.log('Categorias atualizadas:', result.details.categoriesUpdated);
      }
    } else {
      toast({
        title: "Erro na correção",
        description: result.message,
        variant: "destructive"
      });
    }

    return result;
  } catch (error) {
    console.error('Erro ao executar correção:', error);
    toast({
      title: "Erro",
      description: "Erro inesperado durante a correção",
      variant: "destructive"
    });
    
    return {
      success: false,
      message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: {
        totalSpecs: 0,
        fixedSpecs: 0,
        categoriesUpdated: [],
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      }
    };
  }
}

// Função para validar uma categoria específica (para uso em formulários)
export function validateSpecificationCategoryUI(category: string): {
  isValid: boolean;
  fixedCategory: string;
  message?: string;
} {
  if (!category || typeof category !== 'string') {
    return {
      isValid: false,
      fixedCategory: 'Informações Gerais',
      message: 'Categoria deve ser um texto válido'
    };
  }

  const cleanCategory = category.trim().slice(0, 50);
  
  if (!cleanCategory) {
    return {
      isValid: false,
      fixedCategory: 'Informações Gerais',
      message: 'Categoria não pode estar vazia'
    };
  }

  const validPattern = /^[\p{L}\p{N}\p{M}\p{S}\p{P}\s\-_()&📋⚙️💾🌐🎮📺🔧🎯⚡💻🎨🔊🎧📱⭐✨🚀💎🏆🔥👥🎯🔥💰🏪🎪🎭🎨🎵🎬🎤🎸🎹🥁🎺🎷🎻🎪🎠🎡🎢🎳🎯🎱🎲🃏🎴🀄🎯]+$/u;
  const isValid = validPattern.test(cleanCategory);

  if (isValid) {
    return {
      isValid: true,
      fixedCategory: cleanCategory
    };
  } else {
    return {
      isValid: false,
      fixedCategory: 'Informações Gerais',
      message: 'Categoria contém caracteres inválidos. Use apenas letras, números, espaços, hífens e emojis básicos.'
    };
  }
}