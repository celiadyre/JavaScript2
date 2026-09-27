import { router } from "./router/router.js";

export const BASE_PATH = "/JavaScript2";

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

  history.pushState({}, "", `${BASE_PATH}${href}`);

  router();
});

window.addEventListener("popstate", () => {
  router();
});
