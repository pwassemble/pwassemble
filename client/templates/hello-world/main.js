(() => {
  const URL = 'http://www.apple.com/library/test/success.html';

  const dynamicElem = document.querySelector('.dynamic');
  const codeElem = document.querySelector('.code');
  const fetchElem = document.querySelector('.fetch');

  dynamicElem.innerHTML +=
      '<p>This content was added dynamcially from <code>main.js</code>.</p>';

  codeElem.textContent = `${JSON.stringify(PWASSEMBLE.instance, null, 2)}`;

  fetch(`./proxy?url=${encodeURIComponent(URL)}`)
  .then((response) => {
    if (response.status !== 200) {
      throw Error(`Fetching ${URL} failed with status code ${response.status}`);
    }
    return response.text();
  })
  .then((data) => {
    fetchElem.innerHTML = data;
  })
  .catch((fetchError) => console.error(fetchError));
})();
