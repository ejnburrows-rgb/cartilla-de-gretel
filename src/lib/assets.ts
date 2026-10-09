export function assetPath(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const cleanPath = path ? path.replace(/^\/+/, "") : "";
  return cleanPath ? `${base}/${cleanPath}` : `${base}/`;
}

export function routePath(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const cleanPath = path && !path.startsWith("/") ? `/${path}` : path || "";
  return `${base}${cleanPath}`;
}
