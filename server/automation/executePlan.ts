// automation/executePlan.ts
import type { KeyInput, Page, ElementHandle } from 'puppeteer';
import type { AIAction } from '../types/ActionPlan';

export async function executePlan(page: Page, steps: AIAction[]) {
  for (const step of steps) {
    try {
      switch (step.type) {
        case 'click': {
          if (!step.selector) throw new Error('Missing selector for click');
          await page.waitForSelector(step.selector);
          await page.click(step.selector);
          break;
        }

        case 'clickByText': {
          const textToMatch = step.text.toLowerCase();
        
          // 1. Find the matching element by visible text and return an ElementHandle<Element>
          const handle = await page.evaluateHandle((text) => {
            const elements = document.querySelectorAll('a, button, span, div');
            for (const el of elements) {
              if (el.textContent?.toLowerCase().includes(text)) {
                return el;
              }
            }
            return null;
          }, textToMatch);
        
          // 2. Narrow down to ElementHandle<Element>
          const elementHandle = handle.asElement() as ElementHandle<Element>;
          if (!elementHandle) {
            throw new Error(`❌ Could not find element containing text: "${step.text}"`);
          }
        
          // 3. Safely scroll into view using as HTMLElement
          await elementHandle.evaluate(el =>
            (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
          );
        
          // 4. Click
          await elementHandle.click();
          break;
        }
        

        case 'type': {
          if (!step.selector || step.value === undefined) {
            throw new Error('Missing selector or value for type');
          }
          await page.waitForSelector(step.selector);
          await page.type(step.selector, step.value);
          break;
        }

        case 'press': {
          if (!step.key) throw new Error('Missing key for press');
          await page.keyboard.press(step.key as KeyInput);
          break;
        }

        case 'goto': {
          if (!step.url) throw new Error('Missing URL for goto');
          await page.goto(step.url, { waitUntil: 'networkidle2' });
          break;
        }

        case 'waitForSelector': {
          if (!step.selector) throw new Error('Missing selector for waitForSelector');
          await page.waitForSelector(step.selector);
          break;
        }

        case 'select': {
          if (!step.selector || step.value === undefined) {
            throw new Error('Missing selector or value for select');
          }
          await page.select(step.selector, step.value);
          break;
        }

        case 'log': {
          console.log(step.message || '📌 log step');
          break;
        }

        default:
          console.warn('⚠️ Unknown step type:', step);
      }

      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`❌ Failed at step:`, step, err);
    }
  }
}
