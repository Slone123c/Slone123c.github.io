# 交互式个人博客：立即部署验证计划

> 版本：P0 / Deployment Proof-of-Concept（2026-10-26）  
> 目标：静态 Markdown 文章 + 完全独立的自定义交互代码 + GitHub Pages 公网访问。  
> 交付：一个可自由设计页面的 Astro 工程、2 篇示例文章、一个独立交互页面、GitHub Actions 工作流。

## 0. 项目定位

- **内容**：文章原稿为 `.md`（普通文章）或 `.mdx`（需要内嵌组件）；Mermaid 和 SVG 属于文档的一部分。
- **体验**：每篇文章可以不交互，也可以嵌入 React 组件，或链接到一个完全独立的 `/explore/*` 交互页面。复杂体验可以拥有自己的 TS、CSS、Canvas、WebGL 和 WebAssembly 文件。
- **站点页面**：主页、个人简介、文章列表、具体文章页、实验页均自主设计；不要求套用任何博客主题。
- **发布**：GitHub Actions 生成静态站点，GitHub Pages 托管。读者的浏览器负责执行 JS 交互。
- **后端**：Cloudflare Workers 是按需扩展，P0 不需要数据库、登录或后端。

### 选型冻结

| 范畴 | P0 选择 | 说明 |
|---|---|---|
| 框架 | Astro | 静态输出、文件路由、独立页面布局 |
| 内容 | Markdown/MDX + Content Collections | 文章管理，带 schema 的 Frontmatter |
| 交互 | React + TypeScript | 每篇文章交互独立开发；不限交互种类 |
| 图表 | Mermaid + SVG | Mermaid 用 `rehype-mermaid` 转预渲染前端源码，浏览器用 `mermaid` 输出 SVG；普通 SVG 可作为资产插入 |
| 样式 | 原生 CSS + CSS Modules | 可自由设计；Tailwind 是后续可选项 |
| 发布 | GitHub Pages / GitHub Actions | 代码提交触发构建、部署 |
| 可选计算 | Cloudflare Workers | 仅服务端计算或外部 API 真正必要时接入 |

## 1. 验证通过的定义（必须满足）

- [x] 主页与 About 均能访问，且布局可自由改写。
- [x] `/blog/hello/` 为普通 Markdown，没有自定义 React 交互。
- [x] 普通文章中的 Mermaid 流程图成功渲染，不是原始代码。
- [x] 普通文章中的 SVG 图片显示正常。
- [x] `/blog/algorithm/` 中的交互 React 程序可调节参数、播放/暂停动画。
- [x] `/explore/algorithm/` 能独立访问、刷新不会 404、交互正常。
- [x] GitHub Actions 构建完成，公网 `https://<USER>.github.io/<REPO>/` 可访问。
- [ ] 移动端浏览器能加载交互，无前端控制台致命错误。（390px Chromium 模拟已通过；真机待验）
- [x] 后续新建 `.md` 不需要修改全局页面路由；新建体验只需新增源文件和可选独立路由。

## 2. 快速开始（推荐使用随附 ZIP）

环境：Git、Node.js **24**、npm、一个 GitHub 账号、可以访问 npm registry 的网络。

```bash
# 1. 解压 interactive-blog-starter.zip 并进入项目
cd interactive-blog-starter

# 2. 安装依赖（会生成 package-lock.json）
npm install

# 3. 启动本地服务
npm run dev

# 4. 验证类型和静态构建
npm run check
npm run build
npm run preview
```

本地入口：`http://localhost:4321/`。用导航进入“文章”，依次验证 `hello` 与 `algorithm`。

如果你不使用 ZIP、而希望自己创建一个干净的 Astro 工程：

```bash
npm create astro@latest my-blog
cd my-blog
npx astro add react mdx
npm install mermaid rehype-mermaid @astrojs/markdown-remark
```

再按照随附项目的目录与文件逐步添加 Content Collections、路由、交互组件与部署工作流。

## 3. 目录边界

