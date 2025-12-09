// Service Worker para sistema offline-first
// Este arquivo permite que o app funcione sem conexão com internet

const CACHE_NAME = 'h2map-transport-v1.0.0';
const CACHE_RUNTIME = 'h2map-runtime-v1.0.0';

// Recursos para cache durante a instalação
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/src/main.tsx',
    '/src/App.tsx',
    '/src/pages/ViabilidadeTransporte.tsx',
    '/data/tolls.json',
    '/data/geocoding.json',
    // Adicionar tiles e outros recursos estáticos aqui
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Pré-cacheando recursos');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Ativando...');

    const currentCaches = [CACHE_NAME, CACHE_RUNTIME];

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map((cacheToDelete) => {
                        console.log('[Service Worker] Deletando cache antigo:', cacheToDelete);
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Estratégia de cache: Network First com fallback para Cache
self.addEventListener('fetch', (event) => {
    // Ignorar requisições não-GET
    if (event.request.method !== 'GET') return;

    // Ignorar requisições de chrome-extension
    if (event.request.url.startsWith('chrome-extension://')) return;

    // Ignorar requisições de webpack HMR (desenvolvimento)
    if (event.request.url.includes('webpack') || event.request.url.includes('hot-update')) {
        return;
    }

    const url = new URL(event.request.url);

    // Estratégia diferente para diferentes tipos de recursos

    // 1. Tiles do mapa: Cache First (tiles não mudam)
    if (url.pathname.includes('/tiles/') || url.pathname.endsWith('.pmtiles') || url.pathname.endsWith('.mbtiles')) {
        event.respondWith(cacheFirst(event.request));
        return;
    }

    // 2. Dados locais (JSON): Cache First com revalidação em background
    if (url.pathname.endsWith('.json') && (url.pathname.includes('/data/'))) {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
    }

    // 3. API OSRM local: Network Only (sempre buscar rota atualizada)
    if (url.hostname === 'localhost' && url.port === '5000') {
        event.respondWith(networkOnly(event.request));
        return;
    }

    // 4. Recursos da aplicação: Network First (HTML, JS, CSS)
    event.respondWith(networkFirst(event.request));
});

// Estratégia: Cache First
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        console.log('[Service Worker] Cache hit:', request.url);
        return cached;
    }

    try {
        const response = await fetch(request);

        // Cachear se a resposta for válida
        if (response.status === 200) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);

        // Retornar resposta offline padrão
        return new Response('Offline - recurso não disponível', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estratégia: Network First
async function networkFirst(request) {
    const cache = await caches.open(CACHE_RUNTIME);

    try {
        const response = await fetch(request);

        // Cachear resposta válida
        if (response.status === 200) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[Service Worker] Network failed, tentando cache:', request.url);

        const cached = await cache.match(request);

        if (cached) {
            return cached;
        }

        // Fallback para página offline
        if (request.destination === 'document') {
            return caches.match('/offline.html') || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable'
            });
        }

        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    // Buscar nova versão em background
    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.status === 200) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => {
            console.log('[Service Worker] Background fetch failed');
        });

    // Retornar cache imediatamente, se disponível
    return cached || fetchPromise;
}

// Estratégia: Network Only
async function networkOnly(request) {
    try {
        return await fetch(request);
    } catch (error) {
        console.error('[Service Worker] Network only failed:', error);
        return new Response('Network error', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                console.log('[Service Worker] Cache limpo');
                return self.clients.matchAll();
            }).then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({ type: 'CACHE_CLEARED' });
                });
            })
        );
    }
});

// Background Sync (opcional - para sincronizar dados quando voltar online)
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-routes') {
        event.waitUntil(syncRoutes());
    }
});

async function syncRoutes() {
    console.log('[Service Worker] Sincronizando rotas...');
    // Implementar lógica de sincronização aqui
    // Por exemplo, enviar rotas salvas offline para o servidor quando voltar online
}

// Notificações (opcional)
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification click:', event.notification.tag);

    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});

console.log('[Service Worker] Carregado');
