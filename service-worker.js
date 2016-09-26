const DEBUG_MODE = true;
const DEBUG_PREFIX = '👷 [service-worker.js]';

const STATIC_CACHE_NAME = 'pwassemble-static-cache-v1';
const DYNAMIC_CACHE_NAME = 'pwassemble-dynamic-cache-v1';

const STATIC_FILES = [
  '/',
  '/index.html',
  'js/bootstrap.js',
  'js/main.js',
  'css/main.css',
  'img/placeholder.svg'
];

self.addEventListener('install', installEvent => {
  DEBUG_MODE && console.log(DEBUG_PREFIX, 'Installed Service Worker');
  installEvent.waitUntil(caches.open(STATIC_CACHE_NAME)
  .then(cache => {
    DEBUG_MODE && console.log(DEBUG_PREFIX, 'Caching app shell in',
        STATIC_CACHE_NAME, STATIC_FILES.map((f, i) => {
          return `\n\t(${i})\t→ ${f}`;
        }).join(''));
    return cache.addAll(STATIC_FILES);
  }).then(() => {
    DEBUG_MODE && console.log(DEBUG_PREFIX, 'Skip waiting on install');
    return self.skipWaiting();
  }));
});

self.addEventListener('activate', activateEvent => {
  DEBUG_MODE && console.log(DEBUG_PREFIX, 'Activate');
  activateEvent.waitUntil(caches.keys()
  .then(keyList => {
    return Promise.all(keyList.map(key => {
      if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
        DEBUG_MODE && console.log(DEBUG_PREFIX, 'Removing old cache', key);
        return caches.delete(key);
      }
    }));
  }));
  return self.clients.claim();
});

self.addEventListener('fetch', fetchEvent => {
  const requestUrl = fetchEvent.request.url;
  DEBUG_PREFIX && console.log(DEBUG_PREFIX, 'Fetch', requestUrl);
  fetchEvent.respondWith(caches.match(fetchEvent.request)
  .then(cacheResponse => {
    // Try cache first
    if (cacheResponse) {
      DEBUG_MODE && console.log(DEBUG_PREFIX, 'Cache hit for', requestUrl);
      return cacheResponse;
    }
    // Then try the network
    console.log(DEBUG_PREFIX, 'Cache miss for ', requestUrl);
    return fetch(fetchEvent.request)
    .then(networkResponse => {
      if (networkResponse.status !== 200) {
        return caches.match('img/placeholder.svg');
      }
      // Cache dynamically loaded files if they are located in /img
      if (/.+?\/img\//.test(requestUrl)) {
        DEBUG_MODE && console.log(DEBUG_PREFIX, 'Caching dynamic file',
            requestUrl, 'in', DYNAMIC_CACHE_NAME);
        return caches.open(DYNAMIC_CACHE_NAME)
        .then(cache => {
          cache.put(requestUrl, networkResponse.clone());
          return networkResponse;
        });
      }
      // Do not cache all other files
      DEBUG_MODE && console.log(DEBUG_PREFIX, 'Not caching', requestUrl);
      return networkResponse;
    }).catch(networkError => {
      console.warn(DEBUG_PREFIX, networkError);
      return networkResponse;
    });
  }).catch(cacheError => {
    if (/.*?\/img\//.test(requestUrl)) {
      console.warn(DEBUG_PREFIX, 'Returning fallback for', requestUrl,
          cacheError);
      return caches.match('img/placeholder.svg');
    }
  }));
});
