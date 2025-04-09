// automation/searchAmazon.ts
import type { Page } from 'puppeteer';

type Product = {
  href: string;
  name: string;
  brand: string;
  price: string;
};

export async function searchAmazon(page: Page, query: string): Promise<Product[]> {
  const selector = '#twotabsearchtextbox';
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(selector, query);
  await page.keyboard.press('Enter');
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  const productSelector = '.s-main-slot .s-result-item';

  await page.waitForSelector(productSelector, { timeout: 5000 });
  const itemHandles = await page.$$(productSelector);
  console.log(`🧪 Found ${itemHandles.length} items in search result`);

  if (itemHandles.length === 0) {
    await page.screenshot({ path: 'no-search-items.png' });
    throw new Error('No search items found. Check if layout has changed.');
  }

  const results = await page.$$eval('.s-main-slot .s-result-item', items => {
    return items.slice(0, 10).map(item => {
      const anchor = item.querySelector('a.a-link-normal[href*="/dp/"]') as HTMLAnchorElement;
      const brandSpan = item.querySelector('h2 .a-size-base-plus') as HTMLElement;
      const titleSpan = item.querySelector('a h2[aria-label] span') as HTMLElement;
      const priceSpan = item.querySelector('.a-price .a-offscreen') as HTMLElement;

      const href = anchor?.href || '';
      const brand = brandSpan?.textContent?.trim() || '';
      const title = titleSpan?.textContent?.trim() || '';
      const name = `${brand} ${title}`.trim();
      const price = priceSpan?.textContent?.trim() || 'unknown';

      return href && name ? { href, name, brand, price } : null;
    }).filter(Boolean);
  });

  console.log('results', results);
  return results as Product[]; 
}
