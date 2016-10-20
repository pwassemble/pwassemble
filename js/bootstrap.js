/* global instanceLoader, manifestCreator, serviceWorkerInstaller, templateCreator */
(() => {
  let instance;
  let serviceWorkerRegistration;

  const body = document.body;
  const head = document.head;
  const fragment = document.createDocumentFragment();

  // Helper function for push notifications
  const setUpPushNotifications = () => {
    const title = instance.companyName;
    const options = {
      body: instance.ctaText.replace(/\+/g, ' '),
      icon: instance.iconImgId,
      vibrate: [200, 100, 200, 100, 200, 100, 400],
      actions: [
        {action: 'yes', title: 'Yes', icon: './img/yes.png'},
        {action: 'no', title: 'No', icon: './img/no.png'}
      ]
    };
    const imgs = document.querySelectorAll('img');
    const showNotification = () => {
      serviceWorkerRegistration.showNotification(title, options);
    };
    for (let i = 0, lenI = imgs.length; i < lenI; i++) {
      let img = imgs[i];
      img.addEventListener('click', showNotification);
    }
  };

  // Helper function to create various link tags for manifest and styles
  const createLink = (href, rel) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    return link;
  };

  instanceLoader.load()
  .then(instance_ => {
    instance = instance_;
    if (!Object.keys(instance).length) {
      return;
    }
    document.title = `PWAssemble—${instance.companyName.replace(/\+/g, ' ')}`;

    let cssText = [];
    for (let key in instance) {
      if (!{}.hasOwnProperty.call(instance, key)) {
        continue;
      }
      const value = instance[key];
      if (key === 'iconImgId') {
        head.appendChild(createLink(value, 'icon'));
      } else if ((key === 'colorBgPrimary' || (key === 'colorBgSecondary') ||
                 (key === 'colorFgPrimary') || (key === 'colorFgSecondary'))) {
        cssText.push(`--${key}: ${value};`);
      }
    }
    // Create global CSS
    if (cssText.length) {
      const cssUrl = URL.createObjectURL(new Blob(
          [`:root {\n${cssText.join('\n  ')}\n}`], {type: 'text/css'}));
      head.appendChild(createLink(cssUrl, 'stylesheet'));
    }
    // Create content
    const content = templateCreator.create(instance);
    head.appendChild(content.css);
    fragment.appendChild(content.html);
    // Create manifest
    const manifestObject = {
      name: instance.companyName.replace(/\+/g, ' '),
      shortName: instance.companyName.replace(/\+/g, ' '),
      iconSrc: instance.iconImgId,
      themeColor: instance.colorFgPrimary,
      backgroundColor: instance.colorBgPrimary,
      startUrl: `${location.origin}/?id=${instance.pwaInstanceId}`
    };
    const manifestUrl = URL.createObjectURL(new Blob(
      [manifestCreator.create(manifestObject)], {type: 'application/json'}));
    head.appendChild(createLink(manifestUrl, 'manifest'));
    body.appendChild(fragment);
  })
  .then(() => {
    return serviceWorkerInstaller.install();
  })
  .then(serviceWorkerRegistration_ => {
    serviceWorkerRegistration = serviceWorkerRegistration_;
    setUpPushNotifications(instance);
  })
  .catch(error => {
    throw error;
  });
})();
