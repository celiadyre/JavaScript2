import { loginPage } from "../pages/login.js";
import { registerPage } from "../pages/register.js";
import { feedPage } from "../pages/feed.js";
import { postPage } from "../pages/post.js";
import { profilePage } from "../pages/profile.js";
import { postFormPage } from "../pages/postForm.js";

export function router() {
  const path = window.location.pathname;

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
      <a href="/feed" data-link>Back to feed</a>
    </main>
  `;
}
