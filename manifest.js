const getManifest = (name, shortName, iconSrc, themeColor, backgroundColor,
    startUrl) => {
  return `
      {
        "name": "${name}",
        "short_name": "${shortName}",
        "icons": [
          {
            "src": "${iconSrc}",
            "sizes": "192x192",
            "type": "image\/png"
          },
          {
            "src": "${iconSrc}",
            "sizes": "512x512",
            "type": "image\/png"
          }
        ],
        "theme_color": "${themeColor}",
        "background_color": "${backgroundColor}",
        "display": "standalone",
        "start_url": "${startUrl}",
        "gcm_sender_id": "884875544344"
      }`.replace(/^\s{6}/gm, '');
};
