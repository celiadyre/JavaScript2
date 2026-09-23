import { API_POSTS, API_KEY } from "../constants.js";
import { load } from "../../storage/load.js";

/**
 * Adds or removes a reaction on a post.
 * @param {string|number} postId - The ID of the post.
 * @param {string} symbol - The emoji reaction to toggle.
 * @returns {Promise<Object>} The updated reaction data.
 */
export async function reactToPost(postId, symbol = "❤️") {
  const token = load("token");

  const response = await fetch(
    `${API_POSTS}/${postId}/react/${encodeURIComponent(symbol)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.errors?.[0]?.message || "Unable to react to post");
  }

  return result.data;
}
