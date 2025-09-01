import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationState {
  isNavigating: boolean;
  currentPath: string;
  targetPath: string | null;
  progress: number;
  navigationId: string | null;
}

interface GlobalNavigationContextType {
  navigationState: NavigationState;
  navigateGlobally: (path: string, options?: { replace?: boolean; state?: any }) => Promise<void>;
  isCurrentlyNavigating: boolean;
}

const GlobalNavigationContext = createContext<GlobalNavigationContextType | undefined>(undefined);

export const useGlobalNavigation = () => {
  const context = useContext(GlobalNavigationContext);
  if (!context) {
    throw new Error('useGlobalNavigation must be used within a GlobalNavigationProvider');
  }
  return context;
};

interface GlobalNavigationProviderProps {
  children: ReactNode;
}

export const GlobalNavigationProvider: React.FC<GlobalNavigationProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    currentPath: location.pathname,
    targetPath: null,
    progress: 0,
    navigationId: null
  });

  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const preloadFrameRef = useRef<HTMLIFrameElement | null>(null);

  const createPreloadFrame = useCallback(() => {
    // Remove frame anterior se existir
    if (preloadFrameRef.current) {
      document.body.removeChild(preloadFrameRef.current);
    }

    // Criar iframe invisível para pré-carregamento
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    
    document.body.appendChild(iframe);
    preloadFrameRef.current = iframe;
    
    return iframe;
  }, []);

  const navigateGlobally = useCallback(async (
    targetPath: string, 
    options?: { replace?: boolean; state?: any }
  ) => {
    const { replace = false, state } = options || {};
    const navigationId = Math.random().toString(36).substr(2, 9);
    
    // Se já estamos navegando, cancelar navegação anterior
    if (navigationState.isNavigating) {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    }

    // Não navegar se já estamos na página de destino
    if (targetPath === location.pathname) {
      return;
    }

    // Iniciar estado de navegação
    setNavigationState({
      isNavigating: true,
      currentPath: location.pathname,
      targetPath,
      progress: 0,
      navigationId
    });

    try {
      // Simular progresso de carregamento
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5; // 5-20% por vez
        if (progress > 85) progress = 85; // Não passar de 85% até confirmar carregamento
        
        setNavigationState(prev => ({
          ...prev,
          progress: Math.min(progress, 85)
        }));
      }, 100);

      // Pré-carregar a página de destino
      const preloadFrame = createPreloadFrame();
      const fullUrl = `${window.location.origin}${targetPath}`;
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout de carregamento'));
        }, 10000); // 10 segundos timeout

        preloadFrame.onload = () => {
          clearTimeout(timeout);
          resolve();
        };

        preloadFrame.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Erro ao carregar página'));
        };

        preloadFrame.src = fullUrl;
      });

      // Limpar intervalo de progresso
      clearInterval(progressInterval);

      // Completar progresso
      setNavigationState(prev => ({
        ...prev,
        progress: 100
      }));

      // Aguardar um pouco para mostrar 100%
      await new Promise(resolve => setTimeout(resolve, 200));

      // Navegar para a página (agora já pré-carregada)
      if (replace) {
        navigate(targetPath, { replace: true, state });
      } else {
        navigate(targetPath, { state });
      }

      // Aguardar um frame para garantir que a navegação aconteceu
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Finalizar navegação
      setNavigationState({
        isNavigating: false,
        currentPath: targetPath,
        targetPath: null,
        progress: 0,
        navigationId: null
      });

      // Limpar frame de pré-carregamento
      if (preloadFrameRef.current) {
        document.body.removeChild(preloadFrameRef.current);
        preloadFrameRef.current = null;
      }

    } catch (error) {
      console.warn('Erro no pré-carregamento, navegando diretamente:', error);
      
      // Em caso de erro, navegar diretamente
      if (replace) {
        navigate(targetPath, { replace: true, state });
      } else {
        navigate(targetPath, { state });
      }

      // Finalizar navegação
      setNavigationState({
        isNavigating: false,
        currentPath: targetPath,
        targetPath: null,
        progress: 0,
        navigationId: null
      });
    }
  }, [navigate, location.pathname, navigationState.isNavigating, createPreloadFrame]);

  const value: GlobalNavigationContextType = {
    navigationState,
    navigateGlobally,
    isCurrentlyNavigating: navigationState.isNavigating
  };

  return (
    <GlobalNavigationContext.Provider value={value}>
      {children}
    </GlobalNavigationContext.Provider>
  );
};

