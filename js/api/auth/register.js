import { API_REGISTER } from "../constants.js";

export async function register(name, email, password) {
  const response = await fetch(API_REGISTER, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.errors?.[0]?.message || "Unable to register");
  }

  return result.data;
}
