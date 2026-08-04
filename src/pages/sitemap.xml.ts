import type { APIRoute } from "astro";
import { site, topics } from "../consts";
import { getPublishedPosts, getTotalPages, PAGE_SIZE } from "../lib/posts";
import { postHref, withBase } from "../lib/paths";

export const GET: APIRoute = async ({ site: astroSite }) => {
  const posts = await getPublishedPosts();
  const siteUrl = (astroSite?.href ?? site.url).replace(/\/$/, "");
  const totalPages = getTotalPages(posts.length, PAGE_SIZE);
  const base = withBase("/").replace(/\/$/, "") || "";

  const staticPages = ["", "tags/", "archive/", "about/", ...topics.map((t) => `${t.id}/`)];
  const pageUrls = Array.from({ length: totalPages - 1 }, (_, i) => `page/${i + 2}/`);

  const urls = [
    ...staticPages.map((path) => `${siteUrl}${base}/${path}`),
    ...pageUrls.map((path) => `${siteUrl}${base}/${path}`),
    ...posts.map((post) => `${siteUrl}${postHref(post.id)}`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.replace(/([^:]\/)\/+/g, "$1")}</loc>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
