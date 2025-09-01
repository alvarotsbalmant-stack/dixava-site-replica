import { useState, useEffect, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalling: boolean;
  hasUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
}

export const useServiceWorkerSimple = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isInstalling: false,
    hasUpdate: false,
    registration: null,
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Registrar Service Worker
  const register = useCallback(async () => {
    if (!state.isSupported) {
      console.warn('Service Worker não é suportado neste navegador');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw-simple.js', {
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
          }
        }
      });
    }

    // Listener para atualizações
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        setState(prev => ({ ...prev, isInstalling: true }));
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setState(prev => ({ ...prev, hasUpdate: true }));
          }
        });
      }
    });

    // Listener para controle
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, []);

  // Atualizar Service Worker
  const updateServiceWorker = useCallback(async () => {
    if (!state.registration?.waiting) return;

    // Enviar mensagem para pular waiting
    state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    setState(prev => ({ ...prev, hasUpdate: false }));
  }, [state.registration]);

  // Limpar cache
  const clearCache = useCallback(async () => {
    if (!state.registration) return false;

    try {
      const messageChannel = new MessageChannel();
      
      return new Promise<boolean>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.success);
        };

        state.registration!.active?.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  }, [state.registration]);

  // Listeners para status online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

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

  return {
    // Estado
    ...state,
    isOnline,
    
    // Ações
    register,
    updateServiceWorker,
    clearCache,
    
    // Utilitários
    isOfflineCapable: state.isRegistered && state.isSupported,
  };
};

