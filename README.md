# Slone 的交互式技术博客

Astro 静态站点，普通 Markdown、MDX + React、Mermaid 与 SVG。发布到 https://slone123c.github.io/ 。

使用 Node.js 24：`npm ci`、`npm run check`、`npm run build`。开发：`npm run dev`；构建预览：`npm run preview`。

文章位于 `src/content/blog/`，新增 Markdown 无需修改路由。交互代码位于 `src/experiences/`，独立页面位于 `src/pages/explore/`。内部链接统一使用 `sitePath()`。

`main` 分支推送自动触发 GitHub Pages 部署，Actions 在 Node 24 下先检查再构建。`site/base` 根据 `GITHUB_REPOSITORY` 推导，支持用户站点根路径和项目子路径。

这是部署可行性验证工程，页面中的两篇文章为演示内容。旧站点保留在 Git 历史中。
