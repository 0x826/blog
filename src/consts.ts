/*
 * @Author: peonyJtao peonyfoals@gmail.com
 * @Date: 2026-07-18 14:30:30
 * @LastEditors: peonyJtao peonyfoals@gmail.com
 * @LastEditTime: 2026-07-19 11:09:26
 * @FilePath: /个人博客/src/consts.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const site = {
  name: "lumen",
  tagline: `A blog by peony`,
  description: "记录前沿技术、产品思考与数字美学。",
  url: "https://langzyw.xyz",
  author: "peony",
  email: "peonyfoals@gmail.com",
  location: "China",
};


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
  {
    id: "区块链",
    description: "智能合约、协议与 Web3 实践",
  },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
