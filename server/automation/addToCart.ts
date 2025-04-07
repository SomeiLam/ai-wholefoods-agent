// automation/addToCart.ts
import type { Page } from 'puppeteer';

export async function addToCart(page: Page, quantity: number): Promise<boolean> {
  const selectors = [
    '#desktop_buybox input[type="submit"]',
    '#freshAddToCartButton input[type="submit"]',
    '#add-to-cart-button',
    'input[name="submit.add-to-cart"]',
    '#submit.add-to-cart',
  ];

  let addToCartButton: string | null = null;

  // Find the first working selector
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: 1000 });
      addToCartButton = selector;
      console.log(`✅ Found Add to Cart button: ${selector}`);
      break;
    } catch {
      // Try next selector
    }
  }

  if (!addToCartButton) {
    console.warn('❌ Add to Cart button not found for any selector');
    return false;
  }

  for (let i = 0; i < quantity; i++) {
    try {
      await page.click(addToCartButton);
      console.log(`🛒 Clicked Add to Cart (${i + 1}/${quantity})`);
      await new Promise(res => setTimeout(res, 1000)); // delay between clicks
    } catch (err) {
      console.warn(`⚠️ Failed clicking Add to Cart (attempt ${i + 1})`, err);
    }
  }

  return true;
}
