import { useNavigate } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';
import { useCallback } from 'react';

export const useNavigationWithLoading = () => {
  const navigate = useNavigate();
  const { startNavigation, updateProgress, finishNavigation } = useLoading();

  const navigateWithLoading = useCallback(async (
    path: string, 
    options?: { 
      replace?: boolean;
      state?: any;
      minLoadingTime?: number;
    }
  ) => {
    const { replace = false, state, minLoadingTime = 800 } = options || {};
    
    // Iniciar carregamento
    startNavigation(path);
    
    // Simular progresso de carregamento
    const startTime = Date.now();
    let progress = 0;
    
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Incremento aleatório entre 5-20%
      if (progress > 90) progress = 90; // Não passar de 90% até a navegação real
      updateProgress(progress);
    }, 100);

    // Aguardar tempo mínimo para dar sensação de carregamento
    await new Promise(resolve => setTimeout(resolve, minLoadingTime));
    
    // Limpar intervalo de progresso
    clearInterval(progressInterval);
    
    // Completar progresso
    updateProgress(100);
    
    // Aguardar um pouco para mostrar 100%
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Navegar para a página
    if (replace) {
      navigate(path, { replace: true, state });
    } else {
      navigate(path, { state });
    }
    
    // Finalizar carregamento
    finishNavigation();
  }, [navigate, startNavigation, updateProgress, finishNavigation]);

  const navigateToSearch = useCallback(async (query: string) => {
    const searchPath = `/busca?q=${encodeURIComponent(query)}`;
    await navigateWithLoading(searchPath, { minLoadingTime: 1000 });
  }, [navigateWithLoading]);

  const navigateToProduct = useCallback(async (productId: string) => {
    const productPath = `/produto/${productId}`;
    await navigateWithLoading(productPath, { minLoadingTime: 600 });
  }, [navigateWithLoading]);

  const navigateToCategory = useCallback(async (category: string) => {
    const categoryPath = `/categoria/${category}`;
    await navigateWithLoading(categoryPath, { minLoadingTime: 800 });
  }, [navigateWithLoading]);

  return {
    navigateWithLoading,
    navigateToSearch,
    navigateToProduct,
    navigateToCategory
  };
};

