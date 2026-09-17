import { API_LOGIN } from "../constants.js";
import { save } from "../../storage/save.js";

export async function login(email, password) {
  const response = await fetch(API_LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.errors?.[0]?.message || "Unable to sign in");
  }

  save("token", result.data.accessToken);
  save("profile", result.data);

  return result.data;
}
