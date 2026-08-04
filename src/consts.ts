/*
 * @Author: peonyJtao peonyfoals@gmail.com
 * @Date: 2026-07-18 14:30:30
 * @LastEditors: peonyJtao peonyfoals@gmail.com
 * @LastEditTime: 2026-07-22 18:31:46
 * @FilePath: /个人博客/src/consts.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const site = {
  name: "rty",
  tagline: `A blog by peony`,
  description: "记录前沿技术、产品思考与数字美学。",
  url: "https://langzyw.xyz",
  author: "peony",
  email: "peonyfoals@gmail.com",
  location: "China",
};

/** 顶栏主题：对应 content/posts 下的文件夹 */
export const topics = [
  {
    id: "web",
    label: "前端",
    description: "前端、工程与系统设计面试相关内容",
  },
  {
    id: "python",
    label: "python",
    description: "python相关内容",
  },
  {
    id: "llm",
    label: "llm",
    description: "llm相关内容",
  },
  {
    id: "web3",
    label: "区块链",
    description: "钱包，索引，智能合约等区块链相关内容",
  },
] as const;

export type TopicId = (typeof topics)[number]["id"];

export const nav = [
  { href: "/", label: "首页" },
  ...topics.map((t) => ({ href: `/${t.id}/`, label: t.label })),
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
  {
    id: "区块链",
    description: "智能合约、协议与 Web3 实践",
  },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export function getTopic(id: string) {
  return topics.find((t) => t.id === id);
}
