import type { Page } from 'puppeteer';

export async function waitUntilLoggedIn(page: Page, timeout = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const url = page.url();
    if (!url.includes('/ap/signin')) {
      try {
        const accountText = await page.$eval('#nav-link-accountList-nav-line-1', el =>
          el.textContent?.toLowerCase()
        );
        if (accountText && !accountText.includes('sign in')) return true;
      } catch {}
    }
    await new Promise(res => setTimeout(res, 3000));
  }
  throw new Error('Login timeout exceeded.');
}