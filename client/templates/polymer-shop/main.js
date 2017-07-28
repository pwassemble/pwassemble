((win, doc, $) => {
  // Web Components polyfills
  const script = doc.createElement('script');
  script.src = 'js/webcomponentsjs/webcomponents-loader.js';
  doc.head.appendChild(script);

  win.addEventListener('WebComponentsReady', (e) => {
    console.log(PWASSEMBLE.TEMPLATE_PREFIX, 'Web Components ready');

    $('app-drawer').appendChild($('#pushNotificationsToggle'));

    const ironAjax = $('iron-ajax');
    ironAjax.addEventListener('response', (e) => {
      $('dom-repeat').items = e.detail.response.items;
    });
    const query = $('#query');
    $('#search').addEventListener('submit', (e) => {
      e.preventDefault();
      if (query.value.length) {
        ironAjax.setAttribute('params', '{"query": "' + query.value + '"}');
      }
    });

    const verifyCredentials = (credentials) => {
      const formData = new FormData();
      formData.set('id', credentials.id.value || credentials.id);
      formData.set('password', credentials.password.value ||
          credentials.password);
      formData.set('name', credentials.name.value || credentials.name);
      return fetch('/hello', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      }).then((response) => {
        if (response.status === 200) {
          return response.text();
        }
        return Promise.reject('login failed');
      });
    };

    const signUpForm = $('#signup');
    const loginButton = $('#login');
    const logoutButton = $('#logout');

    signUpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      verifyCredentials(e.target)
      .then((loginResponse) => {
        if (navigator.credentials) {
          credentials = new PasswordCredential(e.target);
          return navigator.credentials.store(credentials);
        }
        return loginResponse;
      }).then((credentials) => {
        // Successful login
        if (credentials) {
          return console.log('Stored credentials');
        }
      }).catch((error) => {
        // login failed
        throw error;
      });
    });

    const logout = () => {
      if (navigator.credentials) {
        navigator.credentials.preventSilentAccess();
      }
    };

    const login = () => {
      if (!navigator.credentials) {
        return;
      }
      navigator.credentials.get({
        password: true,
        federated: {
          provider: [
            'https://accounts.google.com',
          ],
        },
        mediation: 'optional',
      }).then((credentials) => {
        if (credentials) {
          console.log(credentials);
          switch (credentials.type) {
            case 'password':
              return verifyCredentials(credentials);
              break;
            case 'federated':
              // ToDo
              return Promise.resolve();
              break;
          }
        } else {
          return Promise.resolve();
        }
      }).then((profile) => {
        if (profile) {
          // updateUI(profile);
        }
      }).catch((error) => {
        throw error;
      });
    };
    login();

    loginButton.addEventListener('click', login);
    logoutButton.addEventListener('click', logout);
  });
})(window, document, document.querySelector.bind(document));
