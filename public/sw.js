// Service Worker para UTI Gamer Shop
// Versão: 1.0.0

const CACHE_NAME = 'uti-gamer-shop-v1';
const STATIC_CACHE_NAME = 'uti-static-v1';
const DYNAMIC_CACHE_NAME = 'uti-dynamic-v1';
const IMAGE_CACHE_NAME = 'uti-images-v1';
const API_CACHE_NAME = 'uti-api-v1';

// Assets estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  // CSS e JS serão adicionados automaticamente pelo Vite
];

// Padrões de URL para diferentes estratégias de cache
const CACHE_STRATEGIES = {
  // Cache First - Assets estáticos
  CACHE_FIRST: [
    /\.(js|css|woff|woff2|ttf|eot)$/,
    /\/assets\//,
    /\/static\//,
  ],
  
  // Network First - HTML e dados dinâmicos
  NETWORK_FIRST: [
    /\/api\//,
    /\.html$/,
    /\/$/,
  ],
  
  // Stale While Revalidate - Imagens e recursos
  STALE_WHILE_REVALIDATE: [
    /\.(png|jpg|jpeg|gif|webp|avif|svg|ico)$/,
    /lovable-uploads/,
    /supabase/,
  ],
  
  // Network Only - Autenticação e operações críticas
  NETWORK_ONLY: [
    /\/auth\//,
    /\/login/,
    /\/logout/,
    /\/admin/,
  ],
};

// Configurações de cache
const CACHE_CONFIG = {
  maxAge: {
    static: 30 * 24 * 60 * 60 * 1000, // 30 dias
    dynamic: 7 * 24 * 60 * 60 * 1000,  // 7 dias
    images: 14 * 24 * 60 * 60 * 1000,  // 14 dias
    api: 5 * 60 * 1000,                // 5 minutos
  },
  maxEntries: {
    dynamic: 50,
    images: 100,
    api: 30,
  },
};

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache assets estáticos
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Pular waiting para ativar imediatamente
      self.skipWaiting(),
    ])
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== IMAGE_CACHE_NAME &&
              cacheName !== API_CACHE_NAME
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Tomar controle de todas as abas
      self.clients.claim(),
    ])
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Determinar estratégia de cache
  const strategy = determineStrategy(request.url);
  
  switch (strategy) {
    case 'CACHE_FIRST':
      event.respondWith(cacheFirst(request));
      break;
      
    case 'NETWORK_FIRST':
      event.respondWith(networkFirst(request));
      break;
      
    case 'STALE_WHILE_REVALIDATE':
      event.respondWith(staleWhileRevalidate(request));
      break;
      
    case 'NETWORK_ONLY':
      event.respondWith(networkOnly(request));
      break;
      
    default:
      event.respondWith(networkFirst(request));
  }
});

// Determinar estratégia baseada na URL
function determineStrategy(url) {
  for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
    if (patterns.some(pattern => pattern.test(url))) {
      return strategy;
    }
  }
  return 'NETWORK_FIRST';
}

// Cache First - Busca no cache primeiro, rede como fallback
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First - Busca na rede primeiro, cache como fallback
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      
      // Limpar cache antigo
      cleanupCache(DYNAMIC_CACHE_NAME, CACHE_CONFIG.maxEntries.dynamic);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para página offline
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate - Retorna cache e atualiza em background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Buscar na rede em background
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      cleanupCache(IMAGE_CACHE_NAME, CACHE_CONFIG.maxEntries.images);
    }
    return networkResponse;
  }).catch(() => {
    // Ignorar erros de rede silenciosamente
  });
  
  // Retornar cache imediatamente se disponível
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Se não há cache, aguardar rede
  try {
    return await networkPromise;
  } catch (error) {
    return new Response('Image not available', { status: 503 });
  }
}

// Network Only - Sempre buscar na rede
async function networkOnly(request) {
  return fetch(request);
}

// Limpar cache antigo baseado no número máximo de entradas
async function cleanupCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxEntries) {
    const keysToDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Limpar cache baseado na idade
async function cleanupExpiredCache() {
  const cacheConfigs = [
    { name: STATIC_CACHE_NAME, maxAge: CACHE_CONFIG.maxAge.static },
    { name: DYNAMIC_CACHE_NAME, maxAge: CACHE_CONFIG.maxAge.dynamic },
    { name: IMAGE_CACHE_NAME, maxAge: CACHE_CONFIG.maxAge.images },
    { name: API_CACHE_NAME, maxAge: CACHE_CONFIG.maxAge.api },
  ];
  
  for (const config of cacheConfigs) {
    try {
      const cache = await caches.open(config.name);
      const keys = await cache.keys();
      const now = Date.now();
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const dateHeader = response.headers.get('date');
          if (dateHeader) {
            const responseDate = new Date(dateHeader).getTime();
            if (now - responseDate > config.maxAge) {
              await cache.delete(request);
            }
          }
        }
      }
    } catch (error) {
      console.error('[SW] Error cleaning cache:', config.name, error);
    }
  }
}

// Executar limpeza periodicamente
setInterval(cleanupExpiredCache, 60 * 60 * 1000); // A cada hora

// Mensagens do cliente
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'CACHE_STATS':
      getCacheStats().then((stats) => {
        event.ports[0].postMessage(stats);
      });
      break;
      
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Limpar todos os caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
}

// Obter estatísticas do cache
async function getCacheStats() {
  const stats = {};
  const cacheNames = await caches.keys();
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    stats[name] = keys.length;
  }
  
  return stats;
}

// Notificar sobre atualizações
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // Verificar se há uma nova versão
    self.registration.update().then(() => {
      event.ports[0].postMessage({ hasUpdate: true });
    });
  }
});

console.log('[SW] Service Worker loaded successfully');

