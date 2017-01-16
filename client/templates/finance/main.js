const form = document.querySelector('#form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const title = instance.companyName;
  const options = {
    body: instance.ctaText,
    icon: instance.iconImgId,
    vibrate: [200, 100, 200, 100, 200, 100, 400]
  };
  new Notification(title, options);
});

