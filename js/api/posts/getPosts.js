import { API_POSTS, API_KEY } from "../constants.js";
import { load } from "../../storage/load.js";

export async function getPosts() {
  const token = load("token");

  const response = await fetch(`${API_POSTS}?_author=true`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": API_KEY,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.errors?.[0]?.message || "Unable to load posts");
  }

  return result.data;
}
