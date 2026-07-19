# lumen

极简个人博客，视觉参考 [overreacted.io](https://overreacted.io/)。

- 自定义域名：https://langzyw.xyz/
- GitHub Pages：https://0x826.github.io/blog/

## 开发

```bash
yarn install
yarn dev
```

## 写文章

在 `src/content/posts/` 新增 Markdown 即可。推送到 `main` 后会自动部署。

## 自定义域名 DNS（阿里云）

在域名解析里添加 4 条 **A 记录**（主机记录 `@`）：

| 主机记录 | 记录类型 | 记录值 |
| --- | --- | --- |
| `@` | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |

可选：`www` 的 CNAME 指向 `0x826.github.io`

然后在仓库 Settings → Pages → Custom domain 填入 `langzyw.xyz`，勾选 Enforce HTTPS。
