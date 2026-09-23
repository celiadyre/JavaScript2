import { createPost } from "../api/posts/createPost.js";
import { updatePost } from "../api/posts/updatePost.js";
import { getPost } from "../api/posts/getPost.js";
import { load } from "../storage/load.js";

export async function postFormPage() {
  const app = document.querySelector("#app");

  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  const profile = load("profile");

  const isEditing = Boolean(postId);

  let post = null;

  if (isEditing) {
    try {
      post = await getPost(postId);

      if (post.author?.name !== profile?.name) {
        app.innerHTML = `
          <p>You cannot edit this post.</p>
        `;
        return;
      }
    } catch (error) {
      app.innerHTML = `
        <p>${error.message}</p>
      `;
      return;
    }
  }

  renderPostForm(post, profile, isEditing);

  setupPostForm(postId, isEditing);
}

function renderPostForm(post, profile, isEditing) {
  const app = document.querySelector("#app");

  const imageUrl = post?.media?.url || "";
  const altText = post?.media?.alt || "";
  const caption = post?.body || "";

  app.innerHTML = `
    <div class="post-form-page">

      <header class="feed-header">

        <a
          href="/feed"
          data-link
          class="feed-search-button"
          aria-label="Back to feed"
        >
          ←
        </a>

        <a
          href="/feed"
          data-link
          class="feed-logo"
        >
          <img
            src="assets/SocialMediaLogo.png"
            alt="Social Media Logo"
          >
        </a>

        <a
          href="/profile"
          data-link
          class="feed-profile"
          aria-label="My profile"
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


      <main class="post-form-main">

        <div class="post-form-author">

          <div class="post-form-avatar">

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

          </div>

          <span>
            ${profile?.name || "Username"}
          </span>

        </div>


        <form id="post-form">

          <div class="post-media-box">

            <div
              id="image-preview"
              class="post-image-preview"
            >
              ${
                imageUrl
                  ? `
                    <img
                      src="${imageUrl}"
                      alt="${altText}"
                    >
                  `
                  : `
                    <span>Add image</span>
                  `
              }
            </div>

            <input
              type="url"
              id="post-image-url"
              class="post-form-input"
              placeholder="Image URL"
              value="${imageUrl}"
            >

          </div>


          <input
            type="text"
            id="post-caption"
            class="post-form-input"
            placeholder="Add caption"
            value="${caption}"
            required
          >


          <input
            type="text"
            id="post-alt"
            class="post-form-input"
            placeholder="Add alt text"
            value="${altText}"
          >


          <p
            id="post-form-error"
            class="post-form-error"
          ></p>


          <button
            type="submit"
            class="post-submit-button"
          >
            ${isEditing ? "Save changes" : "Post to feed"}
          </button>

        </form>

      </main>

    </div>
  `;
}

function setupPostForm(postId, isEditing) {
  const form = document.querySelector("#post-form");

  const imageInput = document.querySelector("#post-image-url");

  const imagePreview = document.querySelector("#image-preview");

  const errorElement = document.querySelector("#post-form-error");

  imageInput.addEventListener("input", () => {
    const imageUrl = imageInput.value.trim();

    if (imageUrl) {
      imagePreview.innerHTML = `
        <img
          src="${imageUrl}"
          alt="Post preview"
        >
      `;
    } else {
      imagePreview.innerHTML = `
        <span>Add image</span>
      `;
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const imageUrl = imageInput.value.trim();

    const caption = document.querySelector("#post-caption").value.trim();

    const altText = document.querySelector("#post-alt").value.trim();

    if (!caption) {
      errorElement.textContent = "Please add a caption.";
      return;
    }

    /*
      Noroff requires a title.
      Since the design does not have a separate
      title field, we create one from the caption.
    */

    const title =
      caption.length > 60 ? `${caption.substring(0, 60)}...` : caption;

    const postData = {
      title,
      body: caption,
    };

    if (imageUrl) {
      postData.media = {
        url: imageUrl,
        alt: altText || caption,
      };
    } else {
      postData.media = null;
    }

    errorElement.textContent = "";

    try {
      let savedPost;

      if (isEditing) {
        savedPost = await updatePost(postId, postData);
      } else {
        savedPost = await createPost(postData);
      }

      history.pushState({}, "", `/post?id=${savedPost.id}`);

      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (error) {
      errorElement.textContent = error.message;
    }
  });
}
