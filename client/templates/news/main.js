/* eslint "require-jsdoc": 0 */
((PWASSEMBLE) => {
  console.log(PWASSEMBLE.TEMPLATE_PREFIX, 'Template loaded:',
      PWASSEMBLE.instance.template);

  function getFeed(url) {
    return fetch(`./feeds?url=${encodeURIComponent(url)}`)
    .then((response) => {
      if (!response.ok) {
        throw Error('Feed fetch error');
      }
      return response.text()
      // Rewrite non-http links and proxy them locally
      .then((raw) => JSON.parse(raw.replace(
          /src=(\\?["'])(http:\/\/.*?)(?:\\["'])/g,
          (_, p1, p2) => {
            return `src=${p1}./proxy?url=${encodeURIComponent(p2)}${p1}`;
          })));
    })
    .catch((fetchError) => {
      throw fetchError;
    });
  }

  function getHtml(entries, isFullArticle = false) {
    // Helper function to proxy unsecure HTTP URLs over HTTPS
    const proxyHttps = (url) => /^http:\/\//.test(url) ?
        `./proxy?url=${encodeURIComponent(url)}` : url;
    return Promise.resolve(`
        ${entries.map((entry) => {
          let videos = [];
          return `
              <article ${entry.meta.language ?
                  `lang="${entry.meta.language}"` : ''}
                  ${isFullArticle ? '' : `data-url="${entry.link}"`}>
                <header>
                  <a href="${entry.link}">
                    <h2 ${isFullArticle ? '' : `data-url="${entry.link}"`}>
                      ${entry.title}
                    </h2>
                  </a>
                </header>
                <section>
                ${entry.enclosures.length ?
                    (entry.enclosures.map((enc) => {
                      if (/^image/.test(enc.type)) {
                        return `<p><img alt="" src="${
                            proxyHttps(enc.url)}"></p>`;
                      } else if (/^video/.test(enc.type)) {
                        videos.push(
                            `<source src="${proxyHttps(enc.url)}"></source>`);
                      }
                    }).join('') + (videos.length ?
                        `<p><video controls>${videos.join('\n')}</video></p>` :
                        '')
                    ) :
                    ''}
                ${entry.image && entry.image.url ?
                    `<p><img alt="" src="${proxyHttps(entry.image.url)}"></p>` :
                    ''}
                ${entry.description ? // eslint-disable-line no-nested-ternary
                    `${entry.description}` :
                    (entry.summary ?
                        `${entry.summary}` :
                        '')}
                </section>
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

  function getFullArticle(url, entry, target) {
    const main = container.querySelector('main');
    const article = main.querySelector(`article[data-url="${url}"]`);
    fetch(`./article?url=${encodeURIComponent(url)}`)
    .then((response) => {
      if (!response.ok) {
        throw Error('Full article fetch error');
      }
      return response.json();
    })
    .then((fullArticle) => {
      if (!fullArticle.text) {
        throw Error('Full article fetch error');
      }
      let entries = [{
        title: entry.title,
        meta: {
          language: entry.meta.language,
        },
        link: url,
        enclosures: [],
        description: fullArticle.text.replace(/\n/g, '<br>'),
        date: entry.date,
        author: entry.author,
      }];
      if (fullArticle.image) {
        entries[0].enclosures.push({
          url: fullArticle.image,
          type: 'image',
        });
      }
      if (fullArticle.videos) {
        fullArticle.videos.forEach((video) => {
          entries[0].enclosures.push({
            url: video.src,
            type: 'video',
          });
        });
      }
      return getHtml(entries, true)
      .then((html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const fullArticle = temp.querySelector('article');
        article.parentNode.replaceChild(fullArticle, article);
        target.classList.remove('loading-content');
      });
    })
    .catch((fetchError) => {
      target.classList.remove('loading-content');
      console.error(fetchError);
    });
  }

  let entries;
  getFeed(PWASSEMBLE.instance.rssFeed)
  .then((_entries) => {
    entries = _entries;
    return getHtml(entries);
  })
  .then((html) => {
    const container = document.querySelector('#container');
    const main = container.querySelector('main');
    main.innerHTML = html;
    // Handle failing images
    const showFallbackImage = (imgErrorEvent) => {
      imgErrorEvent.target.src = `${location.origin}/static/offline.svg`;
    };
    for (let img of container.querySelectorAll('img')) {
      img.addEventListener('error', showFallbackImage);
    }
    // Full article request clicks
    main.addEventListener('click', (e) => {
      const target = e.target;
      // The full article has been fetched, now link to the actual source
      if ((target.nodeName === 'H2') &&
          (!target.dataset.url)) {
        return;
      }
      target.classList.add('loading-content');
      e.preventDefault();
      const url = target.dataset.url;
      let entry;
      for (let i = 0, lenI = entries.length; i < lenI; i++) {
        if (entries[i].link === url) {
          entry = entries[i];
          break;
        }
      }
      getFullArticle(url, entry, target);
    });
  })
  .catch((error) => {
    console.log(PWASSEMBLE.TEMPLATE_PREFIX, error);
  });

  if ('PushManager' in window) {
    document.querySelector('nav').appendChild(
        document.querySelector('#pushNotificationsToggle'));
  }
})(window.PWASSEMBLE || {});
