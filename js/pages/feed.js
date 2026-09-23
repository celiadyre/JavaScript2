import { getPosts } from "../api/posts/getPosts.js";
import { reactToPost } from "../api/posts/reactToPost.js";
import { load } from "../storage/load.js";

export async function feedPage() {
  const app = document.querySelector("#app");
  const profile = load("profile");

  app.innerHTML = `
    <div class="feed-page">

      <header class="feed-header">

        <button
          class="feed-search-button"
          id="feed-search-button"
          aria-label="Search"
          type="button"
        >
          <span class="search-icon"></span>
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

    </div>
  `;

  try {
    const posts = await getPosts();

    renderPosts(posts);
    setupPostInteractions();
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

  if (!posts.length) {
    container.innerHTML = `
      <p class="feed-empty">
        No posts yet.
      </p>
    `;

    return;
  }

  container.innerHTML = posts
    .map((post) => {
      const username = post.author?.name || "Unknown user";

      const avatar = post.author?.avatar?.url;

      const image = post.media?.url;

      const imageAlt = post.media?.alt || post.title || "Post image";

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

              ${
                image
                  ? `
                    <img
                      src="${image}"
                      alt="${imageAlt}"
                      class="post-image"
                    >
                  `
                  : `
                    <div class="post-image-placeholder"></div>
                  `
              }

            </div>

          </a>


          <div class="post-content">

            ${
              post.title
                ? `
                  <h2 class="post-title">
                    ${post.title}
                  </h2>
                `
                : ""
            }


            ${
              post.body
                ? `
                  <p class="post-body">
                    ${post.body}
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
