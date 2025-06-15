// Define um nome e versão para o cache
const CACHE_NAME = 'defesa-base-v1';

// Lista de arquivos que serão armazenados em cache
const FILES_TO_CACHE = [
  '/',
  'index.html',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// Evento de instalação do Service Worker
self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Instalando...');
  
  // Aguarda até que o cache seja aberto e todos os arquivos sejam adicionados
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pré-cache de arquivos da aplicação');
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Evento de ativação do Service Worker
self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Ativando...');
  
  // Remove caches antigos que não estão na lista de permissões
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removendo cache antigo', key);
          return caches.delete(key);
        }
      }));
    })
  );

  self.clients.claim();
});

// Evento de fetch (intercepta as requisições de rede)
self.addEventListener('fetch', (evt) => {
  console.log('[ServiceWorker] Fetching:', evt.request.url);
  
  // Estratégia: Cache-First. Tenta servir do cache primeiro.
  // Se não encontrar no cache, busca na rede.
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request)
        .then((response) => {
          return response || fetch(evt.request);
        });
    })
  );
});