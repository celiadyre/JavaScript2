import { register } from "../api/auth/register.js";

export function registerPage() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <div class="register-page">

      <header class="register-header">
        <div class="register-logo"></div>
      </header>

      <main class="register-main">

        <section class="register-container">

          <h1>Register</h1>

          <form id="register-form">

            <input
              type="email"
              id="register-email"
              name="email"
              placeholder="Email"
              autocomplete="email"
              required
            >

            <input
              type="text"
              id="register-username"
              name="username"
              placeholder="Username"
              autocomplete="username"
              required
            >

            <input
              type="password"
              id="register-password"
              name="password"
              placeholder="Password"
              autocomplete="new-password"
              required
            >

            <p id="register-error" class="register-error"></p>

            <button type="submit" class="register-submit">
              Enter <span class="register-arrow">⟶</span>
            </button>

          </form>

          <p class="login-text">
            Already have an account?
            <a href="/login" data-link>Sign in here</a>
          </p>

        </section>

      </main>

    </div>
  `;

  const form = document.querySelector("#register-form");
  const errorElement = document.querySelector("#register-error");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#register-email").value.trim();

    const name = document.querySelector("#register-username").value.trim();

    const password = document.querySelector("#register-password").value;

    errorElement.textContent = "";

    try {
      await register(name, email, password);

      history.pushState({}, "", "/JavaScript2/login");

      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (error) {
      errorElement.textContent = error.message;
    }
  });
}
