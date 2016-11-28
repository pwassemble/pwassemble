window.templateLoader = {
  create(instance) {
    window.instance = instance;
    return Promise.all([
      fetch(`./templates/${instance.template}/main.html`)
        .then(response => response.ok ? response.text() : '')
        // eslint-disable-next-line no-eval
        .then(text => eval('`' + text + '`')),
      fetch(`./templates/${instance.template}/main.css`)
        .then(response => response.ok ? response.text() : '')
        // eslint-disable-next-line no-eval
        .then(text => eval('`' + text + '`')),
      fetch(`./templates/${instance.template}/main.js`)
        .then(response => response.ok ? response.text() : '')
    ])
    .then(results => {
      const html = document.createElement('div');
      html.id = 'container';
      html.innerHTML = results[0];
      const style = document.createElement('style');
      style.textContent = results[1];
      const js = document.createElement('script');
      js.textContent = results[2];
      return {
        html: html,
        css: style,
        js: js
      };
    })
    .catch(fetchError => Promise.reject(fetchError));
  }
};