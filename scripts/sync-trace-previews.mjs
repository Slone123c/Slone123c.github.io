// 把 Trace 的预览页和页面范例生成成 public/trace/ 下可独立打开的静态页。
import { copyFile, readdir, readFile, writeFile } from 'node:fs/promises';
const src = 'docs/design-system/trace';
const out = 'public/trace';
await copyFile(`${src}/components/bundle.js`, `${out}/assets/bundle.js`);
await copyFile('src/styles/trace-bundle.css', `${out}/assets/bundle.css`);
await copyFile('src/styles/trace-tokens.css', `${out}/assets/tokens.css`);

const banners = {
  HomePage: 'Trace 主页范例：文章卡片为示例，尚未链接到真实文章。',
  ArticlePage: 'Trace 文章范例：一篇完整版式的节选，不是本站正式文章。',
  SystemPage: 'Trace 系统剖析范例：国际主义网格版式的节选，不是本站正式文章。',
  ProfilePage: 'Trace 个人页模板：姓名、履历、项目和数字全是占位内容，不是任何人的真实经历。',
};
const responsive = `<style>
.site-note{display:flex;flex-wrap:wrap;gap:4px 16px;justify-content:space-between;padding:8px 16px;background:var(--ink);color:var(--bg);font:12px/20px var(--font-mono)}
.site-note a{color:inherit}
@media(max-width:1000px){.pg{grid-template-columns:minmax(0,1fr)!important;gap:0!important}.pg aside.side{display:none}.home .hero{grid-template-columns:minmax(0,1fr)!important}.home .grid{grid-template-columns:minmax(0,1fr)!important}.sw .hero-num,.sw .hero-txt,.sw .sec-h,.sw .sec-b{grid-column:1/-1!important}.sw .sec-b{border-top:0}.sw .hero-num{font-size:120px;line-height:100px}}
@media(max-width:560px){.pg,.home,.sw{padding-left:16px!important;padding-right:16px!important}.pf{padding-left:16px;padding-right:16px}.pg h1,.sw h1,.home .hero h1{font-size:38px!important;line-height:44px!important}.sw .info div{grid-column:span 6;margin-bottom:8px}.nav nav a{margin-left:12px!important}}
</style>`;
for (const file of await readdir(`${src}/previews`)) {
  const name = file.replace('.html', '');
  // 第一行是 @dsCard 注释，留在 doctype 之前会进入怪异模式。
  let html = (await readFile(`${src}/previews/${file}`, 'utf8')).replace(/^<!-- @dsCard[^\n]*\n/, '');
  const head = `<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><link rel="stylesheet" href="../assets/tokens.css"><link rel="stylesheet" href="../assets/bundle.css"><script src="../assets/react.js"></script><script src="../assets/react-dom.js"></script><script src="../assets/bundle.js"></script>`;
  html = html.replace('<head>', `<head>${head}`);
  if (banners[name]) {
    html = html.replace('</head>', `${responsive}</head>`).replace('<body>', `<body><div class="site-note"><span>${banners[name]}</span><a href="../../design/">← Trace 设计系统</a></div>`);
  }
  await writeFile(`${out}/preview/${file}`, html);
}
