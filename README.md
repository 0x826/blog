# lumen

极简个人博客，视觉参考 [overreacted.io](https://overreacted.io/)。

在线访问：https://0x923123123.github.io/blog/

## 开发

```bash
yarn install
yarn dev
```

## 写文章

在 `src/content/posts/` 新增 Markdown 即可。推送到 `main` 后会自动部署。

## 首次启用 GitHub Pages（只需一次）

1. 打开 https://github.com/0x923123123/blog/settings/pages
2. **Build and deployment → Source** 选择 **GitHub Actions**
3. 打开 https://github.com/0x923123123/blog/actions ，确认 `Deploy to GitHub Pages` 成功
4. 约 1–2 分钟后访问 https://0x923123123.github.io/blog/

若仓库是 Private，建议改为 **Public**，便于他人直接访问博客与仓库。
