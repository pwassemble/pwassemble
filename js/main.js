/* exported serviceWorkerInstaller */
// Register Service Worker and sign up for push notifications
window.serviceWorkerInstaller = {
  install() {
    const DEBUG_MODE = true;
    const DEBUG_PREFIX = '🕸';
    const GCM_API_URL = 'https://android.googleapis.com/gcm/send/';
    let serviceWorkerRegistration;

    if ('serviceWorker' in navigator) {
      return navigator.serviceWorker.register('service-worker.js')
      .then(serviceWorkerRegistration_ => {
        return navigator.serviceWorker.ready
        .then(function(serviceWorkerRegistration_) {
          serviceWorkerRegistration = serviceWorkerRegistration_;
          if (DEBUG_MODE) {
            console.log(DEBUG_PREFIX,
                'Service Worker registered for scope',
                serviceWorkerRegistration.scope);
          }
          return serviceWorkerRegistration;
        });
      })
      .then(() => {
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
      })
      .then(() => {
        const endpoint = localStorage.getItem('endpoint');
        if (endpoint) {
          return endpoint;
        }
        if (DEBUG_MODE) {
          console.log(DEBUG_PREFIX, 'Subscribing newly to push notifications');
        }
        return serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true
        });
      })
      .then(pushSubscription => {
        const endpoint = typeof pushSubscription === 'string' ?
            pushSubscription :
            pushSubscription.endpoint.replace(GCM_API_URL, '');
        if (DEBUG_MODE) {
          console.log(DEBUG_PREFIX,
              'Subscribed to push notifications at endpoint', endpoint);
        }
        return endpoint;
      })
      .then(endpoint => {
        localStorage.setItem('endpoint', endpoint);
        return serviceWorkerRegistration;
      })
      .catch(err => {
        if (DEBUG_MODE) {
          console.warn(DEBUG_PREFIX, err);
        }
      });
    }
  }
};
