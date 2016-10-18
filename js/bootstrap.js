(() => {
  loadInstance()
  .then(instance => {
    if (!Object.keys(instance).length) {
      return;
    }
    document.title = instance.companyName;
    const body = document.body;
    const head = document.head;
    let cssText = [];
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

    for (let key in instance) {
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
    };
    // Create manifest
    const name = instance.companyName;
    const shortName = instance.companyName;
    const iconSrc = instance.iconImgId;
    const themeColor = instance.colorFgPrimary;
    const backgroundColor = instance.colorBgPrimary;
    const startUrl = `${location.origin}/?id=${instance.pwaInstanceId}`;
    const manifestString = getManifest(name, shortName, iconSrc, themeColor,
        backgroundColor, startUrl);
    const manifestUrl = URL.createObjectURL(new Blob(
        [manifestString], {type: 'application/json'}));
    createManifest(manifestUrl);
  }).then(() => {
    installServiceWorker();
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
    //img.style.backgroundImage = `url(${img.dataset.src})`;
    setTimeout(() => {
      img.classList.remove('img--blur');
      // eslint-disable-next-line max-len
      //img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      img.src = img.dataset.src;
    }, Math.random() * 3000);
  }
})();

