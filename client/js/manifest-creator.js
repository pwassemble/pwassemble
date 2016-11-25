window.manifestCreator = {
  create(manifestObject) {
    const sizes = [48, 72, 76, 96, 120, 128, 144, 152, 168, 192, 256];
    return JSON.stringify(JSON.parse(`
        {
          "name": "${manifestObject.name}",
          "short_name": "${manifestObject.shortName}",
          "start_url": "${manifestObject.startUrl}",
          "display": "${manifestObject.display ?
              manifestObject.display : 'standalone'}",
          "icons": [
            ${sizes.map(size => {
              return `{
                "src": "${location.origin}/assets?input=${
                    encodeURIComponent(manifestObject.icon)
                    }&width=${size}&height=${size}",
                "sizes": "${size}x${size}",
                "type": "image/png"
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
