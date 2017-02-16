((PWASSEMBLE) => {
  /* eslint "require-jsdoc": 0 */
  console.log(PWASSEMBLE.TEMPLATE_PREFIX, 'Template loaded:',
      PWASSEMBLE.instance.template);

  if ('PushManager' in window) {
    document.querySelector('nav').appendChild(
        document.querySelector('#pushNotificationsToggle'));
  }
})(window.PWASSEMBLE || {});