```text
src/
  pages/
    index.astro                       # 你自主设计的主页
    about.astro                       # 你自主设计的个人介绍
    blog/index.astro                  # 文章列表
    blog/[...slug].astro              # 自动静态生成文章页
    explore/algorithm.astro           # 某篇文章的独立体验路由
  content/blog/
    hello.md                          # 纯静态文章
    algorithm.mdx                     # 内嵌 React 的文章
    diagram.svg                       # SVG 资产
  experiences/
    algorithm/App.tsx                 # 专属交互逻辑
    algorithm/App.module.css          # 专属样式
  content.config.ts                   # schema，含可选 interactive.path
  layouts/
    Base.astro
    Article.astro
  lib/path.ts                          # 统一处理 GitHub Pages base 子路径
.github/workflows/deploy.yml
astro.config.mjs
```

### 每次添加文章的规则

- **纯静态**：增加 `xxx.md`，写 Markdown；不需要引入 React。
- **文章内交互**：增加 `xxx.mdx`，在文件顶端 import 专属组件，在目标段落使用 `<SomeApp client:visible />`。
- **独立实验**：增加 `src/experiences/xxx/`，以及 `src/pages/explore/xxx.astro`；在原文 Frontmatter 中可选写入：

```yaml
interactive:
  path: "explore/xxx/" # 仓库子路径由工具自动补齐，不要以 / 开头
  label: "进入交互实验"
```

### React 并不是交互的限制

基础项目使用 React 是为了方便实现状态、事件与复杂组件。但独立体验页仍可使用原生 TypeScript、Canvas、SVG、WebGL、Three.js、WebAssembly 等。无需对所有文章强制加载这些依赖。

## 4. Mermaid 和 SVG 的验证策略

### Mermaid

P0 采用浏览器端 SVG 渲染以简化 CI：

1. `rehype-mermaid` 使用 `strategy: 'pre-mermaid'` 将 `mermaid` fenced block 变为 `<pre class="mermaid">`。
2. Astro 对 `mermaid` 排除 Shiki 代码高亮，保留 Mermaid 的原始源文本。
3. 文章布局从 npm 模块导入 Mermaid，在浏览器里用 `mermaid.run()` 绘制。
4. 默认 `securityLevel: 'strict'`，不要直接允许不可信内容的脚本执行。

> 若将来大量文章有 Mermaid，建议改用构建期 SVG 输出以减少读者下载的 JS；该路线在 CI 中可能需要额外 Playwright/Chromium 安装，**不属于 P0**。

### SVG

- 静态 SVG：在文章里使用 `![说明](./diagram.svg)`，与文章同目录管理。
- 程序式 SVG：直接在 React 或 `.astro` 页面中编写 `<svg>`，支持事件、动画和状态更新。
- 不可信来源的 SVG 不要未经审核直接内联到 DOM。

## 5. 发布到 GitHub Pages

### 5.1 创建仓库与推送

1. 登录 GitHub，创建一个 **public** 仓库，例如 `interactive-blog-starter`，不要用 GitHub 自动初始化 README（本地已有）。
2. 在本地项目目录执行：

```bash
git init
git branch -M main
git add .
git commit -m "feat: initial interactive blog proof of concept"
git remote add origin https://github.com/<USER>/<REPO>.git
git push -u origin main
```

把 `<USER>` 和 `<REPO>` 替换为真实 GitHub 用户名及仓库名称，`<...>` 只是占位符，不要原样复制进 shell。

### 5.2 设置 Pages

进入仓库 `Settings → Pages → Build and deployment → Source`，选择 **GitHub Actions**。如果 Actions 首次未触发，可以在 Actions 标签页运行 `Deploy Astro to GitHub Pages` 工作流。

### 5.3 工作流

示例项目的 `.github/workflows/deploy.yml` 已按当前 Astro 官方推荐格式配置。包括：

- `actions/checkout@v7`
- `withastro/action@v6`（构建、上传静态产物）
- `actions/deploy-pages@v5`（发布至 Pages）
- Pages 权限 `contents: read, pages: write, id-token: write`

**注意**：`package-lock.json` 必须与源代码一并 commit，官方 Action 会根据锁文件识别包管理器。

### 5.4 网址和子路径

- 普通项目仓库：`https://<USER>.github.io/<REPO>/`
- 特殊仓库 `<USER>.github.io`：`https://<USER>.github.io/`

