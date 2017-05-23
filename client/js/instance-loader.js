/* global idbKeyval */
((PWASSEMBLE) => {
  PWASSEMBLE.instanceLoader = {
    load() {
      return new Promise((resolve, reject) => {
        if (!location.search) {
          return reject(console.log('No query parameters'));
        }
        const id = new URLSearchParams(location.search).get('id');
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
          return fetch(`./proxy?url=${encodeURIComponent(
              `https://storage.googleapis.com/${id}/result.txt`)}`)
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw Error(`Retriving ${id} failed with status code ${
                response.statusCode}`);
          })
          .then((config) => {
            // Deal with legacy PWAssemble
            const adaptor = {
              colorBgPrimary: config.colorBgPrimary || config.primaryBgColor,
              colorBgSecondary:
                  config.colorBgSecondary || config.secondaryBgColor,
              colorFgPrimary: config.colorFgPrimary || config.primaryFgColor,
              colorFgSecondary: config.colFrBgPrimary || config.primaryFgColor,
              companyLogoImgId:
                  config.companyLogoImgId || config.companyLogoUrl,
              companyName: config.companyName,
              ctaText: config.ctaText,
              heroImgId: config.heroImgId || config.heroImageUrl,
              heroText: config.heroText,
              iconImgId: config.iconImgId || config.homescreenIconUrl,
              rssFeed: config.rssFeed || '',
              subText: config.subText,
              template: config.template || 'news',
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
          .catch((error) => reject(error));
        })
        .then((instance) => resolve(instance))
        .catch((error) => reject(error));
      });
    },
  };
})(window.PWASSEMBLE || {});
