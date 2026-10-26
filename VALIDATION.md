# 部署验证记录

## 范围与界面

目标：保留 Markdown 写作能力，验证图解、嵌入交互、独立实验及 GitHub Pages 自动部署。
目标仓库：Slone123c/Slone123c.github.io；经用户授权覆盖旧站点，Git 历史保留。
主任务：从首页进入文章，阅读图表，调节波形，进入独立实验。
布局以文章与可操作波形为主；系统字体、浅底、深绿描边与强调色。初始暂停，支持播放、暂停、重置和切后台暂停。桌面与窄屏共用语义控件。
本次为 P0，不做个人品牌视觉探索；未看外部标杆图片，不作视觉评分。两篇文章为示例。

## 证据

- 本地使用 npx 提供的 Node v24.22.1（本机 node@24 Homebrew 链接实际为 v26.6.0）。
- npm install 成功，提交 package-lock.json；注册源固定为 npm 官方源。
- npm run check：0 errors / 0 warnings / 0 hints。
- npm run build：生成 6 个静态页面；Mermaid 的较大分包有体积提示，不阻塞构建。
- npm run verify：Chromium，1280×900 和 390×844，六条路由各验证一次，共 12 项通过。
- 真实浏览器验证 Mermaid 已转为 SVG，文章 SVG 图片加载成功；普通 Markdown 未挂载 React island。
- 两个交互入口均验证振幅、频率、播放、暂停、重置；独立页面刷新 200；无页面异常、console error 或 HTTP 4xx/5xx。
- 临时新增 route-proof.md：构建自动出现 /blog/route-proof/ 且进入列表，未修改全局路由；验证后删除临时文章。
- 已查看 evidence/ 下桌面文章、窄屏实验截图：控件完整可见，页面无横向溢出。
- 真机手机尚未验证，390px 桌面浏览器模拟通过。
- GitHub Actions 与公网验证：待部署。

复验：npm ci；npm run check；npm run build；npm run preview。另开终端运行 npm run verify。首次需 npx playwright install chromium。公网复验：VERIFY_URL=https://slone123c.github.io/ npm run verify。

## 相对原计划的调整

Astro 7 显式使用 @astrojs/markdown-remark 的 unified processor，schema 从 astro/zod 导入。rehype-mermaid 即使使用 pre-mermaid 策略，模块加载也需要 playwright 包；CI 只需安装包，不需要下载浏览器。只有本地浏览器验收需安装 Chromium。

参考：[Astro 官方 GitHub Pages 部署](https://docs.astro.build/en/guides/deploy/github/)、[rehype-mermaid 策略说明](https://github.com/remcohaszing/rehype-mermaid)。
