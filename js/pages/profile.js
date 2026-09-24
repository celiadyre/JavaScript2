import { getProfile } from "../api/profiles/getProfile.js";
import { getProfilePosts } from "../api/profiles/getProfilePosts.js";
import { load } from "../storage/load.js";

export async function profilePage() {
  const app = document.querySelector("#app");

  const loggedInProfile = load("profile");

  const params = new URLSearchParams(window.location.search);

  const requestedName = params.get("name");

  const profileName = requestedName || loggedInProfile?.name;

  if (!profileName) {
    app.innerHTML = `
      <p class="profile-error">
        Profile not found.
      </p>
    `;

    return;
  }

  app.innerHTML = `
    <p class="profile-loading">
      Loading profile...
    </p>
  `;

  try {
    const [profile, posts] = await Promise.all([
      getProfile(profileName),
      getProfilePosts(profileName),
    ]);

    const isOwnProfile = loggedInProfile?.name === profile.name;

    renderProfile(profile, posts, isOwnProfile);
  } catch (error) {
    app.innerHTML = `
      <p class="profile-error">
        ${error.message}
      </p>
    `;
  }
}

function renderProfile(profile, posts, isOwnProfile) {
  const app = document.querySelector("#app");

  const avatar = profile.avatar?.url;

  const avatarAlt = profile.avatar?.alt || profile.name;

  const followerCount = profile._count?.followers || 0;

  app.innerHTML = `
    <div class="profile-page">

      <header class="profile-header">

        <a
          href="/feed"
          data-link
          class="profile-search"
          aria-label="Back to feed"
        >
          ←
        </a>


        <a
          href="/feed"
          data-link
          class="profile-logo"
        >
          <img
            src="assets/SocialMediaLogo.png"
            alt="Social Media Logo"
          >
        </a>

      </header>


      <main class="profile-main">

        <div class="profile-avatar">

          ${
            avatar
              ? `
                <img
                  src="${avatar}"
                  alt="${avatarAlt}"
                >
              `
              : ""
          }

        </div>


        <div class="profile-username">
          ${profile.name}
        </div>


        <div class="profile-followers">
          ${followerCount}
          ${followerCount === 1 ? "follower" : "followers"}
        </div>


        ${
          profile.bio
            ? `
              <p class="profile-bio">
                ${profile.bio}
              </p>
            `
            : ""
        }


        <section
          id="profile-posts"
          class="profile-posts"
        >

          ${
            posts.length
              ? posts
                  .map((post) => createProfilePost(post, isOwnProfile))
                  .join("")
              : `
                <p class="profile-no-posts">
                  No posts yet.
                </p>
              `
          }

        </section>

      </main>

    </div>
  `;
}

function createProfilePost(post, isOwnProfile) {
  const image = post.media?.url;

  const imageAlt = post.media?.alt || post.title || "Post image";

  return `
    <article class="profile-post">

      <a
        href="/post?id=${post.id}"
        data-link
        class="profile-post-link"
      >

        <div class="profile-post-image">

          ${
            image
              ? `
                <img
                  src="${image}"
                  alt="${imageAlt}"
                >
              `
              : `
                <div
                  class="profile-post-placeholder"
                ></div>
              `
          }

        </div>

      </a>


      ${
        isOwnProfile
          ? `
            <div class="profile-post-edit-container">

              <a
                href="/edit-post?id=${post.id}"
                data-link
                class="profile-post-edit"
              >
                Edit
              </a>

            </div>
          `
          : ""
      }

    </article>
  `;
}
