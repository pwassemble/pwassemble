// Register Service Worker and sign up for push notifications
const installServiceWorker = () => {
  const DEBUG_MODE = true;
  const DEBUG_PREFIX = '🕸';
  const GCM_API_URL = 'https://android.googleapis.com/gcm/send/';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
    .then(serviceWorkerRegistration => {
      if (DEBUG_MODE) {
        console.log(DEBUG_PREFIX,
            'Service Worker registered for scope',
            serviceWorkerRegistration.scope);
      }
      return serviceWorkerRegistration;
    }).then(serviceWorkerRegistration => {
      console.log(DEBUG_PREFIX, 'Registering for sync events');
      if ('sync' in serviceWorkerRegistration) {
        return serviceWorkerRegistration.sync.register('sync')
        .then(() => {
          if (DEBUG_MODE) {
            console.log(DEBUG_PREFIX, 'Registered for sync events');
          }
          return serviceWorkerRegistration;
        });
      }
      return serviceWorkerRegistration;
    }).then(serviceWorkerRegistration => {
      const endpoint = localStorage.getItem('endpoint');
      if (localStorage.getItem('endpoint')) {
        if (DEBUG_MODE) {
          console.log(DEBUG_PREFIX,
              'Already subscribed to push notifications at endpoint', endpoint);
        }
        return endpoint;
      }
      if (DEBUG_MODE) {
        console.log(DEBUG_PREFIX,
            'Subscribing newly to push notifications at endpoint', endpoint);
      }
      return serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true
      });
    }).then(pushSubscription => {
      const endpoint = typeof pushSubscription === 'string' ?
          pushSubscription :
          pushSubscription.endpoint.replace(GCM_API_URL, '');
      return endpoint;
    }).then(endpoint => {
      localStorage.setItem('endpoint', endpoint);
    }).catch(err => {
      if (DEBUG_MODE) {
        console.warn(DEBUG_PREFIX, err);
      }
    });
  } else {
    console.log(DEBUG_PREFIX, 'Service Worker not supported');
  }
};
