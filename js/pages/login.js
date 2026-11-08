import { login } from "../api/auth/login.js";

export function loginPage() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <div class="grid min-h-screen grid-rows-[auto_1fr] bg-white">

      <header class="flex h-[92px] w-full items-center justify-center bg-green">
        <a href="/" data-link class="flex items-center justify-center">
          <img
            src="assets/SocialMediaLogo.png"
            alt="Social Media Logo"
            class="h-auto w-[60px]"
          />
        </a>
      </header>

      <main class="flex items-center justify-center px-7 py-8 sm:px-8">

        <section class="w-full text-center">

          <h1 class="mb-3 text-large font-normal">Sign in</h1>

          <form id="login-form" class="w-full">

            <input
              type="email"
              id="login-email"
              name="email"
              placeholder="Email"
              autocomplete="email"
              aria-label="Email"
              required
              class="mb-3 h-14 w-full rounded-(--radius-medium) bg-beige px-6 text-medium text-black focus:outline-none focus:ring-4 focus:ring-dark-green"
            >

            <input
              type="password"
              id="login-password"
              name="password"
              placeholder="Password"
              autocomplete="current-password"
              aria-label="Password"
              minlength="8"
              required
              class="mb-3 h-14 w-full rounded-(--radius-medium) bg-beige px-6 text-medium text-black focus:outline-none focus:ring-4 focus:ring-dark-green"
            >

            <p id="login-error" class="mb-2 text-small text-red"></p>

            <button
              type="submit"
              class="bg-transparent p-0 text-large text-black hover:opacity-75 active:opacity-60"
            >
              Enter <span class="ml-2">⟶</span>
            </button>

          </form>

          <p class="mt-3 text-small">
            Don’t have an account?
            <a href="/register" data-link class="hover:text-dark-green">Register here</a>
          </p>

        </section>

      </main>

    </div>
  `;

  const form = document.querySelector("#login-form");
  const errorElement = document.querySelector("#login-error");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#login-email").value.trim();
    const password = document.querySelector("#login-password").value;

    errorElement.textContent = "";

    try {
      await login(email, password);

      history.pushState({}, "", "/JavaScript2/feed");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (error) {
      errorElement.textContent = error.message;
    }
  });
}