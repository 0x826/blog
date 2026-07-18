/** Prefix a site-root path with Astro `base` (e.g. `/blog/` on GitHub Pages). */
export function withBase(path = "/"): string {
  const base = import.meta.env.BASE_URL || "/";
  if (!path || path === "/") return base;
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${normalized}`;
}

export function postHref(id: string): string {
  return withBase(`posts/${id}/`);
}

export function stripBase(pathname: string): string {
  const base = import.meta.env.BASE_URL || "/";
  if (base === "/") return pathname;
  const prefix = base.replace(/\/$/, "");
  if (pathname === prefix || pathname === `${prefix}/`) return "/";
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname;
}
