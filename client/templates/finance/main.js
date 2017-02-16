/* eslint "require-jsdoc": 0 */
((PWASSEMBLE) => {
  console.log(PWASSEMBLE.TEMPLATE_PREFIX, 'Template loaded:',
      PWASSEMBLE.instance.template);

  const form = document.querySelector('#form');
  form.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();
    const title = PWASSEMBLE.instance.companyName;
    const options = {
      body: PWASSEMBLE.instance.ctaText,
      icon: PWASSEMBLE.instance.iconImgId,
      vibrate: [200, 100, 200, 100, 200, 100, 400],
    };
    PWASSEMBLE.serviceWorkerRegistration.showNotification(title, options);
    return false;
  });

  if ('PushManager' in window) {
    document.querySelector('nav').appendChild(
        document.querySelector('#pushNotificationsToggle'));
  }
})(window.PWASSEMBLE || {});

