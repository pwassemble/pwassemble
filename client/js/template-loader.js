((PWASSEMBLE) => {
  PWASSEMBLE.templateLoader = {
    create() {
      let pushNotificationsCheckbox;
      let pushNotificationsLabel;
      let pushNotificationsToggle;

      const updatePushNotificationsCheckbox = () => {
        if (!('Notification' in window)) {
          return;
        }
        if (Notification.permission === 'denied') {
          pushNotificationsLabel.textContent = 'Notifications blocked';
          pushNotificationsCheckbox.disabled = true;
          return;
        }
        if (PWASSEMBLE.isSubscribed) {
          pushNotificationsCheckbox.checked = true;
          if (PWASSEMBLE.DEBUG_MODE) {
            console.log(PWASSEMBLE.DEBUG_PREFIX,
                'User is subscribed to push notifications');
          }
          pushNotificationsLabel.textContent = 'Notifications on';
        } else {
          pushNotificationsCheckbox.checked = false;
          if (PWASSEMBLE.DEBUG_MODE) {
            console.log(PWASSEMBLE.DEBUG_PREFIX,
                'User not subscribed to push notifications');
          }
          pushNotificationsLabel.textContent = 'Notifications off';
        }
        pushNotificationsCheckbox.disabled = false;
      };

      const optInPushNotifications = () => {
        const GCM_API_URL = 'https://android.googleapis.com/gcm/send/';
        if (PWASSEMBLE.DEBUG_MODE) {
          console.log(PWASSEMBLE.DEBUG_PREFIX,
              'Subscribing to push notifications');
        }
        return PWASSEMBLE.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
        })
        .then((subscription) => {
          const endpoint = subscription.endpoint.replace(GCM_API_URL, '');
          if (PWASSEMBLE.DEBUG_MODE) {
            console.log(PWASSEMBLE.DEBUG_PREFIX,
                'Subscribed to push notifications at endpoint', endpoint);
          }
          PWASSEMBLE.isSubscribed = true;
          return updatePushNotificationsCheckbox();
        })
        .catch((subscriptionError) => {
          if (PWASSEMBLE.DEBUG_MODE) {
            console.log(PWASSEMBLE.DEBUG_PREFIX,
                'Could not subscribe to push notifications', subscriptionError);
          }
          pushNotificationsCheckbox.disabled = false;
        });
      };

      const optOutPushNotifications = () => {
        PWASSEMBLE.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
        })
        .then((subscription) => {
          if (subscription) {
            return subscription.unsubscribe();
          }
        })
        .then(() => {
          console.log(PWASSEMBLE.DEBUG_PREFIX, 'User is unsubscribed.');
          PWASSEMBLE.isSubscribed = false;
          return updatePushNotificationsCheckbox();
        })
        .catch((error) => {
          console.log('Error unsubscribing', error);
        });
      };

      return Promise.all([
        fetch(`./templates/${PWASSEMBLE.instance.template}/main.min.html`)
          .then((response) => response.ok ? response.text() : '')
          // Remove comments (not the content, just the comment markers)
          .then((text) => text.replace(/<!--/g, '').replace(/-->/g, ''))
          // eslint-disable-next-line no-eval
          .then((text) => eval('`' + text + '`')),
        fetch(`./templates/${PWASSEMBLE.instance.template}/main.min.css`)
          .then((response) => response.ok ? response.text() : '')
          // eslint-disable-next-line no-eval
          .then((text) => eval('`' + text + '`')),
        fetch(`./templates/${PWASSEMBLE.instance.template}/main.min.js`)
          .then((response) => response.ok ? response.text() : ''),
      ])
      .then((results) => {
        // HTML container
        const html = document.createElement('div');
        html.id = 'container';
        html.innerHTML = results[0];
        if ('PushManager' in window) {
          // Push notifications
          pushNotificationsCheckbox = document.createElement('input');
          pushNotificationsCheckbox.type = 'checkbox';
          pushNotificationsCheckbox.id = 'pushNotificationsCheckbox';
          pushNotificationsLabel = document.createElement('label');
          pushNotificationsLabel.htmlFor = pushNotificationsCheckbox.id;
          pushNotificationsCheckbox.disabled = true;
          pushNotificationsToggle = document.createElement('div');
          pushNotificationsToggle.id = 'pushNotificationsToggle';
          pushNotificationsToggle.appendChild(pushNotificationsCheckbox);
          pushNotificationsToggle.appendChild(pushNotificationsLabel);
          html.appendChild(pushNotificationsToggle);
          pushNotificationsCheckbox.addEventListener('click', () => {
            pushNotificationsCheckbox.disabled = true;
            if (PWASSEMBLE.isSubscribed) {
              return optOutPushNotifications();
            }
            return optInPushNotifications();
          });
          updatePushNotificationsCheckbox();
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
          js: js,
        };
      })
      .catch((fetchError) => Promise.reject(fetchError));
    },
  };
})(window.PWASSEMBLE || {});
