window.manifestCreator = {
  create(manifestObject) {
    return `
        {
          "name": "${manifestObject.name}",
          "short_name": "${manifestObject.shortName}",
          "icons": [
            {
              "src": "${manifestObject.iconSrc}",
              "sizes": "192x192",
              "type": "image\/png"
            },
            {
              "src": "${manifestObject.iconSrc}",
              "sizes": "512x512",
              "type": "image\/png"
            }
          ],
          "theme_color": "${manifestObject.themeColor}",
          "background_color": "${manifestObject.backgroundColor}",
          "display": "standalone",
          "start_url": "${manifestObject.startUrl}",
          "gcm_sender_id": "884875544344"
        }`.replace(/^\s{8}/gm, '');
  }
};
