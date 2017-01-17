/* global instance */
/* eslint "require-jsdoc": 0 */
/* eslint "no-unused-vars": 0 */

const form = document.querySelector('#form');
form.addEventListener('submit', e => {
  const title = instance.companyName;
  const options = {
    body: instance.ctaText,
    icon: instance.iconImgId,
    vibrate: [200, 100, 200, 100, 200, 100, 400]
  };
  const notification = new Notification(title, options);
  return false;
});

