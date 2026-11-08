import { getPost } from "../api/posts/getPost.js";
import { addComment } from "../api/posts/addComment.js";
import { load } from "../storage/load.js";

export async function postPage() {
  const app = document.querySelector("#app");

  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  const profile = load("profile");

  if (!postId) {
    app.innerHTML = `
      <p class="p-8 text-center">Post not found.</p>
    `;
    return;
  }

  app.innerHTML = `
    <p class="p-8 text-center">Loading post...</p>
  `;

  try {
    const post = await getPost(postId);

    renderPost(post, profile);
    setupCommentForm(post.id);
  } catch (error) {
    app.innerHTML = `
      <p class="p-8 text-center text-small text-red">${error.message}</p>
    `;
  }
}

function renderPost(post, profile) {
  const app = document.querySelector("#app");

  const username = post.author?.name || "Unknown user";
  const avatar = post.author?.avatar?.url;

  const image = post.media?.url;
  const imageAlt = post.media?.alt || post.title || "Post image";

  const comments = post.comments || [];

  const isOwner = profile?.name === post.author?.name;

  app.innerHTML = `
    <div class="min-h-screen bg-white">

      <header class="flex h-[92px] w-full items-center justify-between bg-green px-5">

        <a
          href="/feed"
          data-link
          class="flex h-12 w-12 items-center justify-center text-large text-beige hover:opacity-75"
          aria-label="Back to feed"
        >
          ←
        </a>

        <a href="/feed" data-link class="flex items-center justify-center">
          <img
            src="assets/SocialMediaLogo.png"
            alt="Social Media Logo"
            class="h-auto w-[60px]"
          >
        </a>

        <a
          href="/profile"
          data-link
          class="block h-12 w-12 overflow-hidden rounded-full bg-placeholder"
          aria-label="My profile"
        >
          ${
            profile?.avatar?.url
              ? `
                <img
                  src="${profile.avatar.url}"
                  alt="${profile.name}"
                  class="h-full w-full object-cover"
                >
              `
              : ""
          }
        </a>

      </header>


      <main class="p-5">

        <a
          href="/profile?name=${encodeURIComponent(username)}"
          data-link
          class="mb-5 flex min-h-14 w-full items-center gap-4 rounded-(--radius-medium) bg-beige px-4 py-2 text-large text-black hover:opacity-90"
        >

          <div class="h-9 w-9 min-w-9 overflow-hidden rounded-full bg-placeholder">

            ${
              avatar
                ? `
                  <img
                    src="${avatar}"
                    alt="${username}"
                    class="h-full w-full object-cover"
                  >
                `
                : ""
            }

          </div>

          <span>
            ${username}
          </span>

        </a>


        <div class="aspect-square w-full overflow-hidden rounded-(--radius-medium) bg-placeholder">

          ${
            image
              ? `
                <img
                  src="${image}"
                  alt="${imageAlt}"
                  class="h-full w-full object-cover"
                >
              `
              : `
                <div class="h-full w-full bg-placeholder"></div>
              `
          }

        </div>


        ${
          post.title
            ? `
              <h1 class="mt-5 mb-2 text-medium font-normal">
                ${post.title}
              </h1>
            `
            : ""
        }


        ${
          post.body
            ? `
              <p class="mb-5 text-small">
                ${post.body}
              </p>
            `
            : ""
        }


        ${
          isOwner
            ? `
              <div class="mt-2 mb-8 flex justify-end">

                <a
                  href="/edit-post?id=${post.id}"
                  data-link
                  class="flex min-h-[50px] min-w-[130px] items-center justify-center rounded-(--radius-medium) bg-light-green px-5 text-medium text-black hover:opacity-90 active:opacity-80"
                >
                  Edit
                </a>

              </div>
            `
            : ""
        }


        <section class="mt-8">

          <div id="comments-container">

            ${
              comments.length
                ? comments
                    .map(
                      (comment) => `
                        <div class="mb-3 flex min-h-[52px] w-full items-center rounded-(--radius-medium) bg-beige px-5 py-3 text-medium">

                          <strong class="mr-1 font-normal">
                            ${comment.author?.name || comment.owner || "User"}:
                          </strong>

                          <span>
                            ${comment.body}
                          </span>

                        </div>
                      `,
                    )
                    .join("")
                : `
                  <p class="mb-3 text-small">
                    No comments yet.
                  </p>
                `
            }

          </div>


          <form id="comment-form" class="mt-3 w-full">

            <input
              type="text"
              id="comment-input"
              placeholder="Write a comment..."
              aria-label="Write a comment"
              required
              class="mb-3 h-14 w-full rounded-(--radius-medium) bg-beige px-6 text-medium text-black focus:outline-none focus:ring-4 focus:ring-dark-green"
            >

            <button
              type="submit"
              class="min-h-14 w-full rounded-(--radius-medium) bg-dark-green px-5 text-left text-medium text-beige hover:opacity-90 active:opacity-80 disabled:opacity-60"
            >
              Add comment
            </button>

          </form>

          <p
            id="comment-error"
            class="mt-2 text-small text-red"
          ></p>

        </section>

      </main>

    </div>
  `;
}

function setupCommentForm(postId) {
  const form = document.querySelector("#comment-form");

  const input = document.querySelector("#comment-input");

  const errorElement = document.querySelector("#comment-error");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const body = input.value.trim();

    if (!body) {
      return;
    }

    errorElement.textContent = "";

    try {
      await addComment(postId, body);

      const post = await getPost(postId);
      const profile = load("profile");

      renderPost(post, profile);
      setupCommentForm(post.id);
    } catch (error) {
      errorElement.textContent = error.message;
    }
  });
}