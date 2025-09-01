import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  isControlling: boolean;
  hasUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
}

interface CacheStats {
  [cacheName: string]: number;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isInstalling: false,
    isWaiting: false,
    isControlling: false,
    hasUpdate: false,
    registration: null,
  });

  const [cacheStats, setCacheStats] = useState<CacheStats>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Registrar Service Worker
  const register = useCallback(async () => {
    if (!state.isSupported) {
      console.warn('Service Worker não é suportado neste navegador');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registrado com sucesso:', registration);

      setState(prev => ({
        ...prev,
        isRegistered: true,
        registration,
      }));

      // Configurar listeners
      setupServiceWorkerListeners(registration);

      return registration;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      toast.error('Erro ao configurar cache offline');
      return null;
    }
  }, [state.isSupported]);

  // Configurar listeners do Service Worker
  const setupServiceWorkerListeners = useCallback((registration: ServiceWorkerRegistration) => {
    // Listener para instalação
    if (registration.installing) {
      setState(prev => ({ ...prev, isInstalling: true }));
      
      registration.installing.addEventListener('statechange', (event) => {
        const sw = event.target as ServiceWorker;
        if (sw.state === 'installed') {
          setState(prev => ({ ...prev, isInstalling: false }));
          
          if (navigator.serviceWorker.controller) {
            // Há uma nova versão disponível
            setState(prev => ({ ...prev, hasUpdate: true }));
            toast.info('Nova versão disponível! Clique para atualizar.', {
              action: {
                label: 'Atualizar',
                onClick: () => updateServiceWorker(),
              },
              duration: 10000,
            });
          } else {
            // Primeira instalação
            toast.success('Site configurado para funcionar offline!');
          }
        }
      });
    }

    // Listener para waiting
    if (registration.waiting) {
      setState(prev => ({ ...prev, isWaiting: true, hasUpdate: true }));
    }

    // Listener para atualizações
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        setState(prev => ({ ...prev, isInstalling: true }));
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setState(prev => ({ ...prev, hasUpdate: true, isWaiting: true }));
          }
        });
      }
    });

    // Listener para controle
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      setState(prev => ({ ...prev, isControlling: true }));
      window.location.reload();
    });
  }, []);

  // Atualizar Service Worker
  const updateServiceWorker = useCallback(async () => {
    if (!state.registration?.waiting) return;

    // Enviar mensagem para pular waiting
    state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    setState(prev => ({ ...prev, hasUpdate: false, isWaiting: false }));
  }, [state.registration]);

  // Desregistrar Service Worker
  const unregister = useCallback(async () => {
    if (!state.registration) return false;

    try {
      const result = await state.registration.unregister();
      setState(prev => ({
        ...prev,
        isRegistered: false,
        registration: null,
      }));
      
      toast.success('Cache offline desabilitado');
      return result;
    } catch (error) {
      console.error('Erro ao desregistrar Service Worker:', error);
      return false;
    }
  }, [state.registration]);

  // Limpar cache
  const clearCache = useCallback(async () => {
    if (!state.registration) return false;

    try {
      const messageChannel = new MessageChannel();
      
      return new Promise<boolean>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.success);
          if (event.data.success) {
            toast.success('Cache limpo com sucesso');
            setCacheStats({});
          }
        };

        state.registration!.active?.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast.error('Erro ao limpar cache');
      return false;
    }
  }, [state.registration]);

  // Obter estatísticas do cache
  const getCacheStats = useCallback(async () => {
    if (!state.registration?.active) return {};

    try {
      const messageChannel = new MessageChannel();
      
      return new Promise<CacheStats>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          const stats = event.data;
          setCacheStats(stats);
          resolve(stats);
        };

        state.registration!.active!.postMessage(
          { type: 'CACHE_STATS' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas do cache:', error);
      return {};
    }
  }, [state.registration]);

  // Verificar atualizações
  const checkForUpdates = useCallback(async () => {
    if (!state.registration) return false;

    try {
      await state.registration.update();
      return true;
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      return false;
    }
  }, [state.registration]);

  // Prefetch de recursos
  const prefetchResource = useCallback(async (url: string) => {
    if (!state.isSupported) return false;

    try {
      const cache = await caches.open('uti-prefetch-v1');
      const response = await fetch(url);
      
      if (response.ok) {
        await cache.put(url, response);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao fazer prefetch:', error);
      return false;
    }
  }, [state.isSupported]);

  // Prefetch de múltiplos recursos
  const prefetchResources = useCallback(async (urls: string[]) => {
    const results = await Promise.allSettled(
      urls.map(url => prefetchResource(url))
    );
    
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value
    ).length;
    
    console.log(`Prefetch concluído: ${successful}/${urls.length} recursos`);
    return successful;
  }, [prefetchResource]);

  // Listeners para status online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Você está offline. Algumas funcionalidades podem estar limitadas.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-registrar na inicialização
  useEffect(() => {
    if (state.isSupported && !state.isRegistered) {
      register();
    }
  }, [state.isSupported, state.isRegistered, register]);

  // Atualizar estatísticas periodicamente
  useEffect(() => {
    if (state.isRegistered) {
      getCacheStats();
      
      const interval = setInterval(getCacheStats, 5 * 60 * 1000); // A cada 5 minutos
      return () => clearInterval(interval);
    }
  }, [state.isRegistered, getCacheStats]);

  return {
    // Estado
    ...state,
    isOnline,
    cacheStats,
    
    // Ações
    register,
    unregister,
    updateServiceWorker,
    clearCache,
    getCacheStats,
    checkForUpdates,
    prefetchResource,
    prefetchResources,
    
    // Utilitários
    isOfflineCapable: state.isRegistered && state.isSupported,
    cacheSize: Object.values(cacheStats).reduce((total, count) => total + count, 0),
  };
};

