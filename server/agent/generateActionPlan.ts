import { GoogleGenerativeAI } from '@google/generative-ai';
import { ActionPlanSchema, type ActionPlan } from '../types/ActionPlan';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ ERROR: Missing GEMINI_API_KEY");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate a plan using Gemini to accomplish a goal on Amazon Whole Foods.
 */
export async function generateActionPlan(html: string, goal: string): Promise<ActionPlan> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const boilerplates: Record<string, string> = {
    search: `[
      { "type": "type", "selector": "#twotabsearchtextbox", "value": "banana" },
      { "type": "click", "selector": "#nav-search-submit-button" }
    ]`,
    addToCart: `[
      { "type": "click", "selector": "input[type='submit']" }
    ]`,
    clickBestResult: `[
      { "type": "click", "selector": ".s-main-slot [data-asin]:not([data-asin='']) a.a-link-normal[href*='/dp/']" }
    ]`
  };

  let boilerplate = '';
  if (goal.toLowerCase().includes('search')) {
    boilerplate = boilerplates.search;
  } else if (goal.toLowerCase().includes('add to cart')) {
    boilerplate = boilerplates.addToCart;
  } else if (goal.toLowerCase().includes('click the best result')) {
    boilerplate = boilerplates.clickBestResult;
  }
  
  const prompt = `
  You are a shopping automation AI agent helping a user complete a task on Amazon Whole Foods.
  
  🎯 Goal: ${goal}
  📋 Example plan for this goal:
  ${boilerplate || '(no example available)'}
  
  📋 Rules:
  1. DO NOT invent product names or selectors. Use only what is found in the HTML snapshot below.
  2. DO NOT guess or hallucinate query selectors like "#add-to-cart-button". That selector is often missing.
  3. The only valid way to trigger “Add to Cart” is:
     ✅ A real button or input with visible text like "Add to Cart".
     ✅ Prefer: input[type="submit"] if it exists in the HTML.
  4. DO NOT return "clickByText": "a" or other single-letter selectors. They are invalid.
  5. If a valid Add to Cart button cannot be found, SKIP the step — the agent will handle that case.
  
  ✅ Supported action types:
  - "click"
  - "clickByText"
  - "type"
  - "press"
  - "select"
  - "waitForSelector"
  - "goto"
  - "log"
  
  📝 Output format (strict JSON):
  {
    "plan": [
      { "type": "click", "selector": "input[type='submit']" }
    ]
  }
  
  📄 HTML snapshot:
  ${html}
  `;
  
  const result = await model.generateContent(prompt);
  let rawText = result.response.text().trim();

  // 🧼 Strip markdown code fence
  if (rawText.startsWith('```json')) {
    rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
  }

  try {
    const parsed = JSON.parse(rawText);

    // 🧼 Normalize and fix known field issues
    if (Array.isArray(parsed.plan)) {
      parsed.plan = parsed.plan
        .map((step: any) => {
          const type = typeof step.type === 'string' ? step.type.trim() : step.type;

          // Gemini mistake: 'type' step uses 'text' instead of 'value'
          if (type === 'type' && step.text && !step.value) {
            step.value = step.text;
            delete step.text;
          }

          // Gemini mistake: 'clickByText' step uses 'selector' instead of 'text'
          if (type === 'clickByText' && step.selector && !step.text) {
            step.text = step.selector;
            delete step.selector;
          }

          return { ...step, type };
        })
        .filter((step: any) => {
          if (!step.type) return false;
          if ((step.type === 'click' || step.type === 'waitForSelector' || step.type === 'select') && !step.selector) return false;
          if (step.type === 'clickByText' && !step.text) return false;
          if (step.type === 'type' && !step.value) return false;
          return true;
        });
    }

    const validated = ActionPlanSchema.parse(parsed);
    return validated;

  } catch (err) {
    console.error('❌ Failed to validate action plan:', err);
    console.error('📝 Raw AI response:', rawText);
    throw new Error('Invalid action plan returned from Gemini');
  }
}
