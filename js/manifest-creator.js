window.manifestCreator = {
  create(manifestObject) {
    return JSON.stringify(JSON.parse(`
        {
          "name": "${manifestObject.name}",
          "short_name": "${manifestObject.shortName}",
          "start_url": "${manifestObject.startUrl}",
          "display": "${manifestObject.display ?
              manifestObject.display : 'standalone'}",
          "icons": [
            ${manifestObject.icons.map(icon => {
              return `{
                "src": "${icon.src}",
                "sizes": "${icon.sizes}",
                "type": "${icon.type}"
              }`;
            }).join(',\n')}
          ],
          "lang": "${manifestObject.lang ? manifestObject.lang : 'en-US'}",
          "orientation": "${manifestObject.orientation ?
              manifestObject.orientation : 'portrait-primary'}",
          "theme_color": "${manifestObject.themeColor}",
          "background_color": "${manifestObject.backgroundColor}",
          "dir": "${manifestObject.dir ? manifestObject.dir : 'ltr'}",
          "gcm_sender_id": "884875544344"
        }`), null, 2);
  }
};
