import { API_POSTS, API_KEY } from "../constants.js";
import { load } from "../../storage/load.js";

export async function updatePost(id, postData) {
  const token = load("token");

  const response = await fetch(`${API_POSTS}/${id}`, {
    method: "PUT",

    headers: {
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": API_KEY,
      "Content-Type": "application/json",
    },

    body: JSON.stringify(postData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.errors?.[0]?.message || "Unable to update post");
  }

  return result.data;
}
