// Nome do cache para controle de versão
const CACHE_NAME = 'wellness-app-cache-v1';

// Lista de arquivos essenciais para o funcionamento offline
// INCLUA O CAMINHO DA SUBPASTA DO SEU REPOSITÓRIO AQUI
const urlsToCache = [
  '/app-bem-estar/', // A raiz do seu aplicativo na subpasta
  '/app-bem-estar/index.html',
  '/app-bem-estar/manifest.json',
  '/app-bem-estar/service-worker.js', // O próprio service worker
  // Placeholders para as imagens dos exercícios. Se você usar imagens reais, inclua-as aqui.
  // Note que as URLs de placehold.co são externas e NÃO precisam do prefixo /app-bem-estar/
  'https://placehold.co/400x250/E0E7FF/4338CA?text=Agachamento+Completo',
  'https://placehold.co/400x250/E0E7FF/4338CA?text=Flexao+de+Braco',
  'https://placehold.co/400x250/E0E7FF/4338CA?text=Remada+Curvada',
  'https://placehold.co/400x250/E0E7FF/4338CA?text=Prancha+Frontal',
  'https://placehold.co/400x250/E0E7FF/4338CA?text=Afundo+Alternado',
  'https://placehold.co/400x250/E0E7FF/4338CA?text=Polichinelos',
  'https://placehold.co/400x250/E0E7FF/4338CA?text=Corrida+no+Lugar',
  'https://placehold.co/400x250/E0E7FF/4338CA?text=Burpee',
  'https://placehold.co/400x250/E0E7FF/4338CA?text=Mountain+Climbers',
  'https://placehold.co/400x250/D1FAE5/065F46?text=Pilates:+The+Hundred',
  'https://placehold.co/400x250/D1FAE5/065F46?text=Pilates:+Bridge',
  'https://placehold.co/400x250/D1FAE5/065F46?text=Pilates:+Roll-up',
  'https://placehold.co/400x250/D1FAE5/065F46?text=Pilates:+Single+Leg+Stretch',
  'https://placehold.co/400x250/D1FAE5/065F46?text=Pilates:+Spine+Stretch',
  'https://placehold.co/400x250/D1FAE5/065F46?text=Fisio:+Gato-Camelo',
  'https://placehold.co/400x250/D1FAE5/065F46?text=Fisio:+Rotacao+Tronco',
  'https://placehold.co/400x250/D1FAE5/065F46?text=Fisio:+Joelho+ao+Peito',
  // REMOVIDO: 'https://cdn.tailwindcss.com' para evitar erro de CORS no cache
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
      .catch(error => {
        console.error('Service Worker: Falha ao cachear URLs durante a instalação:', error);
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
            // Clona a resposta APENAS se ela for válida para cache (ex: status 200 e não opaca)
            // Recursos de outras origens (CORS) podem ser "opacos" e não podem ser inspecionados ou cacheados facilmente.
            // Para simplificar, não vamos tentar cachear recursos externos que podem causar CORS aqui.
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Se a requisição falhar (offline e não no cache), você pode retornar uma página offline
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
