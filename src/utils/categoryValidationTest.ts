// Teste específico para validação de categorias com emojis
import { supabase } from '@/integrations/supabase/client';

export interface CategoryTestResult {
  success: boolean;
  message: string;
  details: {
    originalCategories: string[];
    validatedCategories: string[];
    categoriesMatch: boolean;
    errors?: string[];
  };
}

// Função replicada da bulkProductUtils para teste
function validateSpecificationCategory(category: string, allowFallback: boolean = true): string | null {
  console.log('[CATEGORY TEST] validateSpecificationCategory - Input:', {
    category,
    type: typeof category,
    length: category?.length,
    allowFallback
  });
  
  if (!category || typeof category !== 'string') {
    console.log('[CATEGORY TEST] validateSpecificationCategory - Falhou: categoria inválida ou não é string');
    return allowFallback ? 'Informações Gerais' : null;
  }
  
  // Limitar tamanho e remover espaços em excesso
  const cleanCategory = category.trim().slice(0, 50);
  
  if (!cleanCategory) {
    console.log('[CATEGORY TEST] validateSpecificationCategory - Categoria vazia após limpeza');
    return allowFallback ? 'Informações Gerais' : null;
  }
  
  console.log('[CATEGORY TEST] validateSpecificationCategory - Categoria limpa:', cleanCategory);
  
  // Regex corrigida para aceitar emojis específicos
  const validPattern = /^[\p{L}\p{N}\p{M}\s\-_()&📋⚙️💾🌐🎮📺🔧🎯⚡💻🎨🔊🎧📱⭐✨🚀💎🏆🔥]+$/u;
  
  const isValid = validPattern.test(cleanCategory);
  console.log('[CATEGORY TEST] validateSpecificationCategory - Teste de padrão:', {
    input: cleanCategory,
    pattern: validPattern.toString(),
    isValid,
    characterCodes: Array.from(cleanCategory).map(c => `${c}(${c.charCodeAt(0)})`),
    result: isValid ? cleanCategory : (allowFallback ? 'Informações Gerais' : null)
  });
  
  // Se não for válido mas allowFallback for true, usar categoria padrão
  if (!isValid && allowFallback) {
    console.log('[CATEGORY TEST] validateSpecificationCategory - Usando categoria padrão devido a caracteres inválidos');
    return 'Informações Gerais';
  }
  
  return isValid ? cleanCategory : null;
}

