const DEBUG_MODE = true;
const DEBUG_PREFIX = '👷';

const STATIC_CACHE_NAME = 'pwassemble-static-cache-v1';
const DYNAMIC_CACHE_NAME = 'pwassemble-dynamic-cache-v1';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/js/bootstrap.js',
  '/js/main.js',
  '/css/main.css',
  '/img/fallback.svg'
];

const addToCache = (request, networkResponse) => {
  const requestUrl = request.url;
  if (!/\/img\//.test(requestUrl)) {
    return;
  }
  if (DEBUG_MODE) {
    console.log(DEBUG_PREFIX, 'Adding to cache', requestUrl);
  }
  return caches.open(DYNAMIC_CACHE_NAME)
  .then(cache => {
    if (DEBUG_MODE) {
      console.log(DEBUG_PREFIX, 'Successfully added to cache', requestUrl);
    }
    return cache.put(request, networkResponse);
  }).catch(cacheError => {
    if (DEBUG_MODE) {
      console.log(DEBUG_PREFIX, 'Error adding to cache', requestUrl,
          cacheError);
    }
    return Promise.reject(cacheError);
  });
};

const getCacheResponse = request => {
  const requestUrl = request.url;
  if (DEBUG_MODE) {
    console.log(DEBUG_PREFIX, 'Fetching from cache', requestUrl);
  }
  return caches.match(request)
  .then(cacheResponse => {
    if (!cacheResponse) {
      throw Error(requestUrl);
    }
    if (DEBUG_MODE) {
      console.log(DEBUG_PREFIX, 'Successfully fetched from cache', requestUrl);
    }
    return cacheResponse;
  }).catch(cacheError => {
    if (DEBUG_MODE) {
      console.log(DEBUG_PREFIX, 'Error fetching from cache', requestUrl);
    }
    return Promise.reject(cacheError);
  });
};

const getNetworkResponse = request => {
  const requestUrl = request.url;
  if (DEBUG_MODE) {
    console.log(DEBUG_PREFIX, 'Getting from network', requestUrl);
  }
  let options = {};
  if ((new URL(requestUrl).host !== self.location.host) &&
      (new URL(requestUrl).host !== 'firebasestorage.googleapis.com')) {
    options.mode = 'no-cors';
  }
  /*
  if (new URL(requestUrl).host === 'firebasestorage.googleapis.com') {
    options.mode = 'cors';
    let newRequest = new Request(requestUrl, options);
    request = newRequest;
  }*/
  return fetch(request, options)
  .then(networkResponse => {
    console.log(request)
    console.log(networkResponse);
    if (networkResponse.type !== 'opaque' && !networkResponse.ok) {
      throw Error(networkResponse.ok + ' => ' + requestUrl);
    }
    if (DEBUG_MODE) {
      console.log(DEBUG_PREFIX, 'Successfully fetched from network',
          requestUrl);
    }
    return networkResponse;
  }).catch(networkError => {
    console.log('networkError')
    console.log(networkError)
    if (DEBUG_MODE) {
      console.log(DEBUG_PREFIX, 'Error fetching from network', requestUrl);
    }
    return Promise.reject(networkError);
  });
};

const getNetworkFirstResponse = request => {
  return getNetworkResponse(request)
  .then(networkResponse => {
    addToCache(request, networkResponse.clone());
    return networkResponse;
  }).catch(() => {
    return getCacheResponse(request)
    .catch(cacheMatchError => cacheMatchError);
  });
};

const getCacheFirstResponse = request => {
  return getCacheResponse(request)
  .catch(() => {
    return getNetworkResponse(request)
    .then(networkResponse => {
      addToCache(request, networkResponse.clone());
      return networkResponse;
    }).catch(networkError => networkError);
  });
};

self.addEventListener('install', installEvent => {
  if (DEBUG_MODE) {
    console.log(DEBUG_PREFIX, 'Installed Service Worker');
  }
  installEvent.waitUntil(caches.open(STATIC_CACHE_NAME)
  .then(cache => {
    if (DEBUG_MODE) {
      console.log(DEBUG_PREFIX, 'Caching app shell in', STATIC_CACHE_NAME,
          STATIC_FILES.map((f, i) => {
            return `\n\t(${i})\t→ ${f}`;
          }).join(''));
    }
    return cache.addAll(STATIC_FILES);
  }).then(() => {
    if (DEBUG_MODE) {
      console.log(DEBUG_PREFIX, 'Skip waiting on install');
    }
    return self.skipWaiting();
  }));
});

self.addEventListener('activate', activateEvent => {
  if (DEBUG_MODE) {
    console.log(DEBUG_PREFIX, 'Activated Service Worker');
  }
  activateEvent.waitUntil(caches.keys()
  .then(keyList => {
    return Promise.all(keyList.map(key => {
      if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
        if (DEBUG_MODE) {
          console.log(DEBUG_PREFIX, 'Removing old cache', key);
        }
        return caches.delete(key);
      }
      return true;
    }));
  }).then(() => {
    if (DEBUG_MODE) {
      console.log(DEBUG_PREFIX, 'Claiming clients');
    }
    return self.clients.claim();
  }));
});

self.addEventListener('fetch', fetchEvent => {
  const requestUrl = fetchEvent.request.url;
  if (/\/img\//.test(requestUrl)) {
    if (DEBUG_MODE) {
      console.log(DEBUG_PREFIX, 'Fetch cache first', requestUrl);
    }
    fetchEvent.respondWith(getCacheFirstResponse(fetchEvent.request));
    return;
  }
  if (DEBUG_MODE) {
    console.log(DEBUG_PREFIX, 'Fetch network first', requestUrl);
  }
  fetchEvent.respondWith(getNetworkFirstResponse(fetchEvent.request));
  return;
});

self.addEventListener('push', pushEvent => {
  if (DEBUG_MODE) {
    console.log(DEBUG_PREFIX, 'Push message');
  }
  pushEvent.waitUntil(fetch('push-message.json')
  .then(fetchResponse => fetchResponse.json())
  .then(pushMessage => {
    self.registration.showNotification(pushMessage.title, pushMessage.message);
  }).catch(() => {
    self.registration.showNotification('New push notification');
  }));
});

self.addEventListener('sync', function(syncEvent) {
  if (DEBUG_MODE) {
    console.log(DEBUG_PREFIX, 'Sync event');
  }
  syncEvent.waitUntil(() => {
    return getNetworkResponse(new Request(
        'http://www.apple.com/library/test/success.html'));
  });
});
