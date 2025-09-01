import { useEffect } from 'react';

interface ResourceHint {
  href: string;
  as?: string;
  type?: string;
  crossorigin?: boolean;
}

/**
 * Hook para adicionar resource hints dinamicamente
 * Usado para preload de recursos críticos baseado no contexto da página
 */
export const useResourceHints = () => {
  const addResourceHint = (type: 'preload' | 'prefetch' | 'preconnect', options: ResourceHint) => {
    // Verifica se o link já existe
    const existingLink = document.querySelector(`link[href="${options.href}"]`);
    if (existingLink) return;

    const link = document.createElement('link');
    link.rel = type;
    link.href = options.href;
    
    if (options.as) link.as = options.as;
    if (options.type) link.type = options.type;
    if (options.crossorigin) link.crossOrigin = 'anonymous';

    document.head.appendChild(link);
  };

  const preloadCriticalImages = (imageUrls: string[]) => {
    imageUrls.forEach(url => {
      addResourceHint('preload', {
        href: url,
        as: 'image',
        type: url.includes('.webp') ? 'image/webp' : 'image/jpeg',
      });
    });
  };

  const preconnectToOrigins = (origins: string[]) => {
    origins.forEach(origin => {
      addResourceHint('preconnect', {
        href: origin,
        crossorigin: true,
      });
    });
  };

  const prefetchNextPageResources = (resourceUrls: string[]) => {
    resourceUrls.forEach(url => {
      addResourceHint('prefetch', {
        href: url,
        as: 'fetch',
      });
    });
  };

  return {
    addResourceHint,
    preloadCriticalImages,
    preconnectToOrigins,
    prefetchNextPageResources,
  };
};

/**
 * Hook para preload automático de recursos da página
 */
export const usePageResourcePreload = (pageName: string) => {
  const { preloadCriticalImages, preconnectToOrigins } = useResourceHints();

  useEffect(() => {
    const preloadStrategies = {
      home: () => {
        // Preload imagens críticas da homepage
        preloadCriticalImages([
          '/lovable-uploads/a514a032-d79a-4bc4-a10e-3c9f0f9cde73.png',
          '/lovable-uploads/ad4a0480-9a16-4bb6-844b-c579c660c65d.png',
        ]);
        
        // Preconnect para origins de imagens
        preconnectToOrigins([
          'https://images.unsplash.com',
          'https://upload.wikimedia.org',
        ]);
      },
      
      product: () => {
        // Preload placeholder images para produtos
        preloadCriticalImages([
          '/placeholder-image.webp',
          '/placeholder-image-error.webp',
        ]);
      },
      
      category: () => {
        // Preload imagens de categoria
        preloadCriticalImages([
          '/placeholder.svg',
        ]);
      },
      
      admin: () => {
        // Preload recursos do admin
        preloadCriticalImages([
          '/lovable-uploads/ad4a0480-9a16-4bb6-844b-c579c660c65d.png',
        ]);
      },
    };

    const strategy = preloadStrategies[pageName as keyof typeof preloadStrategies];
    if (strategy) {
      // Use requestIdleCallback se disponível
      if ('requestIdleCallback' in window) {
        requestIdleCallback(strategy);
      } else {
        setTimeout(strategy, 100);
      }
    }
  }, [pageName, preloadCriticalImages, preconnectToOrigins]);
};