import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

const GeminiResponseSchema = z.object({
  index: z.number().min(0),
  reason: z.string(),
});

export async function askAIForBestMatch({
  itemName,
  preferences,
  productList,
}: {
  itemName: string;
  preferences: Record<string, any>;
  productList: {
    href: string;
    name: string;
    brand: string;
    price: string;
  }[];
}) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('❌ ERROR: Missing GEMINI_API_KEY');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
  You are a smart grocery shopping assistant helping the user select the most appropriate product from Amazon Whole Foods search results.
  
  🛒 User is shopping for: "${itemName}"
  📋 Preferences: ${JSON.stringify(preferences, null, 2)}
  
  📏 Selection Rules:
  1. ✅ If the user explicitly specifies a form (e.g. powder, peeled, frozen, chopped, paste), choose a product that matches that form.
  2. ✅ If no form is specified, prefer the natural, raw, fresh, or whole version of the item.
  3. ❌ Do NOT choose processed, frozen, cooked, sauced, or derivative forms (e.g. snacks, sauces, powders) unless the user requested them.
  4. ❌ Avoid "combo" or "multi-pack" items unless it clearly aligns with the user's expected quantity.
     - For example, if the product is a *bag of 8 apples* and the user wants 4, that may result in over-purchasing.
     - Prefer individual items or smaller packs if available.
  
  🚫 If NONE of the results are appropriate or relevant to the item "${itemName}", then return:
  {
    "index": 0,
    "reason": "No relevant product found in the list."
  }
  
  📦 Product Results:
  Top ${productList.length} results:
  ${productList
    .map(
      (p, i) =>
        `${i + 1}. Name: ${p.name}\n   Brand: ${p.brand || 'unknown'}\n   Price: ${p.price}`
    )
    .join('\n\n')}
  
  🎯 Task:
  Pick the best product from the list above based on the user’s preferences and the rules above.
  
  🧠 Return a valid JSON object in this **strict format** (no markdown or comments):
  
  {
    "index": number,    // A number between 1 and ${productList.length}, or 0 if no match found
    "reason": "string"  // Short explanation why this item was selected or why no match was found
  }
  
  ⚠️ Do not return multiple products. Do not include explanations outside of the JSON object.
  ⚠️ Make sure the index is valid and within the range 1 to ${productList.length}, or use 0 if nothing fits.
  `;  
  
  
  try {
    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();
  
    // Remove markdown block if present
    if (raw.startsWith('```json')) {
      raw = raw.replace(/^```json/, '').replace(/```$/, '').trim();
    }
  
    const parsed = JSON.parse(raw);
    const validated = GeminiResponseSchema.parse(parsed);
  
    const matchIndex = validated.index;
  
    // ✅ If no match was found (index = 0)
    if (matchIndex === 0) {
      console.warn(`⚠️ Gemini returned index 0: ${validated.reason}`);
      return {
        name: itemName,
        href: '',
        brand: '',
        price: '',
        reason: validated.reason,
        skipped: true,
      };
    }
  
    // ❌ If index is out of range
    if (matchIndex < 1 || matchIndex > productList.length) {
      console.warn(`⚠️ AI returned out-of-range index: ${matchIndex}`);
      return null;
    }
  
    // ✅ Valid match
    return {
      ...productList[matchIndex - 1],
      reason: validated.reason,
    };
  } catch (err) {
    console.error('❌ Gemini reasoning error:', err);
    return null;
  }
  
}
