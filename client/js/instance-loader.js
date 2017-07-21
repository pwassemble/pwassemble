/* global idbKeyval */
((PWASSEMBLE) => {
  PWASSEMBLE.googleCloudStorageLoader = {
    load(id) {
      return fetch(`./proxy?url=${encodeURIComponent(
          `https://storage.googleapis.com/${id}/configuration.json?nocache=${
              Date.now()}`)}`,
          {cache: 'no-store'})
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw Error(`Retriving ${id} failed with ${response.statusText} ${
            response.status}`);
      })
      .catch((fetchError) => Promise.reject(fetchError));
    },
  },

  PWASSEMBLE.firebaseLoader = {
    load(id) {
      // Dynamically load the Firebase SDK
      return Promise.all(
        [
          'firebase-app.js',
          'firebase-database.js',
          'firebase-storage.js',
        ]
        .map((src) => {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.addEventListener('load', (e) => resolve(src));
            script.addEventListener('error', (e) => reject(src));
            script.src = `https://www.gstatic.com/firebasejs/3.6.1/${src}`;
            document.head.appendChild(script);
          });
        })
      )
      .then(() => {
        const config = {
          apiKey: 'AIzaSyCmQzeCh9nFg5SCwbfsPDkpigwat_fuW68',
          authDomain: 'pwassemble-1337.firebaseapp.com',
          databaseURL: 'https://pwassemble-1337.firebaseio.com',
          storageBucket: 'pwassemble-1337.appspot.com',
        };
        firebase.initializeApp(config);
        const db = firebase.database();
        const storage = firebase.storage();

        return db.ref(`/instances/${id}`)
        .once('value')
        .then((snapshot) => snapshot.val())
        .then((results) => {
          if (!results) {
            return Promise.reject(`Could not find instance ${id}`);
          }
          const promises = [Promise.resolve(results)];
          const dynamicComponents = [
            'companyLogoImgId',
            'heroImgId',
            'iconImgId',
          ];
          dynamicComponents.forEach((dynamicComponent) => {
            let dynamicKey = false;
            if ((dynamicComponent === 'companyLogoImgId') &&
                (results.companyLogoImgName)) {
              dynamicKey =
                  `${results[dynamicComponent]}.${results.companyLogoImgName
                  .split('.')[1]}`;
            } else if ((dynamicComponent === 'heroImgId') &&
                       (results.heroImgId)) {
              dynamicKey =
                  `${results[dynamicComponent]}.${results.heroImgName
                  .split('.')[1]}`;
            } else if ((dynamicComponent === 'iconImgId') &&
                       (results.iconImgId)) {
              dynamicKey =
                  `${results[dynamicComponent]}.${results.iconImgName
                  .split('.')[1]}`;
            }
            if (!dynamicKey) {
              return;
            }
            /* eslint-disable max-nested-callbacks */
            promises.push(
              storage.ref(dynamicKey).getDownloadURL()
              .then((url) => {
                return {
                  dynamicComponent,
                  dynamicKey,
                  url,
                };
              })
            );
            /* eslint-enable max-nested-callbacks */
          });
          return Promise.all(promises);
        })
        .then((results) => {
          let finalResults = results[0];
          results = results.slice(1);
          results.forEach((result) => {
            finalResults[result.dynamicComponent] = result.url;
          });
          if (PWASSEMBLE.DEBUG_MODE) {
            console.log(PWASSEMBLE.DEBUG_PREFIX,
                'Storing instance data to IndexedDB');
          }
          idbKeyval.set(id, finalResults);
          return Promise.resolve(finalResults);
        });
      });
    },
  },

  PWASSEMBLE.instanceLoader = {
    load() {
      return new Promise((resolve, reject) => {
        if (!location.search) {
          return reject(console.log('No query parameters'));
        }
        // Manually ignoring the leading '?', due to a bug in Samsung Internet:
        // https://github.com/SamsungInternet/support/issues/8
        const id = new URLSearchParams(location.search.replace(/^\?/, ''))
            .get('id');
        if (!id || (!/^\d+$/.test(id) && !/-/.test(id))) {
          return reject(console.log('No or invalid "id" parameter'));
        }
        if (PWASSEMBLE.DEBUG_MODE) {
          console.log(PWASSEMBLE.DEBUG_PREFIX, 'Instance ID', id);
        }
        idbKeyval.get(id)
        .then((instance) => {
          if (instance) {
            if (PWASSEMBLE.DEBUG_MODE) {
              console.log(PWASSEMBLE.DEBUG_PREFIX,
                  'Loading instance data from IndexedDB');
            }
            return resolve(instance);
          }

          if (/^\d+$/.test(id)) {
            return PWASSEMBLE.firebaseLoader.load(id);
          } else if (/-/.test(id)) {
            return PWASSEMBLE.googleCloudStorageLoader.load(id);
          }
        })
        .then((config) => {
          // Deal with legacy PWAssemble
          const adaptor = {
            colorBgPrimary: config.colorBgPrimary || config.primaryBgColor,
            colorBgSecondary:
                config.colorBgSecondary || config.secondaryBgColor,
            colorFgPrimary: config.colorFgPrimary || config.primaryFgColor,
            colorFgSecondary:
                config.colorFgSecondary || config.secondaryFgColor,
            companyLogoImgId:
                config.companyLogoImgId || config.companyLogoUrl,
            companyName: config.companyName,
            ctaText: config.ctaText,
            heroImgId: config.heroImgId || config.heroImageUrl,
            heroText: config.heroText,
            iconImgId: config.iconImgId || config.homescreenIconUrl,
            rssFeed: config.rssFeed,
            productQuery: config.productQuery || '',
            productCategory: config.productCategory || '',
            pwaInstanceId: config.pwaInstanceId || config.bucketName,
            subText: config.subText,
            template: config.template || 'news', // TODO
          };
          if (PWASSEMBLE.DEBUG_MODE) {
            console.log(PWASSEMBLE.DEBUG_PREFIX, adaptor);
          }
          if (PWASSEMBLE.DEBUG_MODE) {
            console.log(PWASSEMBLE.DEBUG_PREFIX,
                'Storing instance data to IndexedDB');
          }
          idbKeyval.set(id, adaptor);
          return adaptor;
        })
        .then((instance) => resolve(instance))
        .catch((error) => reject(error));
      });
    },
  };
})(window.PWASSEMBLE || {});
