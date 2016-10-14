(() => {
  const DEBUG_MODE = true;
  const DEBUG_PREFIX = '🕸';
  const DYNAMIC_CACHE_NAME = 'pwassemble-dynamic-cache-v1';

  if (!location.search) {
    return console.log('No query parameters');
  }
  const id = new URLSearchParams(location.search).get('id');
  if (!id || !/^\d+$/.test(id)) {
    return console.log('No or invalid "id" parameter');;
  }
  if (DEBUG_MODE) {
    console.log(DEBUG_PREFIX, 'Instance ID', id);
  }
  idbKeyval.get(id)
  .then(instance => {
    if (instance) {
      if (DEBUG_MODE) {
        console.log(DEBUG_PREFIX, 'Loading instance data from IndexedDB');
      }
      return instance;
    } else {
      const config = {
        apiKey: 'AIzaSyCmQzeCh9nFg5SCwbfsPDkpigwat_fuW68',
        authDomain: 'pwassemble-1337.firebaseapp.com',
        databaseURL: 'https://pwassemble-1337.firebaseio.com',
        storageBucket: 'pwassemble-1337.appspot.com'
      };
      firebase.initializeApp(config);
      const db = firebase.database();
      const storage = firebase.storage();

      return db.ref(`/instances/${id}`)
      .once('value')
      .then(snapshot => {
        return snapshot.val();
      })
      .then(results => {
        const promises = [Promise.resolve(results)];
        const dynamicComponents = [
          'companyLogoImgId',
          'heroImgId',
          'iconImgId',
        ];
        dynamicComponents.forEach(dynamicComponent => {
          let dynamicKey = results[dynamicComponent];
          if (dynamicComponent === 'companyLogoImgId') {
            dynamicKey =
                `${dynamicKey}.${results['companyLogoImgName'].split('.')[1]}`;
          }
          else if (dynamicComponent === 'heroImgId') {
            dynamicKey =
                `${dynamicKey}.${results['heroImgName'].split('.')[1]}`;
          }
          else if (dynamicComponent === 'iconImgId') {
            dynamicKey =
                `${dynamicKey}.${results['iconImgName'].split('.')[1]}`;
          }
          promises.push(
            storage.ref(dynamicKey).getDownloadURL()
            .then(url => {
              return {
                dynamicComponent,
                dynamicKey,
                url,
              };
            })
          );
        });
        return Promise.all(promises);
      })
      .then(results => {
        let finalResults = results[0];
        results = results.slice(1);
        results.forEach(result => {
          finalResults[result.dynamicComponent] = result.url;
        });
        if (DEBUG_MODE) {
          console.log(DEBUG_PREFIX, 'Storing instance data to IndexedDB');
        }
        idbKeyval.set(id, finalResults);
        return finalResults;
      });
    }
  })
  .then(instance => {
    document.body.innerHTML +=
        `<pre>${JSON.stringify(instance, null, 2)}</pre>`;
  });
})();
