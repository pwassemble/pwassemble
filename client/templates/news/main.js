function getFeed(url) {
  return fetch(`./feeds?url=${encodeURIComponent(url)}`)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    console.log('💩 other');
    return Response.error();
  })
  .catch(fetchError => {
    throw fetchError;
  });
}

function getHtml(entries) {
  return Promise.resolve(
    entries.map(entry => {
      return `
          <article>
            <header>
              <a href="${entry.link}"><h2>${entry.title}</h2></a>
            </header>
            ${entry.summary ? `<section><p>${entry.summary}</p></section>` : ''}
            <footer>
              <p>Posted on
                <time datetime="${new Date(entry.date).toISOString()}">
                  ${new Date(entry.date).toLocaleString()}
                </time>
              </p>
            </footer>
          </article>`;
    }).join('\n'));
}

getFeed('http://rss.cnn.com/rss/edition.rss')
.then(entries => getHtml(entries))
.then(html => document.getElementById('container').innerHTML += html)
.catch(error => {
  console.log(error);
});
