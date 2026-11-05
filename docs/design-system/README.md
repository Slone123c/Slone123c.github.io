# 设计系统

本站使用 Trace。`trace/` 是从设计系统原件同步来的副本，改风格请先改原件，再重新同步。

- 原件：https://claude.ai/artifact/DsgYferWabSx6rTxF8kgqn（私有）
- 同步版本：`1793867405-e91e`（2026-11-05）
- 品牌手册：[`trace/README.md`](trace/README.md)；组件指南：`trace/components/*.md`；类型：`trace/components/index.d.ts`

## 文件如何落到站点

| 原件 | 项目内 | 说明 |
| --- | --- | --- |
| `tokens.json` | `docs/design-system/trace/tokens.json` | 令牌唯一来源 |
| 生成的 CSS 变量 | `src/styles/trace-tokens.css` | `npm run sync:trace` 生成，不手改 |
| `components/bundle.css` | `src/styles/trace-bundle.css` | 原样复制，不手改 |
| `components/bundle.js`、`*/preview.html` | `trace/components/bundle.js`、`trace/previews/` | 原样复制 |
| 可打开的预览页 | `public/trace/` | `npm run sync:trace` 生成，不手改 |
| 页面骨架 | `src/styles/global.css` | 只放 Trace 组件之外的版面 |

站点正式页面是静态 Astro，直接使用 `tr-*` 类名。`public/trace/` 下的封面和页面范例运行原版 `window.Trace` bundle，并自带 React 18.3.1（站点其余部分用 React 19）。

`ProfilePage` 是占位模板，内容不是真实经历，页面顶部有说明。换成真实内容前不要把它链接到「关于」。

组件指南和组件预览只保留在 `docs/`，不发布到站点。

## 尚未迁移

`/explore/go-map/` 是全屏滚动叙事，每章有独立配色（`src/experiences/go-map/content.ts`），仍保留原有视觉。
