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
| 页面骨架 | `src/styles/global.css` | 只放 Trace 组件之外的版面 |

站点是静态 Astro，没有引入 `window.Trace` 的 React bundle；页面直接使用 `tr-*` 类名和相同的 DOM 结构。

## 尚未迁移

`/explore/go-map/` 是全屏滚动叙事，每章有独立配色（`src/experiences/go-map/content.ts`），仍保留原有视觉。
