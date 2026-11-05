import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const origin = process.env.VERIFY_URL || 'http://localhost:4321/';
const names = ['HomePage','ArticlePage','SystemPage','ProfilePage'];
const browser = await chromium.launch();
try {
  for (const width of [1280, 390]) {
    const page = await (await browser.newContext({ viewport: { width, height: 900 } })).newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    for (const name of names) {
      await page.goto(new URL(`trace/preview/${name}.html`, origin).href, { waitUntil: 'load' });
      await page.waitForFunction(() => document.getElementById('root')?.childElementCount > 0);
      if (name.endsWith('Page')) {
        const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert.ok(over <= 0, `overflow ${name} @${width}: ${over}px`);
        assert.ok(await page.locator('.site-note').isVisible(), `banner ${name}`);
      }
      assert.deepEqual(errors, [], `${name} @${width}`);
    }
    assert.equal((await page.request.get(new URL('design/', origin).href)).status(), 404);
    await page.goto(new URL('blog/', origin).href);
    assert.equal(await page.locator('a[href$="trace/preview/ProfilePage.html"]').count(), 1);
  }
  console.log('trace pass');
} finally { await browser.close(); }
