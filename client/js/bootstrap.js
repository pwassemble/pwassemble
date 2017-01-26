var PWASSEMBLE = window.PWASSEMBLE || {};
PWASSEMBLE = {
  DEBUG_MODE: true,
  DEBUG_PREFIX: '🕸',
  isSubscribed: null,
  instance: null,
  serviceWorkerRegistration: null
};

PWASSEMBLE.init = () => {
  const body = document.body;
  const head = document.head;
  const fragment = document.createDocumentFragment();

  // Helper function for push notifications
  const setUpPushNotifications = () => {
    const title = PWASSEMBLE.instance.companyName;
    const options = {
      body: PWASSEMBLE.instance.ctaText,
      icon: PWASSEMBLE.instance.iconImgId,
      vibrate: [200, 100, 200, 100, 200, 100, 400],
      actions: [
        {action: 'yes', title: 'Yes', icon: './static/yes.png'},
        {action: 'no', title: 'No', icon: './static/no.png'}
      ]
    };
    const imgs = document.querySelectorAll('img');
    const showNotification = () => {
      PWASSEMBLE.serviceWorkerRegistration.pushManager.getSubscription()
      .then(subscription => {
        if (subscription) {
          PWASSEMBLE.serviceWorkerRegistration.showNotification(title, options);
        } else {
          console.log(PWASSEMBLE.DEBUG_PREFIX,
              'Push notification permission not granted');
        }
      })
      .catch(notificationError => {
        if (PWASSEMBLE.DEBUG_MODE) {
          console.log(PWASSEMBLE.DEBUG_PREFIX,
              'Push notification permission not granted', notificationError);
        }
      });
    };
    for (let i = 0, lenI = imgs.length; i < lenI; i++) {
      imgs[i].addEventListener('click', showNotification);
    }
  };

  // Helper function to create various link tags for manifest and styles
  const createLink = (rel, href, sizes = false) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (sizes) {
      link.setAttribute('sizes', `${sizes}x${sizes}`);
    }
    return link;
  };
  // Helper function to create meta tags
  const createMeta = (name, content) => {
    const meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    return meta;
  };

  PWASSEMBLE.instanceLoader.load()
  .then(instance_ => {
    PWASSEMBLE.instance = instance_;
    PWASSEMBLE.instance.companyName = PWASSEMBLE.instance.companyName
        .replace(/\+/g, ' ');
    PWASSEMBLE.instance.ctaText = PWASSEMBLE.instance.ctaText
        .replace(/\+/g, ' ');
    PWASSEMBLE.instance.heroText = PWASSEMBLE.instance.heroText
        .replace(/\+/g, ' ');
    PWASSEMBLE.instance.subText = PWASSEMBLE.instance.subText
        .replace(/\+/g, ' ');
    if (!Object.keys(PWASSEMBLE.instance).length) {
      return;
    }
    document.title = `PWAssemble—${PWASSEMBLE.instance.companyName}`;
    // Create manifest
    const manifestObject = {
      name: PWASSEMBLE.instance.companyName,
      shortName: PWASSEMBLE.instance.companyName,
      icon: PWASSEMBLE.instance.iconImgId,
      themeColor: PWASSEMBLE.instance.colorFgPrimary,
      backgroundColor: PWASSEMBLE.instance.colorBgPrimary,
      startUrl: `${location.origin}/?id=${PWASSEMBLE.instance.pwaInstanceId}`
    };
    const manifestUrl = `${location.origin}/manifests?base64=${
        btoa(PWASSEMBLE.manifestCreator.create(manifestObject))}`;
    head.appendChild(createLink('manifest', manifestUrl));

    return PWASSEMBLE.serviceWorkerInstaller.install();
  })
  .then(() => {
    // Create global CSS
    let cssText = [];
    for (let key in PWASSEMBLE.instance) {
      if (!PWASSEMBLE.instance.hasOwnProperty(key)) {
        continue;
      }
      const value = PWASSEMBLE.instance[key];
      if (key === 'iconImgId') {
        head.appendChild(createLink('icon', value));
        ['76', '120', '152'].map(size => {
          return head.appendChild(createLink('apple-touch-icon',
              `./assets?url=${
              encodeURIComponent(value)}&width=${size}&height=${size}`, size));
        });
      } else if ((key === 'colorBgPrimary' || (key === 'colorBgSecondary') ||
                 (key === 'colorFgPrimary') || (key === 'colorFgSecondary'))) {
        cssText.push(`--${key}: ${value};`);
      }
    }
    if (cssText.length) {
      const cssUrl = `data:text/css;charset=utf-8;base64,${
          btoa(`:root {\n  ${cssText.join('\n  ')}\n}`)}`;

      head.appendChild(createLink('stylesheet', cssUrl));
    }
    head.appendChild(createMeta('apple-mobile-web-app-title',
        PWASSEMBLE.instance.companyName));

    // Create content
    return PWASSEMBLE.templateLoader.create();
  })
  .then(content => {
    fragment.appendChild(content.html);
    head.appendChild(content.css);
    body.appendChild(fragment);
    head.appendChild(content.js);
    body.querySelector('.loading').remove();

    // Set up push notifications
    if (PWASSEMBLE.serviceWorkerRegistration) {
      setUpPushNotifications(PWASSEMBLE.instance);
    }
  })
  .catch(error => {
    throw error;
  });
};
