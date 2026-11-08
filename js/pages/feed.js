import { getPosts } from "../api/posts/getPosts.js";
import { reactToPost } from "../api/posts/reactToPost.js";
import { load } from "../storage/load.js";
import { removeBrokenImages } from "../utils/removeBrokenImages.js";

let allPosts = [];

export async function feedPage() {
  const app = document.querySelector("#app");
  const profile = load("profile");

  app.innerHTML = `
    <div class="min-h-screen bg-white pb-24">

      <header class="flex h-[92px] w-full items-center justify-between bg-green px-5">

        <button
          class="flex h-12 w-12 items-center justify-center bg-transparent p-0 hover:opacity-75"
          id="feed-search-button"
          aria-label="Search posts"
          aria-expanded="false"
          type="button"
        >
          <img
            src="assets/Search.png"
            alt=""
            class="h-7 w-7"
          >
        </button>

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
                  alt="${profile.avatar.alt || profile.name}"
                  class="h-full w-full object-cover"
                >
              `
              : ""
          }
        </a>

      </header>


      <main class="w-full">

        <section
          id="posts-container"
          class="px-5 py-5"
        >
          <p class="p-8 text-center">
            Loading posts...
          </p>
        </section>

      </main>


      <div class="fixed bottom-5 left-1/2 z-10 w-[calc(100%-48px)] max-w-[432px] -translate-x-1/2">

        <a
          href="/create"
          data-link
          class="grid min-h-14 w-full grid-cols-[50px_1fr_50px] items-center rounded-(--radius-medium) bg-dark-green px-3 text-center text-medium text-beige shadow-lg hover:opacity-90 active:opacity-80"
        >
          <span class="text-left text-large">+</span>
          <span>Add to feed</span>
        </a>

      </div>


      <!-- SEARCH POPUP -->

      <section
        id="search-overlay"
        class="fixed inset-0 z-50 mx-auto w-full max-w-[480px] overflow-scroll bg-green"
        aria-label="Search posts"
        hidden
      >

        <header class="flex h-[92px] w-full items-center justify-between px-5">

          <button
            type="button"
            id="close-search-button"
            class="flex h-12 w-12 items-center justify-center bg-transparent p-0 hover:opacity-75"
            aria-label="Close search"
          >
            <img
              src="assets/Search.png"
              alt=""
              class="h-7 w-7"
            >
          </button>

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
                    alt="${profile.avatar.alt || profile.name}"
                    class="h-full w-full object-cover"
                  >
                `
                : ""
            }
          </a>

        </header>


        <div class="px-7 pt-5 pb-12">

          <input
            type="search"
            id="post-search-input"
            class="mb-12 h-[78px] w-full rounded-full bg-beige px-8 text-large text-black focus:outline-none focus:ring-4 focus:ring-dark-green"
            placeholder="Type here..."
            aria-label="Search posts"
            autocomplete="off"
          >


          <div
            id="search-results"
            class="grid grid-cols-2 gap-8"
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
      <p class="p-8 text-center text-small text-red">
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
      <p class="p-8 text-center">
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
        <article class="feed-post mb-12">

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


          <a
            href="/post?id=${post.id}"
            data-link
            class="block"
          >

            <div class="aspect-square w-full overflow-hidden rounded-(--radius-medium) bg-placeholder">

              <img
                src="${image}"
                alt="${imageAlt}"
                class="h-full w-full object-cover"
                data-remove-on-error=".feed-post"
                referrerpolicy="no-referrer"
                loading="lazy"
              >

            </div>

          </a>


          <div class="px-2 pt-3">

            ${
              caption
                ? `
                  <p class="mb-3 text-small">
                    ${caption}
                  </p>
                `
                : ""
            }


            <div class="mt-3 flex items-center gap-5">

              <button
                class="post-like-button flex items-center gap-2 bg-transparent p-0 text-small text-black hover:opacity-75 active:opacity-60"
                type="button"
                data-post-id="${post.id}"
                aria-label="Like post"
              >

                <img
                  src="assets/LikeStandard.png"
                  alt="Like"
                  class="like-icon h-6 w-6"
                >

                <span class="like-count">
                  ${reactionCount}
                </span>

              </button>


              <a
                href="/post?id=${post.id}"
                data-link
                class="flex items-center gap-2 text-small text-black hover:opacity-75"
                aria-label="View comments"
              >

                <img
                  src="assets/Comment.png"
                  alt="Comments"
                  class="h-6 w-6"
                >

                <span>
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
      <p class="col-span-2 my-8 text-center text-medium text-white">
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
          class="search-result-card block aspect-square w-full overflow-hidden rounded-(--radius-medium) bg-placeholder hover:opacity-90"
          aria-label="Open ${post.title || "post"}"
        >
          <img
            src="${image}"
            alt="${imageAlt}"
            class="h-full w-full object-cover"
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