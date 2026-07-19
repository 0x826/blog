import { getCollection, type CollectionEntry } from "astro:content";
import { withBase } from "./paths";

export type Post = CollectionEntry<"posts">;

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("posts");
  return posts
    .filter((post) => post.data.draft !== true)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 首页列表每页条数 */
export const PAGE_SIZE = 20;

export function getTotalPages(total: number, pageSize = PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function paginatePosts<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const current = Math.max(1, page);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pageSize,
    total: items.length,
    totalPages: getTotalPages(items.length, pageSize),
  };
}

export function pageHref(page: number) {
  return page <= 1 ? withBase("/") : withBase(`/page/${page}/`);
}

export function formatDate(date: Date, style: "short" | "long" = "short") {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
  });
}

export function readingTimeFromBody(body = "") {
  const codeBlocks = body.match(/```[\s\S]*?```/g) ?? [];
  let codeLines = 0;
  for (const block of codeBlocks) {
    // 去掉开头 ```lang 与结尾 ```
    codeLines += Math.max(0, block.split("\n").length - 2);
  }

  const prose = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>|]/g, " ")
    .trim();

  const cn = (prose.match(/[\u4e00-\u9fff]/g) || []).length;
  const en = (prose.match(/[A-Za-z0-9]+/g) || []).length;
  // 正文约 300 字/分；教学向代码按精读约 3 行/分
  return Math.max(1, Math.ceil((cn + en * 0.5) / 300 + codeLines / 3));
}

export function readingLabel(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.ceil(minutes / 30) / 2;
    return `约 ${hours} 小时`;
  }
  return `约 ${minutes} 分钟`;
}

export function slugifyTag(tag: string) {
  // Avoid `/` in tags breaking nested routes (e.g. CI/CD → CI-CD)
  return tag.trim().replaceAll("/", "-");
}

export function getAllTags(posts: Post[]) {
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
}

export function getCategoryStats(posts: Post[]) {
  const map = new Map<string, number>();
  for (const post of posts) {
    map.set(post.data.category, (map.get(post.data.category) ?? 0) + 1);
  }
  return map;
}

export function groupPostsByYear(posts: Post[]) {
  const map = new Map<number, Post[]>();
  for (const post of posts) {
    const year = post.data.pubDate.getFullYear();
    const list = map.get(year) ?? [];
    list.push(post);
    map.set(year, list);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}

export function getRelatedPosts(current: Post, posts: Post[], limit = 3) {
  const scored = posts
    .filter((post) => post.id !== current.id)
    .map((post) => {
      let score = 0;
      if (post.data.category === current.data.category) score += 3;
      if (post.data.series && post.data.series === current.data.series) score += 4;
      const shared = post.data.tags.filter((tag) => current.data.tags.includes(tag));
      score += shared.length * 2;
      return { post, score };
    })
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf(),
    );

  const related = scored.slice(0, limit).map((item) => item.post);
  if (related.length < limit) {
    const ids = new Set([current.id, ...related.map((p) => p.id)]);
    for (const post of posts) {
      if (related.length >= limit) break;
      if (!ids.has(post.id)) related.push(post);
    }
  }
  return related;
}

export function getAdjacentPosts(current: Post, posts: Post[]) {
  const index = posts.findIndex((post) => post.id === current.id);
  return {
    prev: index < posts.length - 1 ? posts[index + 1] : undefined,
    next: index > 0 ? posts[index - 1] : undefined,
  };
}
