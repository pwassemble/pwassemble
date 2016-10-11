// Simulate slow image loading
(() => {
  const imgs = document.querySelectorAll('img');
  for (let i = 0, lenI = imgs.length; i < lenI; i++) {
    let img = imgs[i];
    //img.style.backgroundImage = `url(${img.dataset.src})`;
    setTimeout(() => {
      img.classList.remove('img--blur');
      // eslint-disable-next-line max-len
      //img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      img.src = img.dataset.src;
    }, Math.random() * 3000);
  }
})();
