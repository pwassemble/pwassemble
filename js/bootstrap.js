/* global instanceLoader, manifestCreator, serviceWorkerInstaller */
(() => {
  let instance;
  let serviceWorkerRegistration;

  const body = document.body;
  const head = document.head;

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
  // Helper functions for creating HTML elements
  const createElement = (tagName, key, value) => {
    const elem = document.createElement(tagName);
    elem.classList.add(key);
    elem.textContent = value.replace(/\+/g, ' ');
    body.appendChild(elem);
  };
  const createImg = (key, value) => {
    const elem = document.createElement('img');
    elem.classList.add([key, 'img--blur']);
    elem.src = value;
    body.appendChild(elem);
  };
  const createFavicon = value => {
    const elem = document.createElement('link');
    elem.rel = 'icon';
    elem.href = value;
    head.appendChild(elem);
  };
  const createCss = value => {
    const elem = document.createElement('link');
    elem.rel = 'stylesheet';
    elem.href = value;
    head.appendChild(elem);
  };
  const createManifest = value => {
    const elem = document.createElement('link');
    elem.rel = 'manifest';
    elem.href = value;
    head.appendChild(elem);
  };

  instanceLoader.load()
  .then(instance_ => {
    instance = instance_;
    if (!Object.keys(instance).length) {
      return;
    }
    document.title = instance.companyName;
    let cssText = [];

    for (let key in instance) {
      if (!{}.hasOwnProperty.call(instance, key)) {
        continue;
      }
      const value = instance[key];
      if (key === 'companyName') {
        createElement('h1', key, value);
      } else if (key === 'ctaText') {
        createElement('h2', key, value);
      } else if (key === 'heroText') {
        createElement('h3', key, value);
      } else if (key === 'subText') {
        createElement('h4', key, value);
      } else if (key === 'companyLogoImgId') {
        createImg(key, value);
      } else if (key === 'heroImgId') {
        createImg(key, value);
      } else if (key === 'iconImgId') {
        createFavicon(value);
      } else if ((key === 'colorBgPrimary' || (key === 'colorBgSecondary') ||
                 (key === 'colorFgPrimary') || (key === 'colorFgSecondary'))) {
        cssText.push(`--${key}: ${value};`);
      }
    }
    // Create CSS
    if (cssText.length) {
      const cssUrl = URL.createObjectURL(new Blob(
          [`:root {\n${cssText.join('\n  ')}\n}`], {type: 'text/css'}));
      createCss(cssUrl);
    }
    // Create manifest
    const manifestObject = {
      name: instance.companyName,
      shortName: instance.companyName,
      iconSrc: instance.iconImgId,
      themeColor: instance.colorFgPrimary,
      backgroundColor: instance.colorBgPrimary,
      startUrl: `${location.origin}/?id=${instance.pwaInstanceId}`
    };
    const manifestUrl = URL.createObjectURL(new Blob(
      [manifestCreator.create(manifestObject)], {type: 'application/json'}));
    createManifest(manifestUrl);
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

// Simulate slow image loading
(() => {
  const imgs = document.querySelectorAll('img');
  for (let i = 0, lenI = imgs.length; i < lenI; i++) {
    let img = imgs[i];
    setTimeout(() => {
      img.classList.remove('img--blur');
      img.src = img.dataset.src;
    }, Math.random() * 3000);
  }
})();
