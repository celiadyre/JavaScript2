import { API_POSTS, API_KEY } from "../constants.js";
import { load } from "../../storage/load.js";

export async function deletePost(postId) {
  const token = load("token");

  const response = await fetch(`${API_POSTS}/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": API_KEY,
    },
  });

  if (!response.ok) {
    let message = "Unable to delete post";

    try {
      const result = await response.json();

      message = result.errors?.[0]?.message || message;
    } catch {
      // DELETE may not return JSON
    }

    throw new Error(message);
  }

  return true;
}
