import { type Page } from "puppeteer";

export async function checkIfLoggedIn(page: Page): Promise<boolean> {
  try {
    const accountText = await page.$eval('#nav-link-accountList-nav-line-1', el =>
      el.textContent?.toLowerCase()
    );
    return !!accountText && !accountText.includes('sign in');
  } catch {
    return false;
  }
}
