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
  return Promise.resolve(`
    <header>
      <img class="logo" alt="${instance.companyName} logo"
          src="${instance.companyLogoImgId}">
      <nav>
        <button class="hamburger-menu">Menu ☰</button>
      </nav>
    </header>
    <main>${
      entries.map(entry => {
        let videos = [];
        return `
            <article>
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
      }).join('\n')}
    </main>
    <footer>
      <img class="logo-small" alt="${instance.companyName} logo"
          src="${instance.companyLogoImgId}">
      &copy; ${new Date().getFullYear()} ${instance.companyName}
    </footer>`);
}

//getFeed('http://rss.cnn.com/rss/edition.rss')
//getFeed('http://blog.mailchimp.com/feed/')
//getFeed('http://www.herzdamengeschichten.de/feed/')
//getFeed('https://theintercept.com/feed/?rss')
//getFeed('http://feeds.washingtonpost.com/rss/politics')
getFeed('http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml')
//getFeed('http://www.tagesschau.de/xml/rss2')
.then(entries => getHtml(entries))
.then(html => document.getElementById('container').innerHTML += html)
.catch(error => {
  console.log(error);
});
