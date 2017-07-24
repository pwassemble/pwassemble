((win, doc, $) => {
  // Web Components polyfills
  const script = doc.createElement('script');
  script.src = 'js/webcomponentsjs/webcomponents-loader.js';
  doc.head.appendChild(script);

  win.addEventListener('WebComponentsReady', (e) => {
    console.log(PWASSEMBLE.TEMPLATE_PREFIX, 'Web Components ready');
    $('app-drawer').appendChild($('#pushNotificationsToggle'));
  });
})(window, document, document.querySelector.bind(document));
