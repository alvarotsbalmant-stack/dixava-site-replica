// Service Worker Simplificado para UTI Gamer Shop
// Versão: 1.0.0

const CACHE_NAME = 'uti-gamer-v1';
const STATIC_CACHE_NAME = 'uti-static-v1';
const IMAGE_CACHE_NAME = 'uti-images-v1';

// Assets críticos para cache
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Install failed:', error);
      })
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
              cacheName !== IMAGE_CACHE_NAME &&
              cacheName !== CACHE_NAME
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Tomar controle
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

  // Ignorar requisições de API do Supabase (sempre buscar dados frescos)
  if (url.hostname.includes('supabase')) {
    return;
  }

  // Estratégia para diferentes tipos de recursos
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME));
  } else if (isImage(request.url)) {
    event.respondWith(staleWhileRevalidateStrategy(request, IMAGE_CACHE_NAME));
  } else if (isDocument(request)) {
    event.respondWith(networkFirstStrategy(request, CACHE_NAME));
  }
});

// Verificar se é asset estático
function isStaticAsset(url) {
  return /\.(js|css|woff|woff2|ttf|eot|ico)$/.test(url) || 
         url.includes('/assets/') ||
         url.includes('/static/');
}

// Verificar se é imagem
function isImage(url) {
  return /\.(png|jpg|jpeg|gif|webp|avif|svg)$/.test(url) ||
         url.includes('lovable-uploads') ||
         url.includes('images');
}

// Verificar se é documento
function isDocument(request) {
  return request.destination === 'document' || 
         request.headers.get('accept')?.includes('text/html');
}

// Cache First - Para assets estáticos
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First - Para documentos HTML
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate - Para imagens
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Buscar na rede em background
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Ignorar erros de rede
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

// Mensagens do cliente
self.addEventListener('message', (event) => {
  const { type } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
      break;
      
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Limpar todos os caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[SW] All caches cleared');
    return true;
  } catch (error) {
    console.error('[SW] Error clearing caches:', error);
    return false;
  }
}

console.log('[SW] Service Worker loaded successfully');

