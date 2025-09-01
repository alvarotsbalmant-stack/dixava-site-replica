// Service Worker Seguro - UTI Gamer Shop
// Apenas cache básico de assets estáticos, sem interferir em funcionalidades

const CACHE_NAME = 'uti-gamer-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  // Apenas assets críticos
];

// Install - cache apenas assets essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.log('Service Worker: Erro no cache:', error);
      })
  );
  self.skipWaiting();
});

// Activate - limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - estratégia muito conservadora
self.addEventListener('fetch', (event) => {
  // Apenas para GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar requests para APIs e dados dinâmicos
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('supabase') ||
    event.request.url.includes('auth') ||
    event.request.url.includes('realtime')
  ) {
    return;
  }

  // Cache apenas para assets estáticos (imagens, CSS, JS)
  if (
    event.request.url.includes('.css') ||
    event.request.url.includes('.js') ||
    event.request.url.includes('.png') ||
    event.request.url.includes('.jpg') ||
    event.request.url.includes('.jpeg') ||
    event.request.url.includes('.gif') ||
    event.request.url.includes('.svg') ||
    event.request.url.includes('.ico')
  ) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Se está no cache, retorna
          if (response) {
            return response;
          }
          
          // Senão, busca na rede e adiciona ao cache
          return fetch(event.request)
            .then((response) => {
              // Verifica se a resposta é válida
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clona a resposta
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            })
            .catch(() => {
              // Em caso de erro, tenta retornar do cache
              return caches.match(event.request);
            });
        })
    );
  }
});

