import { API_POSTS, API_KEY } from "../constants.js";
import { load } from "../../storage/load.js";

export async function getPost(id) {
  const token = load("token");

  const response = await fetch(
    `${API_POSTS}/${id}?_author=true&_comments=true&_reactions=true`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.errors?.[0]?.message || "Unable to load post");
  }

  return result.data;
}
