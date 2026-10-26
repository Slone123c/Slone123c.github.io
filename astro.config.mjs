import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import rehypeMermaid from 'rehype-mermaid';
const [owner, repo] = (process.env.GITHUB_REPOSITORY || 'Slone123c/Slone123c.github.io').split('/');
export default defineConfig({
  site: `https://${owner.toLowerCase()}.github.io`,
  base: repo.toLowerCase() === `${owner.toLowerCase()}.github.io` ? '/' : `/${repo}`,
  trailingSlash: 'always', output: 'static', integrations: [react(), mdx()],
  markdown: { syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] }, processor: unified({ rehypePlugins: [[rehypeMermaid, { strategy: 'pre-mermaid' }]] }) }
});
