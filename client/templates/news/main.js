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
      let videos = [];
      return `
          <article>
            <header>
              <a href="${entry.link}"><h2>${entry.title}</h2></a>
            </header>
            ${entry.enclosures ?
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
                ''
            }
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

//getFeed('http://rss.cnn.com/rss/edition.rss')
//getFeed('http://blog.mailchimp.com/feed/')
getFeed('http://photojournal.jpl.nasa.gov/rss/new')
.then(entries => getHtml(entries))
.then(html => document.getElementById('container').innerHTML += html)
.catch(error => {
  console.log(error);
});