样板使用 `GITHUB_REPOSITORY` 和 `GITHUB_REPOSITORY_OWNER` 自动推导 `site/base`，并统一由 `sitePath()` 生成内部链接，避免在 GitHub Pages 下资源与导航 404。

如果之后绑定自定义域名，需同步修改站点 `site/base` 的推导策略，并按 Astro 官方指南配置 GitHub Pages 域名及 DNS。

## 6. P0 验收顺序

| 顺序 | 验收点 | 检查方法 |
|---|---|---|
| 1 | 本地安装完成 | `npm install` 无失败 |
| 2 | Astro 类型/构建通过 | `npm run check`、`npm run build` 无错误 |
| 3 | 普通文章 | 浏览 `/blog/hello/` |
| 4 | Mermaid/SVG | 流程图和 SVG 都可见 |
| 5 | 文章内交互 | 修改振幅/频率后波形实时变化 |
| 6 | 独立交互 | `/explore/algorithm/` 可访问、可刷新、动画可播放 |
| 7 | CI 部署 | GitHub Actions 绿色成功状态 |
| 8 | 公网访问 | 仓库 Pages 地址与手机访问正常 |
| 9 | 自动更新 | 改 Markdown，commit + push 后线上内容更新 |

## 7. 故障排查

- `npm install` / `npm run build` 失败：检查 Node 24、网络、锁文件和依赖版本。先 `npm run check` 读取类型错误。
- 页面 404 / 导航跳出仓库子路径：确认 Pages 构建基址，检查 `sitePath()`，**不要直接写** `href="/blog/..."`。
- GitHub Pages 无内容：在 `Settings → Pages` 选择 GitHub Actions，查看工作流日志、仓库 Actions 权限和构建脚本。
- 交互在本地可用、线上失效：打开浏览器开发者工具检查 JS 请求 404 和 Console 错误，尤其是硬编码了根路径的资源。
- Mermaid 仍显示代码：查看 Astro processor、`pre-mermaid` 配置和前端控制台，确认 Mermaid JS 被打包进文章页。
- 按图表变动时卡顿：延迟挂载 `client:visible`，或把重计算移入 Web Worker/WASM；不要求改动博客框架。

## 8. Cloudflare Workers：仅作为 P1

出现以下情况再接入独立 Worker：外部 API 密钥、需要保存状态、浏览器不适合的计算、AI 模型接口、跨设备数据等。届时：

1. 建立独立 `workers/compute-api` 工程（或独立仓库）。
2. 定义 JSON API 契约，例如 `POST /api/simulate`，浏览器使用 `fetch` 调用。
3. Worker 密钥使用 Secrets，不写到前端。配置允许博客域名的 CORS，限流和参数校验。
4. 计算耗时很长的任务根据 Worker 的 CPU/执行限制选择队列或其他计算服务。
5. **不需要从 GitHub Pages 迁走博客**。

## 9. P1/P2 后续规划（暂不阻塞部署）

**P1：** 个人风格页面设计、标签/搜索、文章目录、SEO、RSS、错误页、交互加载态、图表暗色主题、性能与可访问性。  
**P2：** Cloudflare Workers、持久化、交互版本化、代码运行沙箱、自动测试、交互组件共享库。

## 10. 本次交付状态和参考资料

- 已完成：代码包文件生成、目录结构检查、依据官方文档核实 Pages 工作流与内容管理接口。
- 2026-10-26 实测更新：已完成真实 npm 安装、Node 24 类型检查与静态构建、GitHub Actions 部署及公网浏览器验证。站点：https://slone123c.github.io/ 。详细证据见 `VALIDATION.md`；真机手机仍待验。

官方资料：

- Astro 安装 https://docs.astro.build/en/install-and-setup/
- Astro Github Pages https://docs.astro.build/en/guides/deploy/github/
- Astro Content Collections https://docs.astro.build/en/guides/content-collections/
- Astro MDX https://docs.astro.build/en/guides/integrations-guide/mdx/
- rehype-mermaid https://github.com/remcohaszing/rehype-mermaid
- Mermaid JS https://mermaid.js.org/config/usage
