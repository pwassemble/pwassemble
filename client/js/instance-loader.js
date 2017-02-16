/* global idbKeyval, firebase */
((PWASSEMBLE) => {
  PWASSEMBLE.instanceLoader = {
    load() {
      return new Promise((resolve, reject) => {
        if (!location.search) {
          return reject(console.log('No query parameters'));
        }
        const id = new URLSearchParams(location.search).get('id');
        if (!id || !/^\d+$/.test(id)) {
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
              return reject(`Could not find instance ${id}`);
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
            return finalResults;
          })
          .catch((error) => reject(error));
        })
        .then((instance) => resolve(instance))
        .catch((error) => reject(error));
      });
    },
  };
})(window.PWASSEMBLE || {});
