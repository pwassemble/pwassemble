(() => {
  if (!location.search) {
    return console.log('No query parameters');
  }
  const id = new URLSearchParams(location.search).get('id');
  if (!id || !/^\d+$/.test(id)) {
    return console.log('No or invalid "id" parameter');;
  }
  console.log('Instance ID', id);
  const config = {
    apiKey: 'AIzaSyCmQzeCh9nFg5SCwbfsPDkpigwat_fuW68',
    authDomain: 'pwassemble-1337.firebaseapp.com',
    databaseURL: 'https://pwassemble-1337.firebaseio.com',
    storageBucket: 'pwassemble-1337.appspot.com'
  };
  firebase.initializeApp(config);
  const db = firebase.database();
  const storage = firebase.storage();

  db.ref(`/instances/${id}`)
  .once('value')
  .then(snapshot => {
    return snapshot.val();
  })
  .then(results => {
    const promises = [Promise.resolve(results)];
    const dynamicComponents = ['companyLogoImgId'];
    dynamicComponents.forEach(dynamicComponent => {
      let dynamicKey = results[dynamicComponent];
      if (dynamicComponent === 'companyLogoImgId') {
        dynamicKey =
            `${dynamicKey}.${results['companyLogoImgName'].split('.')[1]}`;
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
    console.log(finalResults)
    return finalResults;
  });
})();
