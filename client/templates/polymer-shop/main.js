(() => {
  // Web Components polyfills
  const script = document.createElement('script');
  script.src = 'js/webcomponentsjs/webcomponents-loader.js';
  document.head.appendChild(script);

  window.addEventListener('WebComponentsReady', (e) => {
    console.log(PWASSEMBLE.TEMPLATE_PREFIX, 'Web Components ready');
  });
})();
