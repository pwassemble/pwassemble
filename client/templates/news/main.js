function getFeed(url) {
  return fetch(`./feeds?url=${encodeURIComponent(url)}`)
  .then(response => {
    if (!response.ok) {
      return Response.error();
    }
    return response.text()
    // Rewrite non-http links and proxy them locally
    .then(raw => JSON.parse(raw.replace(/http:\/\//g, './proxy?url=http://')));
  })
  .catch(fetchError => {
    throw fetchError;
  });
}

function getHtml(entries) {
  return Promise.resolve(`
      ${entries.map(entry => {
        let videos = [];
        return `
            <article ${entry.meta.language ?
                  `lang="${entry.meta.language}"` : ''}>
              <header>
                <a href="${entry.link}"><h2>${entry.title}</h2></a>
              </header>
              ${entry.enclosures.length ?
                  (entry.enclosures.map(enc => {
                    if (/^image/.test(enc.type)) {
                      return `<p><img alt="" src="${enc.url}"></p>`;
                    } else if (/^video/.test(enc.type)) {
                      videos.push(`<source src="${enc.url}"></source>`);
                      return '';
                    }
                  }).join('') + (videos.length ?
                      `<p><video controls>${videos.join('\n')}</video></p>` :
                      '')
                  ) :
                  ''}
              ${entry.image && entry.image.url ?
                  `<p><img alt="" src="${entry.image.url}"></p>` :
                  ''}
              ${entry.description ?
                  `<section>${entry.description}</section>` :
                  (entry.summary ?
                      `<section>${entry.summary}</section>` :
                      '')}
              <footer>
                <p>Posted on
                  <time datetime="${new Date(entry.date).toISOString()}">
                    ${new Date(entry.date).toLocaleString()}
                  </time>
                  ${entry.author ? `by ${entry.author}` : ''}
                </p>
              </footer>
            </article>`;
      }).join('\n')}`);
}

getFeed(instance.rssFeed)
.then(entries => getHtml(entries))
.then(html => document.querySelector('#container').querySelector('main').innerHTML = html)
.catch(error => {
  console.log(error);
});
