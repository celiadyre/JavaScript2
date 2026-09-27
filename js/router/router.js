import { loginPage } from "../pages/login.js";
import { registerPage } from "../pages/register.js";
import { feedPage } from "../pages/feed.js";
import { postPage } from "../pages/post.js";
import { profilePage } from "../pages/profile.js";
import { postFormPage } from "../pages/postForm.js";

const BASE_PATH = "/JavaScript2";

export function router() {
  let path = window.location.pathname;

  if (path.startsWith(BASE_PATH)) {
    path = path.slice(BASE_PATH.length);
  }

  if (!path) {
    path = "/";
  }

  switch (path) {
    case "/":
    case "/login":
      loginPage();
      break;

    case "/register":
      registerPage();
      break;

    case "/feed":
      feedPage();
      break;

    case "/post":
      postPage();
      break;

    case "/profile":
      profilePage();
      break;

    case "/create":
      postFormPage();
      break;

    case "/edit-post":
      postFormPage();
      break;

    default:
      renderNotFound();
  }
}

function renderNotFound() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <main>
      <h1>404</h1>
      <p>Page not found.</p>

      <a
        href="/feed"
        data-link
      >
        Back to feed
      </a>
    </main>
  `;
}
