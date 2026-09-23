import { API_POSTS, API_KEY } from "../constants.js";
import { load } from "../../storage/load.js";

export async function addComment(postId, body) {
  const token = load("token");

  const response = await fetch(`${API_POSTS}/${postId}/comment`, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": API_KEY,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      body,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.errors?.[0]?.message || "Unable to add comment");
  }

  return result.data;
}
