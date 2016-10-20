window.templateCreator = {
  news(instance) {
    return {
      css: `body {
        color: white;
        background-color: red;
      }`,
      html: `News template ${instance.companyName} <img src="${instance.companyLogoImgId}">`
    };
  },
  travel(instance) {
    return {
      css: `
        body > div {
          background: rgba(0, 0, 0, 0) url(${instance.heroImgId}) no-repeat scroll 0% 0% / cover padding-box border-box;
          overflow-y: scroll;
          overflow-x: hidden;
          font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
          font-size: 12pt;
          margin: 0;
          display: flex;
          flex-direction: column;
        }
        header {
          background-color: #fff;
          border-bottom: 1px solid #ccc;
          box-shadow: 0 2px 5px -2px rgba(0,0,0,0.75);
          padding: .25rem;
          min-height: 2.25rem;
          flex-basis: 6vh;
          flex-shrink: 0;
          display: flex;
          flex-wrap: nowrap;
          justify-content: center;
          align-items: center;
        }
        main {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          margin: .5rem;
        }
        footer {
          padding: .25rem;
          background-color: #000;
          flex-basis: 15vh;
          flex-shrink: 0;
          color: #fff;
        }
        .search-container {
          background-color: rgba(0, 0, 0, 0, .5);
          display: flex;
          justify-content: center;
          padding: .5rem;
          width: 100%;
        }
        .search-input {
          border: solid 1px var(--colorFgSecondary);
          font-size: 1.25rem;
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
          font-size: 1.25rem;
          margin-top: .5rem;
          position: absolute;
          right: .5rem;
        }
        .logo {
          background-color: white;
          height: 10vh;
          margin-top: .5rem;
          width: auto;
        }
        .imprint-small {
          list-style: none;
          padding-left: 0;
          font-size: .75rem;
          cursor: pointer;
        }
        .imprint-centered {
          text-align: center;
        }
        .logo-small {
          height: 5vh;
          width: auto;
        }
      `,
      html: `
        <header>
          <img class="logo" src="${instance.companyLogoImgId}">
          <nav>
            <button class="hamburger-menu">☰ Menu</button>
          </nav>
        </header>
        <main>
          <h1>${instance.companyName}</1>
          <div class="search-container">
            <input class="search-input" type="search" placeholder="Enter your destination">
            <button class="search-button">
              <img src="data:image/svg+xml;base64,%0A%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22490%22%20height%3D%22490%22%3E%0A%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23000%22%20stroke-width%3D%2236%22%20stroke-linecap%3D%22round%22%0Ad%3D%22m280%2C278a153%2C153%200%201%2C0-2%2C2l170%2C170m-91-117%20110%2C110-26%2C26-110-110%22/%3E%0A%3C/svg%3E%20">
            </button>
          </div>
        </main>
        <footer>
          <ul class="imprint-centered imprint-small">
            <li>About us</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Help</li>
            <li>Imprint</li>
          </ul>
          <p class="imprint-centered">
            <img class="logo-small" src="${instance.companyLogoImgId}">
            <br>
            &copy; ${new Date().getFullYear()} ${instance.companyName}
          </p>
        </footer>
        `
    };
  },
  create(instance) {
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
