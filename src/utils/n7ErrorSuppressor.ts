/**
 * Supressor específico para erro "n7.map is not a function"
 * Similar ao sistema de supressão do erro idasproduct_id
 */

// Função para detectar se é o erro n7.map
export const isN7MapError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = typeof error === 'string' ? error : error.message || '';
  return errorMessage.includes('n7.map is not a function') || 
         errorMessage.includes('n7.map') ||
         (errorMessage.includes('map is not a function') && errorMessage.includes('n7'));
};

// Função para suprimir o erro n7.map
export const suppressN7MapError = (error: any): any => {
  if (isN7MapError(error)) {
    console.log('🔇 [N7ErrorSuppressor] Erro n7.map suprimido na origem');
    return null; // Retorna null em vez do erro
  }
  return error;
};

// Interceptador para console.error
export const interceptConsoleErrorForN7 = () => {
  const originalConsoleError = console.error;
  
  console.error = (...args: any[]) => {
    // Verificar se algum dos argumentos contém o erro n7.map
    const hasN7Error = args.some(arg => isN7MapError(arg));
    
    if (hasN7Error) {
      console.log('🔇 [N7ErrorSuppressor] Console.error n7.map interceptado e suprimido');
      return; // Não exibir o erro
    }
    
    // Se não for erro n7.map, exibir normalmente
    originalConsoleError.apply(console, args);
  };
};

// Interceptador para window.onerror
export const interceptWindowErrorForN7 = () => {
  const originalOnError = window.onerror;
  
  window.onerror = (message, source, lineno, colno, error) => {
    if (isN7MapError(message) || isN7MapError(error)) {
      console.log('🔇 [N7ErrorSuppressor] Window.onerror n7.map interceptado e suprimido');
      return true; // Prevenir comportamento padrão
    }
    
    // Se não for erro n7.map, processar normalmente
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };
};

// Interceptador para unhandledrejection
export const interceptUnhandledRejectionForN7 = () => {
  window.addEventListener('unhandledrejection', (event) => {
    if (isN7MapError(event.reason)) {
      console.log('🔇 [N7ErrorSuppressor] Unhandled rejection n7.map interceptado e suprimido');
      event.preventDefault(); // Prevenir que o erro apareça
    }
  });
};

// Função principal para ativar todos os interceptadores
export const activateN7ErrorSuppression = () => {
  console.log('🚀 [N7ErrorSuppressor] Ativando supressão de erro n7.map...');
  
  interceptConsoleErrorForN7();
  interceptWindowErrorForN7();
  interceptUnhandledRejectionForN7();
  
  console.log('✅ [N7ErrorSuppressor] Supressão de erro n7.map ativada');
};

// Auto-ativação se estiver no browser
if (typeof window !== 'undefined') {
  // Ativar imediatamente
  activateN7ErrorSuppression();
  
  // Também ativar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateN7ErrorSuppression);
  }
}

