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

站点文件已推送到 `gh-pages` 分支。请按下面设置：

1. 打开 https://github.com/0x923123123/blog/settings/pages
2. **Build and deployment → Source** 选择 **Deploy from a branch**
3. Branch 选 **gh-pages**，文件夹选 **/ (root)**
4. 点 **Save**
5. 建议把仓库设为 **Public**（免费账号私有仓库可能无法发布 Pages）
6. 约 1 分钟后打开 https://0x923123123.github.io/blog/