export async function testCategoryValidation(): Promise<CategoryTestResult> {
  console.log('[CATEGORY TEST] Iniciando teste de validação de categorias...');
  
  // Categorias do seu teste real
  const testCategories = [
    "📋 Informações Gerais",
    "⚙️ Especificações Técnicas", 
    "💾 Armazenamento e Instalação",
    "🌐 Recursos Online"
  ];
  
  const originalCategories: string[] = [];
  const validatedCategories: string[] = [];
  const errors: string[] = [];
  
  try {
    for (const category of testCategories) {
      originalCategories.push(category);
      
      const validated = validateSpecificationCategory(category, true);
      if (validated) {
        validatedCategories.push(validated);
        console.log(`[CATEGORY TEST] "${category}" → "${validated}" ${category === validated ? '✅' : '❌'}`);
      } else {
        errors.push(`Categoria "${category}" foi rejeitada`);
        console.error(`[CATEGORY TEST] Categoria rejeitada: "${category}"`);
      }
    }
    
    const categoriesMatch = originalCategories.length === validatedCategories.length && 
                           originalCategories.every((cat, index) => cat === validatedCategories[index]);
    
    const result: CategoryTestResult = {
      success: categoriesMatch,
      message: categoriesMatch 
        ? 'Todas as categorias foram validadas corretamente!'
        : `${originalCategories.length - validatedCategories.length} categorias foram rejeitadas`,
      details: {
        originalCategories,
        validatedCategories,
        categoriesMatch,
        errors: errors.length > 0 ? errors : undefined
      }
    };
    
    console.log('[CATEGORY TEST] Resultado final:', result);
    return result;
    
  } catch (error) {
    console.error('[CATEGORY TEST] Erro durante teste:', error);
    return {
      success: false,
      message: `Erro durante teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: {
        originalCategories,
        validatedCategories,
        categoriesMatch: false,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      }
    };
  }
}

// Função para simular o processamento completo
export async function simulateSpecificationProcessing(): Promise<CategoryTestResult> {
  console.log('[CATEGORY TEST] Simulando processamento completo...');
  
  // Dados reais do seu teste
  const customSpecifications = [
    {
      "category": "📋 Informações Gerais",
      "label": "Desenvolvedor", 
      "value": "Speed Racing Studios",
      "icon": "🏢",
      "highlight": true
    },
    {
      "category": "📋 Informações Gerais",
      "label": "Publicadora",
      "value": "Fast Games Publishing", 
      "icon": "🏢",
      "highlight": false
    },
    {
      "category": "⚙️ Especificações Técnicas",
      "label": "Motor Gráfico",
      "value": "Unity 2023.3 LTS",
      "icon": "⚙️", 
      "highlight": true
    },
    {
      "category": "⚙️ Especificações Técnicas",
      "label": "Resolução Suportada",
      "value": "Até 8K (7680x4320)",
      "icon": "📺",
      "highlight": true
    },
    {
      "category": "💾 Armazenamento e Instalação",
      "label": "Tamanho Base",
      "value": "85 GB", 
      "icon": "💾",
      "highlight": true
    },
    {
      "category": "🌐 Recursos Online",
      "label": "Modo Multiplayer",
      "value": "Até 32 jogadores simultâneos",
      "icon": "👥",
      "highlight": true
    }
  ];
  
  const processedSpecs: any[] = [];
  const categoryCount = new Map<string, number>();
  const errors: string[] = [];
  
  try {
    customSpecifications.forEach((spec, index) => {
      console.log(`[CATEGORY TEST] Processando spec ${index}:`, spec);
      
      const originalCategory = spec.category;
      const validatedCategory = validateSpecificationCategory(spec.category, true);
      
      if (validatedCategory) {
        processedSpecs.push({
          category: validatedCategory,
          label: spec.label,
          value: spec.value,
          icon: spec.icon,
          highlight: spec.highlight,
          originalCategory
        });
        
        categoryCount.set(validatedCategory, (categoryCount.get(validatedCategory) || 0) + 1);
        
        console.log(`[CATEGORY TEST] Spec processada: "${originalCategory}" → "${validatedCategory}"`);
      } else {
        errors.push(`Spec ${index} com categoria "${originalCategory}" foi rejeitada`);
      }
    });
    
    const uniqueCategories = Array.from(categoryCount.keys());
    const expectedCategories = [...new Set(customSpecifications.map(spec => spec.category))];
    
    console.log('[CATEGORY TEST] Categorias únicas encontradas:', uniqueCategories);
    console.log('[CATEGORY TEST] Categorias esperadas:', expectedCategories);
    console.log('[CATEGORY TEST] Contagem por categoria:', Object.fromEntries(categoryCount));
    
    const categoriesMatch = uniqueCategories.length === expectedCategories.length &&
                           expectedCategories.every(cat => uniqueCategories.includes(cat));
    
    return {
      success: categoriesMatch,
      message: categoriesMatch 
        ? `Processamento correto! ${uniqueCategories.length} categorias distintas mantidas`
        : `Problema: esperadas ${expectedCategories.length} categorias, obtidas ${uniqueCategories.length}`,
      details: {
        originalCategories: expectedCategories,
        validatedCategories: uniqueCategories,
        categoriesMatch,
        errors: errors.length > 0 ? errors : undefined
      }
    };
    
  } catch (error) {
    console.error('[CATEGORY TEST] Erro durante simulação:', error);
    return {
      success: false,
      message: `Erro durante simulação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: {
        originalCategories: [],
        validatedCategories: [],
        categoriesMatch: false,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      }
    };
  }
}