/** Prefix a site-root path with Astro `base` (e.g. `/blog/` on GitHub Pages). */
export function withBase(path = "/"): string {
  const base = import.meta.env.BASE_URL || "/";
  if (!path || path === "/") return base;
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${normalized}`;
}

/** 文章 URL：/{topic}/{slug}/，例如 /web3/solidity/ */
export function postHref(id: string): string {
  return withBase(`${id}/`);
}

/** 主题列表页 URL：/{topic}/ */
export function topicHref(topicId: string): string {
  return withBase(`${topicId}/`);
}

export function stripBase(pathname: string): string {
  const base = import.meta.env.BASE_URL || "/";
  if (base === "/") return pathname;
  const prefix = base.replace(/\/$/, "");
  if (pathname === prefix || pathname === `${prefix}/`) return "/";
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname;
}
