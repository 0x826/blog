import type { APIRoute } from "astro";
import { getTopic } from "../consts";
import { getPostTopicId, getPublishedPosts } from "../lib/posts";
import { postHref } from "../lib/paths";

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const items = posts.map((post) => {
    const topicId = getPostTopicId(post.id);
    const topic = getTopic(topicId);
    return {
      title: post.data.title,
      description: post.data.description,
      href: postHref(post.id),
      topic: topic?.label ?? topicId,
    };
  });

  return new Response(JSON.stringify(items), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};
