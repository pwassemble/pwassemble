window.templateCreator = {
  /* eslint max-len: ["error", { "ignoreTemplateLiterals": true }] */
  news(instance) {
    return {
      css: ``,
      html: ``
    };
  },
  travel(instance) {
    return {
      css: `
        body {
          height: 100vh;
          width: 100vw;
        }
        h1, h2 {
          text-align: center;
        }
        body > div {
          background: rgba(0, 0, 0, 0) url(${instance.heroImgId}) no-repeat scroll 0% 0% / cover padding-box border-box;
          overflow-y: scroll;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
        }
        header {
          background-color: #fff;
          border-bottom: 1px solid #ccc;
          box-shadow: 0 2px 5px -2px rgba(0,0,0,0.75);
          min-height: 4.5rem;
          display: flex;
          justify-content: center;
        }
        main {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        footer {
          padding: .25rem;
          background-color: #000;
          color: #fff;
        }
        nav {
          display: flex;
          margin-top: .5rem;
          position: absolute;
          right: .5rem;
        }
        .search-container {
          background-color: rgba(0, 0, 0, .5);
          display: flex;
          justify-content: center;
          padding: 1.5rem 1rem;
          width: 100%;
        }
        .text-container {
          display: flex;
          color: var(--colorFgSecondary);
          font-size: 1.3rem;
          flex-direction: column;
          justify-content: center;
          padding: 1.5rem 1rem;
          text-align: center;
          text-shadow: #fff 0 0 10px;
          width: 90%;
        }
        .search-input {
          border: solid 1px var(--colorFgSecondary);
          font-size: 1.25rem;
          padding: .25rem;
          width: 70%;
        }
        .search-button {
          border: solid 1px var(--colorFgSecondary);
          background-color: var(--colorFgSecondary);
          font-size: 1.25rem;
        }
        .hamburger-menu {
          background-color: #fff;
          border: none;
          font-size: 1.75rem;
        }
        .user-menu {
          background-color: #fff;
          border: none;
          font-size: 2rem;
        }
        .logo {
          background-color: white;
          height: 10vh;
          width: auto;
        }
        .imprint-small {
          font-size: .75rem;
        }
        .imprint-centered {
          cursor: pointer;
          list-style: none;
          display: flex;
          padding: 0;
          justify-content: space-around;
        }
        .logo-small {
          height: 5vh;
          vertical-align: middle;
          width: auto;
        }
      `,
      html: `
        <header>
          <img class="logo" src="${instance.companyLogoImgId}">
          <nav>
            <button class="user-menu">👤</button>
            <button class="hamburger-menu">☰</button>
          </nav>
        </header>
        <main>
          <h1>${instance.companyName}</h1>
          <h2>${instance.heroText}</h2>
          <div class="search-container">
            <input class="search-input" type="search" placeholder="e.g. Berlin">
            <button class="search-button"><img src="data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20class%3D%22svg-color--primary%22%20fill%3D%22%23fff%22%20d%3D%22M19.564%2017.448l-3.525-3.526c1.886-3.056.938-7.064-2.118-8.95s-7.064-.94-8.95%202.116-.94%207.064%202.116%208.95c2.094%201.294%204.74%201.294%206.833%200l3.527%203.526c.586.583%201.533.582%202.117-.004.58-.584.58-1.528%200-2.112zm-9.043-2.435c-2.48%200-4.49-2.01-4.49-4.49S8.04%206.03%2010.52%206.03s4.492%202.012%204.492%204.492-2.01%204.49-4.49%204.49z%22%2F%3E%3C%2Fsvg%3E"></button>
          </div>
          <div class="text-container">
            <div>${instance.ctaText}</div>
            <div>${instance.subText}</div>
          </div>
        </main>
        <footer>
          <ul class="imprint-centered">
            <li>About us</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Help</li>
            <li>Imprint</li>
          </ul>
          <p class="imprint-small">
            <img class="logo-small" src="${instance.companyLogoImgId}">
            &copy; ${new Date().getFullYear()} ${instance.companyName}
          </p>
        </footer>
        `
    };
  },
  create(instance) {
    instance.companyName = instance.companyName.replace(/\+/g, ' ');
    instance.ctaText = instance.ctaText.replace(/\+/g, ' ');
    instance.heroText = instance.heroText.replace(/\+/g, ' ');
    instance.subText = instance.subText.replace(/\+/g, ' ');
    const content = this[instance.template](instance);
    const style = document.createElement('style');
    style.textContent = content.css;
    const div = document.createElement('div');
    div.innerHTML = content.html;
    return {
      css: style,
      html: div
    };
  }
};
