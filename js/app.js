import { router } from "./router/router.js";

document.addEventListener("DOMContentLoaded", () => {
  router();
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-link]");

  if (!link) {
    return;
  }

  event.preventDefault();

  const href = link.getAttribute("href");

  history.pushState({}, "", href);

  router();
});

window.addEventListener("popstate", () => {
  router();
});
