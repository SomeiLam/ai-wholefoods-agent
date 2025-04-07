// index.ts
import express from 'express';
import puppeteer, { type Browser } from 'puppeteer';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { GroceryItem } from './types/GroceryItem';
import { searchAmazon } from './automation/searchAmazon';
import { askAIForBestMatch } from './agent/askAIForBestMatch';
import { addToCart } from './automation/addToCart';

dotenv.config();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Set Puppeteer user data dir
const userDataDir = path.join(__dirname, 'user-data');
const lockFilePath = path.join(userDataDir, 'SingletonLock');

// 🧹 Clear Puppeteer lock file
if (fs.existsSync(lockFilePath)) {
  fs.unlinkSync(lockFilePath);
  console.log('🧼 Removed leftover SingletonLock');
}

app.post('/api/submit-groceries', async (req, res) => {
  const items: GroceryItem[] = req.body.items;
  const result = [];
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: false,
      userDataDir,
      defaultViewport: null,
    });

    const [page] = await browser.pages();
    await page.goto('https://www.amazon.com/wholefoods');
    await page.waitForSelector('#twotabsearchtextbox');

    for (const item of items) {
      console.log(`\n🛒 Starting automation for: ${item.name}`);

      try {
        // Step 1: Search the item
        // Build enhanced query with preferences
        let enhancedQuery = item.name;
        if (item.preferences.brand) enhancedQuery += ` ${item.preferences.brand}`;
        if (item.preferences.organic) enhancedQuery += ' organic';
        if (item.preferences.country) enhancedQuery += ` from ${item.preferences.country}`;
        if (item.preferences.lowestPrice) enhancedQuery += ' cheapest';

        const searchResults = await searchAmazon(page, enhancedQuery);

        if (searchResults.length === 0) {
          throw new Error('No search results found.');
        }

        // Step 2: AI picks the best product
        const bestMatch = await askAIForBestMatch({
          itemName: item.name,
          preferences: item.preferences,
          productList: searchResults.slice(0, 10),
        });

        if (!bestMatch) {
          throw new Error('AI could not choose a best match.');
        }

        console.log(`🧠 AI chose: ${bestMatch.name}`);
        await page.goto(bestMatch.href, { waitUntil: 'networkidle2' });

        // Step 3: Add to cart with quantity logic
        const success = await addToCart(page, item.quantity);
        if (success) {
          result.push({
            name: item.name,
            quantity: item.quantity,
            status: 'added',
            reason: bestMatch.reason, // include reason from AI
          });
        } else {
          result.push({
            name: item.name,
            quantity: item.quantity,
            status: 'not_added',
            suggestions: ['Add to Cart button not found or failed to click.'],
            reason: bestMatch.reason,
          });
        }
        
      } catch (err) {
        console.error(`❌ Automation failed for ${item.name}:`, err);
        result.push({
          name: item.name,
          quantity: item.quantity,
          status: 'error',
          error: (err as Error).message,
        });
      }

      // Back to homepage for next item
      await page.goto('https://www.amazon.com/wholefoods');
    }

    // ✅ Go to cart if at least one item was added
    const atLeastOneAdded = result.some(r => r.status === 'added');
    if (atLeastOneAdded) {
      console.log('🧾 Navigating to cart page...');
      await page.goto('https://www.amazon.com/gp/cart/view.html?ref_=nav_cart', { waitUntil: 'networkidle2' });
    } else {
      console.log('🪹 No items added to cart.');
    }

    res.json({ result });

  } catch (err) {
    console.error('❌ Unexpected error during automation:', err);
    res.status(500).json({ error: 'Internal automation error', details: err });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
