import { createPost } from "../api/posts/createPost.js";
import { updatePost } from "../api/posts/updatePost.js";
import { deletePost } from "../api/posts/deletePost.js";
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

      const isOwner = post.author?.name === profile?.name;

      if (!isOwner) {
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

  const title = post?.title || "";

  const caption = post?.body || "";

  const altText = post?.media?.alt || "";

  app.innerHTML = `
    <div class="post-form-page">

      <header class="feed-header">

        <a
          href="${isEditing ? `/post?id=${post.id}` : "/feed"}"
          data-link
          class="feed-search-button"
          aria-label="Back"
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
                  alt="${profile.avatar.alt || profile.name}"
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

          <div class="post-image-preview">

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


          ${
            !isEditing
              ? `
                <input
                  type="url"
                  id="post-image-url"
                  class="post-form-input"
                  placeholder="Image URL"
                  value="${imageUrl}"
                >
              `
              : `
                <input
                  type="hidden"
                  id="post-image-url"
                  value="${imageUrl}"
                >
              `
          }


          <input
            type="text"
            id="post-title"
            class="post-form-input"
            placeholder="${isEditing ? "Edit title" : "Add title"}"
            value="${title}"
            required
          >


          <input
            type="text"
            id="post-caption"
            class="post-form-input"
            placeholder="${isEditing ? "Edit caption" : "Add caption"}"
            value="${caption}"
            required
          >


          <input
            type="text"
            id="post-alt"
            class="post-form-input"
            placeholder="${isEditing ? "Edit alt text" : "Add alt text"}"
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
            ${isEditing ? "Update" : "Post to feed"}
          </button>


          ${
            isEditing
              ? `
                <button
                  type="button"
                  id="delete-post-button"
                  class="delete-post-button"
                >
                  Delete post
                </button>
              `
              : ""
          }

        </form>

      </main>

    </div>
  `;
}

function setupPostForm(postId, isEditing) {
  const form = document.querySelector("#post-form");

  const titleInput = document.querySelector("#post-title");

  const captionInput = document.querySelector("#post-caption");

  const altInput = document.querySelector("#post-alt");

  const imageInput = document.querySelector("#post-image-url");

  const errorElement = document.querySelector("#post-form-error");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();

    const caption = captionInput.value.trim();

    const altText = altInput.value.trim();

    const imageUrl = imageInput.value.trim();

    if (!title) {
      errorElement.textContent = "Please add a title.";

      return;
    }

    const postData = {
      title,
      body: caption,
    };

    if (imageUrl) {
      postData.media = {
        url: imageUrl,
        alt: altText,
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

      history.pushState({}, "", `/JavaScript2/post?id=${savedPost.id}`);

      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (error) {
      errorElement.textContent = error.message;
    }
  });

  if (isEditing) {
    setupDeleteButton(postId);
  }
}

function setupDeleteButton(postId) {
  const deleteButton = document.querySelector("#delete-post-button");

  if (!deleteButton) {
    return;
  }

  deleteButton.addEventListener("click", async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!confirmed) {
      return;
    }

    try {
    } catch (error) {
      const errorElement = document.querySelector("#post-form-error");

      errorElement.textContent = error.message;
    }
  });
}
