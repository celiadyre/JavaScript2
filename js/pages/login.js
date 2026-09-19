import { login } from "../api/auth/login.js";

export function loginPage() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <div class="login-page">

    <header class="login-header">
      <div class="login-logo">
        <a href="/" data-link class="logo-link">
        <img src="assets/SocialMediaLogo.png"
        alt="Social Media Logo"
        class="logo-image"
        />
        </a>
     </div>
    </header>

      <main class="login-main">

        <section class="login-container">

          <h1>Sign in</h1>

          <form id="login-form">

            <input
              type="email"
              id="login-email"
              name="email"
              placeholder="Email"
              autocomplete="email"
              required
            >

            <input
              type="password"
              id="login-password"
              name="password"
              placeholder="Password"
              autocomplete="current-password"
              required
            >

            <p id="login-error" class="login-error"></p>

            <button type="submit" class="login-submit">
              Enter <span class="login-arrow">⟶</span>
            </button>

          </form>

          <p class="register-text">
            Don’t have an account?
            <a href="/register" data-link>Register here</a>
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

      history.pushState({}, "", "/feed");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (error) {
      errorElement.textContent = error.message;
    }
  });
}
