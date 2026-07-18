export const site = {
  name: "lumen",
  tagline: `A blog by JTao`,
  description: "记录前沿技术、产品思考与数字美学。",
  url: "https://0x923123123.github.io/blog",
  author: "JTao",
  email: "hello@lumen.dev",
  location: "China",
};

export const social = [
  { label: "GitHub", href: "https://github.com/0x923123123/blog" },
  { label: "RSS", href: "https://0x923123123.github.io/blog/rss.xml" },
  { label: "Email", href: `mailto:${site.email}` },
] as const;

export const nav = [
  { href: "/", label: "首页" },
  { href: "/about/", label: "关于" },
] as const;

export const categories = [
  {
    id: "前端",
    description: "界面、框架与浏览器侧工程实践",
  },
  {
    id: "工程",
    description: "构建、架构、协作与工程效率",
  },
  {
    id: "设计",
    description: "视觉语言、交互质感与数字美学",
  },
  {
    id: "产品",
    description: "产品直觉、体验决策与叙事",
  },
  {
    id: "随笔",
    description: "阅读、方法论与长期主义笔记",
  },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
