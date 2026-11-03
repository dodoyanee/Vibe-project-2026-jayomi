const { chromium } = require('C:/Users/Administrator.User-2026GEMUMS/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const root = process.cwd();
  const server = http.createServer(async (req, res) => {
    try {
      const file = path.join(root, decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp4': 'video/mp4' };
      res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      res.end(await fs.readFile(file));
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const toggle = page.locator('[data-js="menu-toggle"]');
    const panel = page.locator('[data-js="menu-panel"]');
    const state = () => page.evaluate(() => {
      const panel = document.querySelector('[data-js="menu-panel"]');
      return {
        state: panel.dataset.menuState, inert: panel.inert,
        expanded: document.querySelector('[data-js="menu-toggle"]').getAttribute('aria-expanded'),
        background: getComputedStyle(panel, '::before').transform,
        duration: getComputedStyle(panel, '::before').transitionDuration,
        links: [...panel.querySelectorAll('.menu-panel__link')].map(link => ({opacity: +getComputedStyle(link).opacity, transform: getComputedStyle(link).transform, delay: getComputedStyle(link).transitionDelay})),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    for (const width of [360, 390, 768, 1024, 1199, 1200, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      if (width >= 1200) { assert.equal(await toggle.isVisible(), false); continue; }
      assert.equal((await state()).inert, true);
      await toggle.click();
      await page.waitForTimeout(250);
      const mid = await state();
      assert.equal(mid.expanded, 'true');
      assert.equal(mid.duration, '0.8s');
      assert(mid.links[0].opacity > mid.links[3].opacity, 'links must appear in sequence');
      assert.equal(mid.links[3].delay.split(',')[0], '0.4s');
      assert.equal(mid.overflow, false);
      if (width === 390) await page.screenshot({ path: path.join(process.env.TEMP, 'draftx-menu-mid.png') });
      await page.waitForTimeout(1050);
      const opened = await state();
      assert(opened.links.every(link => link.opacity === 1));
      assert.equal(opened.background, 'matrix(1, 0, 0, 1, 0, 0)');
      if (width === 390) await page.screenshot({ path: path.join(process.env.TEMP, 'draftx-menu-open.png') });
      await page.keyboard.press('Escape');
      assert.equal((await state()).inert, true);
      await page.waitForTimeout(950);
      assert.equal((await state()).state, 'closed');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.js), 'menu-toggle');
      console.log(`${width}px: stagger, panel timing, close, focus, overflow passed`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await toggle.click();
    await page.waitForTimeout(150);
    await toggle.click();
    await page.waitForTimeout(80);
    await toggle.click();
    await page.waitForTimeout(1300);
    assert.equal((await state()).expanded, 'true');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.js), 'menu-toggle');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement.className), 'menu-panel__award');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.js), 'menu-toggle');
    await page.locator('.menu-panel__link[href="#works"]').click();
    await page.waitForTimeout(950);
    assert.equal(new URL(page.url()).hash, '#works');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await toggle.click();
    assert((await state()).links.every(link => link.opacity === 1));
    await page.keyboard.press('Escape');
    assert.equal((await state()).state, 'closed');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await toggle.click();
    await page.setViewportSize({ width: 1440, height: 844 });
    assert.equal((await state()).state, 'closed');
    assert.equal((await state()).inert, true);
    assert.deepEqual(errors, []);
    console.log('rapid toggle, focus trap, hash navigation, reduced motion, desktop resize, console passed');
  } finally {
    await browser?.close();
    server.closeAllConnections();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
