import { API_PROFILES, API_KEY } from "../constants.js";
import { load } from "../../storage/load.js";

export async function unfollowProfile(name) {
  const token = load("token");

  const response = await fetch(
    `${API_PROFILES}/${encodeURIComponent(name)}/unfollow`,
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
    throw new Error(result.errors?.[0]?.message || "Unable to unfollow user");
  }

  return result.data;
}
