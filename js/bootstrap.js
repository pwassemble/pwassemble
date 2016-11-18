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
  const createLink = (href, rel) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    return link;
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
      icons: [{
        src: instance.iconImgId,
        sizes: '',
        type: ''
      }],
      themeColor: instance.colorFgPrimary,
      backgroundColor: instance.colorBgPrimary,
      // Add "pwassemble" for GitHub pages
      startUrl: `${location.origin}/pwassemble/?id=${instance.pwaInstanceId}`
    };
    const manifestUrl = URL.createObjectURL(new Blob(
        [manifestCreator.create(manifestObject)],
        {type: 'application/manifest+json'}));
    head.appendChild(createLink(manifestUrl, 'manifest'));

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
        head.appendChild(createLink(value, 'icon'));
      } else if ((key === 'colorBgPrimary' || (key === 'colorBgSecondary') ||
                 (key === 'colorFgPrimary') || (key === 'colorFgSecondary'))) {
        cssText.push(`--${key}: ${value};`);
      }
    }
    if (cssText.length) {
      const cssUrl = URL.createObjectURL(new Blob(
          [`:root {\n  ${cssText.join('\n  ')}\n}`], {type: 'text/css'}));
      head.appendChild(createLink(cssUrl, 'stylesheet'));
    }

    // Create content
    return templateLoader.create(instance);
  })
  .then(content => {
    head.appendChild(content.css);
    head.appendChild(content.js);
    fragment.appendChild(content.html);
    body.querySelector('.loading').remove();
    body.appendChild(fragment);

    // Set up push notifications
    if (serviceWorkerRegistration) {
      setUpPushNotifications(instance);
    }
  })
  .catch(error => {
    throw error;
  });
})();
