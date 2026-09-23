import { getPost } from "../api/posts/getPost.js";
import { addComment } from "../api/posts/addComment.js";
import { updatePost } from "../api/posts/updatePost.js";
import { load } from "../storage/load.js";

export async function postPage() {
  const app = document.querySelector("#app");

  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  const profile = load("profile");

  if (!postId) {
    app.innerHTML = `
      <p>Post not found.</p>
    `;
    return;
  }

  app.innerHTML = `
    <p class="post-loading">Loading post...</p>
  `;

  try {
    const post = await getPost(postId);

    renderPost(post, profile);

    setupCommentForm(post.id);

    if (profile?.name === post.author?.name) {
      setupEditButton(post);
    }
  } catch (error) {
    app.innerHTML = `
      <p class="post-error">${error.message}</p>
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
    <div class="single-post-page">

      <header class="feed-header">

        <a
          href="/feed"
          data-link
          class="feed-search-button"
          aria-label="Back to feed"
        >
          ←
        </a>

        <div class="feed-logo">
          <a href="/feed" data-link>
            <img
              src="assets/SocialMediaLogo.png"
              alt="Social Media Logo"
            >
          </a>
        </div>

        <a
          href="/profile"
          data-link
          class="feed-profile"
        >
          ${
            profile?.avatar?.url
              ? `
                <img
                  src="${profile.avatar.url}"
                  alt="${profile.name}"
                >
              `
              : ""
          }
        </a>

      </header>


      <main class="single-post-main">

        <a
          href="/profile?name=${encodeURIComponent(username)}"
          data-link
          class="post-author"
        >

          <div class="post-author-avatar">

            ${
              avatar
                ? `
                  <img
                    src="${avatar}"
                    alt="${username}"
                  >
                `
                : ""
            }

          </div>

          <span class="post-author-name">
            ${username}
          </span>

        </a>


        <div class="single-post-image-container">

          ${
            image
              ? `
                <img
                  src="${image}"
                  alt="${imageAlt}"
                  class="single-post-image"
                >
              `
              : `
                <div class="single-post-placeholder"></div>
              `
          }

        </div>


        ${
          post.title
            ? `
              <h1 class="single-post-title">
                ${post.title}
              </h1>
            `
            : ""
        }


        ${
          post.body
            ? `
              <p class="single-post-body">
                ${post.body}
              </p>
            `
            : ""
        }


        ${
          isOwner
            ? `
              <div class="edit-button-container">
                <button
                  type="button"
                  id="edit-post-button"
                  class="edit-post-button"
                >
                  Edit
                </button>
              </div>

              <div
                id="edit-post-container"
                class="edit-post-container"
              ></div>
            `
            : ""
        }


        <section class="comments-section">

          <div id="comments-container">

            ${
              comments.length
                ? comments
                    .map(
                      (comment) => `
                        <div class="comment">

                          <strong>
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
                  <p class="no-comments">
                    No comments yet.
                  </p>
                `
            }

          </div>


          <form id="comment-form">

            <input
              type="text"
              id="comment-input"
              placeholder="Add comment"
              required
            >

            <button
              type="submit"
              class="add-comment-button"
            >
              Add comment
            </button>

          </form>

          <p
            id="comment-error"
            class="comment-error"
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

      if (profile?.name === post.author?.name) {
        setupEditButton(post);
      }
    } catch (error) {
      errorElement.textContent = error.message;
    }
  });
}
function setupEditButton(post) {
  const editButton = document.querySelector("#edit-post-button");

  const container = document.querySelector("#edit-post-container");

  editButton.addEventListener("click", () => {
    container.innerHTML = `
      <form id="edit-post-form">

        <input
          type="text"
          id="edit-title"
          value="${post.title || ""}"
          placeholder="Title"
          required
        >

        <textarea
          id="edit-body"
          placeholder="Post text"
        >${post.body || ""}</textarea>

        <input
          type="url"
          id="edit-image"
          value="${post.media?.url || ""}"
          placeholder="Image URL"
        >

        <button
          type="submit"
          class="save-post-button"
        >
          Save
        </button>

      </form>

      <p id="edit-error"></p>
    `;

    setupEditForm(post);
  });
}
function setupEditForm(post) {
  const form = document.querySelector("#edit-post-form");

  const errorElement = document.querySelector("#edit-error");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.querySelector("#edit-title").value.trim();

    const body = document.querySelector("#edit-body").value.trim();

    const imageUrl = document.querySelector("#edit-image").value.trim();

    const updatedPost = {
      title,
      body,
    };

    if (imageUrl) {
      updatedPost.media = {
        url: imageUrl,
        alt: title,
      };
    } else {
      updatedPost.media = null;
    }

    try {
      await updatePost(post.id, updatedPost);

      const refreshedPost = await getPost(post.id);

      const profile = load("profile");

      renderPost(refreshedPost, profile);

      setupCommentForm(refreshedPost.id);

      setupEditButton(refreshedPost);
    } catch (error) {
      errorElement.textContent = error.message;
    }
  });
}
