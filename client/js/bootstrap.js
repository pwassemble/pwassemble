/* global instanceLoader, manifestCreator, serviceWorkerInstaller, templateLoader */
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
      body: instance.ctaText,
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

  instanceLoader.load()
  .then(instance_ => {
    instance = instance_;
    instance.companyName = instance.companyName.replace(/\+/g, ' ');
    instance.ctaText = instance.ctaText.replace(/\+/g, ' ');
    instance.heroText = instance.heroText.replace(/\+/g, ' ');
    instance.subText = instance.subText.replace(/\+/g, ' ');
    if (!Object.keys(instance).length) {
      return;
    }
    document.title = `PWAssemble—${instance.companyName}`;
    // Create manifest
    const manifestObject = {
      name: instance.companyName,
      shortName: instance.companyName,
      icon: instance.iconImgId,
      themeColor: instance.colorFgPrimary,
      backgroundColor: instance.colorBgPrimary,
      startUrl: `${location.origin}/?id=${instance.pwaInstanceId}`
    };
    const manifestUrl = URL.createObjectURL(new Blob(
        [manifestCreator.create(manifestObject)],
        {type: 'application/manifest+json'}));
    head.appendChild(createLink('manifest', manifestUrl));

    return serviceWorkerInstaller.install()
    .then(serviceWorkerRegistration_ => {
      serviceWorkerRegistration = serviceWorkerRegistration_;
    });
  })
  .then(() => {
    // Create global CSS
    let cssText = [];
    for (let key in instance) {
      if (!{}.hasOwnProperty.call(instance, key)) {
        continue;
      }
      const value = instance[key];
      if (key === 'iconImgId') {
        head.appendChild(createLink('icon', value));
        ['76', '120', '152'].map(size => {
          return head.appendChild(createLink('apple-touch-icon',
              `./assets?input=${value}&width=${size}&height=${size}`, size));
        });
      } else if ((key === 'colorBgPrimary' || (key === 'colorBgSecondary') ||
                 (key === 'colorFgPrimary') || (key === 'colorFgSecondary'))) {
        cssText.push(`--${key}: ${value};`);
      }
    }
    if (cssText.length) {
      const cssUrl = URL.createObjectURL(new Blob(
          [`:root {\n  ${cssText.join('\n  ')}\n}`], {type: 'text/css'}));
      head.appendChild(createLink('stylesheet', cssUrl));
    }
    head.appendChild(createMeta('apple-mobile-web-app-title',
        instance.companyName));

    // Create content
    return templateLoader.create(instance);
  })
  .then(content => {
    fragment.appendChild(content.html);
    body.appendChild(fragment);
    head.appendChild(content.css);
    head.appendChild(content.js);
    body.querySelector('.loading').remove();

    // Set up push notifications
    if (serviceWorkerRegistration) {
      setUpPushNotifications(instance);
    }
  })
  .catch(error => {
    throw error;
  });
})();
