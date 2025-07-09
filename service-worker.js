// Nome do cache para controle de versão
const CACHE_NAME = 'wellness-app-cache-v1';

// Lista de arquivos essenciais para o funcionamento offline
// Inclua todos os arquivos HTML, CSS, JS e imagens que seu app precisa para funcionar offline
const urlsToCache = [
  '/', // A raiz do seu site
  '/index.html',
  '/manifest.json',
  // Placeholders para as imagens dos exercícios. Se você usar imagens reais, inclua-as aqui.
  'https://placehold.co/400x250/E0E7FF/4338CA?text=Agachamento',
  'https://placehold.co/400x250/E0E7FF/4338CA?text=Flexao',
  'https://placehold.co/400x250/E0E7FF/4338CA?text=Remada',
  'https://placehold.co/400x250/E0E7FF/4338CA?text=Prancha',
  'https://placehold.co/400x250/E0E7FF/4338CA?text=Afundo',
  'https://placehold.co/400x250/D1FAE5/065F46?text=The+Hundred',
  'https://placehold.co/400x250/D1FAE5/065F46?text=Bridge',
  'https://placehold.co/400x250/D1FAE5/065F46?text=Roll-up',
  'https://placehold.co/400x250/D1FAE5/065F46?text=Single+Leg+Stretch',
  'https://placehold.co/400x250/D1FAE5/065F46?text=Spine+Stretch',
  // Tailwind CSS CDN - é um recurso externo, mas pode ser cacheado
  'https://cdn.tailwindcss.com'
];

// Evento 'install': Disparado quando o Service Worker é instalado.
// Aqui, cacheamos os arquivos essenciais.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando arquivos essenciais.');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento 'fetch': Disparado toda vez que o navegador tenta buscar um recurso.
// Aqui, tentamos servir o recurso do cache primeiro, se disponível.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se o recurso estiver no cache, retorne-o
        if (response) {
          return response;
        }
        // Caso contrário, faça a requisição à rede
        return fetch(event.request)
          .then(networkResponse => {
            // Clona a resposta para que ela possa ser usada pelo cache e pelo navegador
            const responseClone = networkResponse.clone();
            // Tenta adicionar a resposta ao cache para futuras utilizações
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return networkResponse;
          })
          .catch(() => {
            // Se a requisição falhar (offline e não no cache), você pode retornar uma página offline
            // Por enquanto, apenas logamos o erro.
            console.log('Service Worker: Falha ao buscar recurso e não está no cache.', event.request.url);
            // Poderíamos retornar uma página offline aqui, se tivéssemos uma
            // return caches.match('/offline.html');
          });
      })
  );
});

// Evento 'activate': Disparado quando o Service Worker é ativado.
// Aqui, limpamos caches antigos para garantir que os usuários sempre tenham a versão mais recente.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deletando cache antigo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
