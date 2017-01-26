var PWASSEMBLE = window.PWASSEMBLE || {};
PWASSEMBLE.serviceWorkerInstaller = {
  install() {
    if (!('serviceWorker' in navigator)) {
      return Promise.resolve(false);
    }
    // Register the Service Worker
    return navigator.serviceWorker.register('service-worker.min.js')
    .then(serviceWorkerRegistration_ => {
      return navigator.serviceWorker.ready
      .then(function(serviceWorkerRegistration_) {
        PWASSEMBLE.serviceWorkerRegistration = serviceWorkerRegistration_;
        if (PWASSEMBLE.DEBUG_MODE) {
          console.log(PWASSEMBLE.DEBUG_PREFIX,
              'Service Worker registered for scope',
              PWASSEMBLE.serviceWorkerRegistration.scope);
        }
        return PWASSEMBLE.serviceWorkerRegistration;
      });
    })
    .then(() => {
      if (navigator.serviceWorker.controller) {
        const url = location.href;
        const messageChannel = new MessageChannel();
        if (PWASSEMBLE.DEBUG_MODE) {
          console.log(PWASSEMBLE.DEBUG_PREFIX, 'Caching', url);
        }
        return navigator.serviceWorker.controller.postMessage({
          command: 'cache-self',
          url: url
        }, [messageChannel.port2]);
      }
      return true;
    })
    // Register for sync events
    .then(() => {
      console.log(PWASSEMBLE.DEBUG_PREFIX, 'Registering for sync events');
      if ('sync' in PWASSEMBLE.serviceWorkerRegistration) {
        return PWASSEMBLE.serviceWorkerRegistration.sync.register('sync')
        .then(() => {
          if (PWASSEMBLE.DEBUG_MODE) {
            console.log(PWASSEMBLE.DEBUG_PREFIX, 'Registered for sync events');
          }
          return PWASSEMBLE.serviceWorkerRegistration;
        });
      }
      return PWASSEMBLE.serviceWorkerRegistration;
    })
    // Subscribe to Push Notifications
    .then(() => {
      if (!('PushManager' in window)) {
        if (PWASSEMBLE.DEBUG_MODE) {
          console.log(PWASSEMBLE.DEBUG_PREFIX,
              'Push notifications not supported');
        }
        return PWASSEMBLE.serviceWorkerRegistration;
      }
      return PWASSEMBLE.serviceWorkerRegistration.pushManager.getSubscription()
      .then(subscription => {
        if (subscription) {
          PWASSEMBLE.isSubscribed = true;
        } else {
          PWASSEMBLE.isSubscribed = false;
        }
        if (PWASSEMBLE.DEBUG_MODE) {
          console.log(PWASSEMBLE.DEBUG_PREFIX, 'Push notifications',
              PWASSEMBLE.isSubscribed ? 'enabled' : 'not enabled');
        }
        return PWASSEMBLE.serviceWorkerRegistration;
      });
    })
    .catch(err => {
      if (PWASSEMBLE.DEBUG_MODE) {
        console.error(PWASSEMBLE.DEBUG_PREFIX, err);
      }
    });
  }
};
