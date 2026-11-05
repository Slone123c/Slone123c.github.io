// 由 docs/design-system/trace/tokens.json 生成 src/styles/trace-tokens.css，令牌只有一个来源。
import { readFile, writeFile } from 'node:fs/promises';
const t = JSON.parse(await readFile('docs/design-system/trace/tokens.json', 'utf8'));
const themeValue = (token, theme) => {
  const v = token.value;
  if (typeof v === 'string') return v;
  return v[theme] ?? v.light;
};
const css = v => {
  const alias = /^\{(.+)\}$/.exec(v);
  return alias ? `var(--${alias[1]})` : v;
};
const themed = [...t.color.tokens, ...t.shadow.tokens];
const block = theme => themed.map(x => `  --${x.name}: ${css(themeValue(x, theme))};`).join('\n');
const fixed = [
  ...Object.entries(t.type.families).map(([k, v]) => `  --font-${k}: ${v};`),
  ...t.spacing.tokens.map(x => `  --${x.name}: ${x.value};`),
  ...t.radius.tokens.map(x => `  --${x.name}: ${x.value};`),
].join('\n');
await writeFile('src/styles/trace-tokens.css', `/* Trace — generated from tokens.json by scripts/sync-trace-tokens.mjs; do not edit. */
:root {
  color-scheme: light dark;
${fixed}
${block('light')}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${block('dark').replaceAll('  --', '    --')}
  }
}
:root[data-theme="dark"] {
${block('dark')}
}
`);
