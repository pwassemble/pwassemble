(PWASSEMBLE => {
  PWASSEMBLE.templateLoader = {
    create() {
      let pushNotificationsButton;

      const updatePushNotificationsButton = () => {
        if (!('Notification' in window)) {
          return;
        }
        if (Notification.permission === 'denied') {
          pushNotificationsButton.textContent = 'Push Messaging Blocked.';
          pushNotificationsButton.disabled = true;
          return;
        }
        if (PWASSEMBLE.isSubscribed) {
          if (PWASSEMBLE.DEBUG_MODE) {
            console.log(PWASSEMBLE.DEBUG_PREFIX,
                'User is subscribed to push notifications');
          }
          pushNotificationsButton.textContent = 'Disable Push Notifications';
        } else {
          if (PWASSEMBLE.DEBUG_MODE) {
            console.log(PWASSEMBLE.DEBUG_PREFIX,
                'User not subscribed to push notifications');
          }
          pushNotificationsButton.textContent = 'Enable Push Notifications';
        }
        pushNotificationsButton.disabled = false;
      };

      const optInPushNotifications = () => {
        const GCM_API_URL = 'https://android.googleapis.com/gcm/send/';
        if (PWASSEMBLE.DEBUG_MODE) {
          console.log(PWASSEMBLE.DEBUG_PREFIX,
              'Subscribing to push notifications');
        }
        return PWASSEMBLE.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true
        })
        .then(subscription => {
          const endpoint = subscription.endpoint.replace(GCM_API_URL, '');
          if (PWASSEMBLE.DEBUG_MODE) {
            console.log(PWASSEMBLE.DEBUG_PREFIX,
                'Subscribed to push notifications at endpoint', endpoint);
          }
          PWASSEMBLE.isSubscribed = true;
          return updatePushNotificationsButton();
        })
        .catch(subscriptionError => {
          if (PWASSEMBLE.DEBUG_MODE) {
            console.log(PWASSEMBLE.DEBUG_PREFIX,
                'Could not subscribe to push notifications', subscriptionError);
          }
          pushNotificationsButton.disabled = false;
        });
      };

      const optOutPushNotifications = () => {
        PWASSEMBLE.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true
        })
        .then(subscription => {
          if (subscription) {
            return subscription.unsubscribe();
          }
        })
        .then(() => {
          console.log(PWASSEMBLE.DEBUG_PREFIX, 'User is unsubscribed.');
          PWASSEMBLE.isSubscribed = false;
          return updatePushNotificationsButton();
        })
        .catch(error => {
          console.log('Error unsubscribing', error);
        });
      };

      return Promise.all([
        fetch(`./templates/${PWASSEMBLE.instance.template}/main.min.html`)
          .then(response => response.ok ? response.text() : '')
          // Remove comments (not the content, just the comment markers)
          .then(text => text.replace(/<!--/g, '').replace(/-->/g, ''))
          // eslint-disable-next-line no-eval
          .then(text => eval('`' + text + '`')),
        fetch(`./templates/${PWASSEMBLE.instance.template}/main.min.css`)
          .then(response => response.ok ? response.text() : '')
          // eslint-disable-next-line no-eval
          .then(text => eval('`' + text + '`')),
        fetch(`./templates/${PWASSEMBLE.instance.template}/main.min.js`)
          .then(response => response.ok ? response.text() : '')
      ])
      .then(results => {
        // HTML container
        const html = document.createElement('div');
        html.id = 'container';
        html.innerHTML = results[0];
        if ('PushManager' in window) {
          // Push notifications
          pushNotificationsButton = document.createElement('button');
          pushNotificationsButton.id = 'pushNotificationsButton';
          pushNotificationsButton.disabled = true;
          html.appendChild(pushNotificationsButton);
          pushNotificationsButton.addEventListener('click', () => {
            pushNotificationsButton.disabled = true;
            if (PWASSEMBLE.isSubscribed) {
              return optOutPushNotifications();
            }
            return optInPushNotifications();
          });
          updatePushNotificationsButton();
        }
        // CSS
        const style = document.createElement('style');
        style.textContent = results[1];
        // JavaScript
        const js = document.createElement('script');
        js.textContent = results[2];
        return {
          html: html,
          css: style,
          js: js
        };
      })
      .catch(fetchError => Promise.reject(fetchError));
    }
  };
})(window.PWASSEMBLE || {});
