import { BASE_URL } from "./apiPaths";

// profile pics are stored as /uploads/... on our server
export function getProfileImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}
