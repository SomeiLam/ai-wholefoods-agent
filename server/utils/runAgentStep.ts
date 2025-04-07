import type { Page } from 'puppeteer';
import { generateActionPlan } from '../agent/generateActionPlan';
import { executePlan } from '../automation/executePlan';

export async function runAgentStep(
  page: Page,
  goal: string,
  logPrefix = '🪜',
  maxRetries = 2,
  repeat: number = 1 
) {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const html = await page.content();
      console.log(`🧠 Gemini Goal: ${goal}`);

      const plan = await generateActionPlan(html, goal);
      console.log(`${logPrefix ?? '🪜'} Plan:\n`, JSON.stringify(plan.plan, null, 2));

      for (let i = 0; i < repeat; i++) {
        if (repeat > 1) {
          console.log(`${logPrefix ?? '⏱️'} Repeating plan... (${i + 1}/${repeat})`);
        }
        await executePlan(page, plan.plan);
      }
      return; // ✅ Success, stop retrying
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`⚠️ Failed attempt ${attempt} for "${goal}":`, err.message);
      } else {
        console.warn(`⚠️ Failed attempt ${attempt} for "${goal}":`, err);
      }

      if (attempt === maxRetries + 1) {
        throw new Error(`❌ Exhausted retries for goal: "${goal}"`);
      }

      await new Promise((r) => setTimeout(r, 1000)); // wait a bit before retry
    }
  }
}
