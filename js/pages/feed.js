import { getPosts } from "../api/posts/getPosts.js";
import { reactToPost } from "../api/posts/reactToPost.js";
import { load } from "../storage/load.js";
import { removeBrokenImages } from "../utils/removeBrokenImages.js";

let allPosts = [];

export async function feedPage() {
  const app = document.querySelector("#app");
  const profile = load("profile");

  app.innerHTML = `
    <div class="feed-page">

      <header class="feed-header">

        <button
          class="feed-search-button"
          id="feed-search-button"
          aria-label="Search posts"
          aria-expanded="false"
          type="button"
        >
          <img
            src="assets/Search.png"
            alt=""
            class="search-button-icon"
          >
        </button>

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
          aria-label="My profile"
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


      <main class="feed-main">

        <section
          id="posts-container"
          class="posts-container"
        >
          <p class="feed-loading">
            Loading posts...
          </p>
        </section>

      </main>


      <div class="add-post-container">

        <a
          href="/create"
          data-link
          class="add-post-button"
        >
          <span class="add-post-plus">+</span>
          <span>Add to feed</span>
        </a>

      </div>


      <!-- SEARCH POPUP -->

      <section
        id="search-overlay"
        class="search-overlay"
        aria-label="Search posts"
        hidden
      >

        <header class="search-header">

          <button
            type="button"
            id="close-search-button"
            class="search-close-button"
            aria-label="Close search"
          >
            <img
              src="assets/Search.png"
              alt=""
              class="search-button-icon"
            >
          </button>

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
            aria-label="My profile"
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


        <div class="search-interface">

          <input
            type="search"
            id="post-search-input"
            class="post-search-input"
            placeholder="Type here..."
            autocomplete="off"
          >


          <div
            id="search-results"
            class="search-results"
          ></div>

        </div>

      </section>

    </div>
  `;

  try {
    const posts = await getPosts();

    allPosts = posts;

    renderPosts(posts);
    removeBrokenImages();
    setupPostInteractions();
    setupSearch();
  } catch (error) {
    document.querySelector("#posts-container").innerHTML = `
      <p class="feed-error">
        ${error.message}
      </p>
    `;
  }
}

function renderPosts(posts) {
  const container = document.querySelector("#posts-container");

  const postsWithImages = posts.filter((post) => post.media?.url);

  if (!postsWithImages.length) {
    container.innerHTML = `
      <p class="feed-empty">
        No posts with images yet.
      </p>
    `;

    return;
  }

  container.innerHTML = postsWithImages
    .map((post) => {
      const username = post.author?.name || "Unknown user";

      const avatar = post.author?.avatar?.url;

      const image = post.media.url;

      const imageAlt = post.media?.alt || post.title || "Post image";

      const caption = post.body || post.title || "";

      const reactionCount = post._count?.reactions || 0;

      const commentCount = post._count?.comments || 0;

      return `
        <article class="feed-post">

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


          <a
            href="/post?id=${post.id}"
            data-link
            class="post-image-link"
          >

            <div class="post-image-container">

              <img
                src="${image}"
                alt="${imageAlt}"
                class="post-image"
                data-remove-on-error=".feed-post"
                referrerpolicy="no-referrer"
                loading="lazy"
              >

            </div>

          </a>


          <div class="post-content">

            ${
              caption
                ? `
                  <p class="post-body">
                    ${caption}
                  </p>
                `
                : ""
            }


            <div class="post-engagement">

              <button
                class="post-like-button"
                type="button"
                data-post-id="${post.id}"
                aria-label="Like post"
              >

                <img
                  src="assets/LikeStandard.png"
                  alt="Like"
                  class="like-icon"
                >

                <span class="like-count">
                  ${reactionCount}
                </span>

              </button>


              <a
                href="/post?id=${post.id}"
                data-link
                class="post-comments"
                aria-label="View comments"
              >

                <img
                  src="assets/Comment.png"
                  alt="Comments"
                  class="comment-icon"
                >

                <span class="comment-count">
                  ${commentCount}
                </span>

              </a>

            </div>

          </div>

        </article>
      `;
    })
    .join("");

  removeBrokenImages();
}

function setupSearch() {
  const openButton = document.querySelector("#feed-search-button");

  const closeButton = document.querySelector("#close-search-button");

  const overlay = document.querySelector("#search-overlay");

  const searchInput = document.querySelector("#post-search-input");

  openButton.addEventListener("click", () => {
    overlay.hidden = false;

    openButton.setAttribute("aria-expanded", "true");

    renderSearchResults(allPosts);

    searchInput.focus();
  });

  closeButton.addEventListener("click", () => {
    closeSearch();
  });

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredPosts = filterPosts(allPosts, searchTerm);

    renderSearchResults(filteredPosts);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) {
      closeSearch();
    }
  });

  function closeSearch() {
    overlay.hidden = true;

    openButton.setAttribute("aria-expanded", "false");

    searchInput.value = "";
  }
}

function filterPosts(posts, searchTerm) {
  if (!searchTerm) {
    return posts;
  }

  return posts.filter((post) => {
    const searchableValues = [
      post.title,
      post.body,
      post.media?.alt,
      post.author?.name,
      ...(post.tags || []),
    ];

    return searchableValues.some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(searchTerm),
    );
  });
}

function renderSearchResults(posts) {
  const container = document.querySelector("#search-results");

  const postsWithImages = posts.filter((post) => post.media?.url);

  if (!postsWithImages.length) {
    container.innerHTML = `
      <p class="search-no-results">
        No posts found.
      </p>
    `;

    return;
  }

  container.innerHTML = postsWithImages
    .map((post) => {
      const image = post.media.url;

      const imageAlt = post.media?.alt || post.title || "Post image";

      return `
        <a
          href="/post?id=${post.id}"
          data-link
          class="search-result-card"
          aria-label="Open ${post.title || "post"}"
        >
          <img
            src="${image}"
            alt="${imageAlt}"
            class="search-result-image"
            data-remove-on-error=".search-result-card"
            referrerpolicy="no-referrer"
            loading="lazy"
          >
        </a>
      `;
    })
    .join("");

  removeBrokenImages();
}

function setupPostInteractions() {
  const likeButtons = document.querySelectorAll(".post-like-button");

  likeButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const postId = button.dataset.postId;

      const icon = button.querySelector(".like-icon");

      const count = button.querySelector(".like-count");

      const isLiked = button.classList.contains("liked");

      try {
        await reactToPost(postId);

        if (isLiked) {
          icon.src = "assets/LikeStandard.png";

          count.textContent = Math.max(0, Number(count.textContent) - 1);

          button.classList.remove("liked");
        } else {
          icon.src = "assets/LikePressed.png";

          count.textContent = Number(count.textContent) + 1;

          button.classList.add("liked");
        }
      } catch (error) {
        console.error("Could not update like:", error);
      }
    });
  });
}
