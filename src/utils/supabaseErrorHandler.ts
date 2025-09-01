// Handler específico para erros do Supabase relacionados ao problema idasproduct_id
// Criado para monitorar e corrigir automaticamente o erro identificado pelo Lovable

export interface SupabaseErrorInfo {
  isIdasproductError: boolean;
  shouldRetry: boolean;
  retryDelay: number;
  errorCode?: string;
  originalError: any;
}

export const analyzeSupabaseError = (error: any): SupabaseErrorInfo => {
  const errorMessage = error?.message || '';
  const errorDetails = error?.details || '';
  const errorHint = error?.hint || '';
  
  // Detectar o erro específico que estamos corrigindo
  const isIdasproductError = 
    errorMessage.includes('idasproduct_id') ||
    errorMessage.includes('column products.idasproduct_id does not exist') ||
    errorDetails.includes('idasproduct_id');

  // Determinar se deve tentar novamente
  const shouldRetry = isIdasproductError || 
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('network');

  // Calcular delay baseado no tipo de erro
  let retryDelay = 1000; // 1 segundo padrão
  
  if (isIdasproductError) {
    retryDelay = 2000; // 2 segundos para erro específico
  } else if (errorMessage.includes('rate limit')) {
    retryDelay = 5000; // 5 segundos para rate limit
  }

  return {
    isIdasproductError,
    shouldRetry,
    retryDelay,
    errorCode: error?.code,
    originalError: error
  };
};

export const logSupabaseError = (error: any, context: string, attempt?: number) => {
  const errorInfo = analyzeSupabaseError(error);
  
  console.group(`🚨 [SupabaseError] ${context}`);
  
  if (errorInfo.isIdasproductError) {
    console.error('❌ ERRO IDASPRODUCT_ID DETECTADO:', error.message);
    console.warn('🔧 Este é o erro que estamos corrigindo com a migração');
    console.info('📋 Tentativa de retry será executada automaticamente');
  } else {
    console.error('❌ Erro Supabase:', error.message);
  }
  
  if (attempt) {
    console.info(`🔄 Tentativa: ${attempt}`);
  }
  
  console.info('📊 Análise do erro:', {
    isIdasproductError: errorInfo.isIdasproductError,
    shouldRetry: errorInfo.shouldRetry,
    retryDelay: errorInfo.retryDelay,
    errorCode: errorInfo.errorCode
  });
  
  console.groupEnd();
  
  return errorInfo;
};

export const handleSupabaseRetry = async (
  operation: () => Promise<any>,
  context: string,
  maxRetries: number = 3
): Promise<any> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [${context}] Tentativa ${attempt}/${maxRetries}`);
      const result = await operation();
      
      if (attempt > 1) {
        console.log(`✅ [${context}] Sucesso na tentativa ${attempt}`);
      }
      
      return result;
    } catch (error) {
      const errorInfo = logSupabaseError(error, context, attempt);
      lastError = error;
      
      // Se não deve tentar novamente ou é a última tentativa
      if (!errorInfo.shouldRetry || attempt === maxRetries) {
        if (errorInfo.isIdasproductError) {
          console.error('🚨 ERRO IDASPRODUCT_ID PERSISTENTE - Migração pode não ter sido aplicada');
        }
        break;
      }
      
      // Aguardar antes da próxima tentativa
      console.log(`⏳ Aguardando ${errorInfo.retryDelay}ms antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, errorInfo.retryDelay));
    }
  }
  
  throw lastError;
};

// Função para forçar invalidação do cache do Supabase
export const invalidateSupabaseCache = () => {
  console.log('🔄 Invalidando cache do Supabase...');
  
  // Limpar cache local se existir
  if (typeof window !== 'undefined') {
    // Limpar localStorage relacionado ao Supabase
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Limpar sessionStorage relacionado ao Supabase
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
  
  console.log('✅ Cache do Supabase invalidado');
};

// Monitoramento contínuo para o erro específico
export const startErrorMonitoring = () => {
  console.log('🔍 Iniciando monitoramento de erros idasproduct_id...');
  
  // Interceptar erros globais
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      if (event.error?.message?.includes('idasproduct_id')) {
        console.error('🚨 ERRO IDASPRODUCT_ID DETECTADO GLOBALMENTE:', event.error);
        // Aqui poderia disparar uma notificação ou ação corretiva
      }
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('idasproduct_id')) {
        console.error('🚨 PROMISE REJECTION IDASPRODUCT_ID:', event.reason);
        // Aqui poderia disparar uma notificação ou ação corretiva
      }
    });
  }
  
  console.log('✅ Monitoramento de erros ativo');
};

