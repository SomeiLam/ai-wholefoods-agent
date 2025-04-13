import express from 'express';
import puppeteer, { type Browser } from 'puppeteer';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';

import { GroceryItem } from './types/GroceryItem';
import { searchAmazon } from './automation/searchAmazon';
import { askAIForBestMatch } from './agent/askAIForBestMatch';
import { addToCart } from './automation/addToCart';
import { waitUntilLoggedIn } from './utils/waitUntilLoggedIn';
import { checkIfLoggedIn } from './utils/checkIfLoggedIn';

dotenv.config();

const app = express();
const PORT = 80;

app.use(cors());
app.use(bodyParser.json());

// Set Puppeteer user data dir
const userDataDir = path.join(__dirname, 'user-data');

app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

app.post('/api/submit-groceries', async (req, res) => {
  const items: GroceryItem[] = req.body.items;
  const result = [];
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,  // Run in headless mode
      executablePath: '/path/to/your/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',           // Disable GPU hardware acceleration
        '--window-size=1280x1024', // Set a default window size (you can customize)
        '--remote-debugging-port=9222' // Enable remote debugging if needed for troubleshooting
      ],
      ignoreDefaultArgs: ['--disable-extensions'],
      userDataDir,
      defaultViewport: null,
    });
    

    const [page] = await browser.pages();
    await page.goto('https://www.amazon.com/wholefoods');
    console.log('🌐 Opened Amazon Whole Foods landing page');

    // ✅ Check if already logged in
    const isLoggedIn = await checkIfLoggedIn(page);

    if (!isLoggedIn) {
      // 🔐 Not logged in → Navigate to login
      await page.waitForSelector('#nav-link-accountList');
      await page.click('#nav-link-accountList');
      console.log('🔐 Navigating to sign-in page...');

      await waitUntilLoggedIn(page);
      console.log('✅ Login confirmed, continuing automation...');
      
      await page.goto('https://www.amazon.com/wholefoods');
    }

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
          result.push({
            item: item,
            status: 'skipped',
            reason: 'No search results found',
          });
          continue;
        }

        // Step 2: AI picks the best product
        const bestMatch = await askAIForBestMatch({
          itemName: item.name,
          preferences: item.preferences,
          productList: searchResults.slice(0, 10),
        });
        console.log('bestMatch', bestMatch);
        if (!bestMatch || bestMatch.href === '') {
          console.warn(`🛑 Skipping "${item.name}" — no valid product match`);
          result.push({
            item: item,
            status: 'skipped',
            reason: bestMatch?.reason || 'No matching product found',
          });
          continue; // 🚫 Skip the rest of the loop
        }        

        if (!bestMatch) {
          throw new Error('AI could not choose a best match.');
        }

        console.log(`🧠 AI chose: ${bestMatch.name}`);
        await page.goto(bestMatch.href, { waitUntil: 'networkidle2' });

        // Step 3: Add to cart with quantity logic
        const success = await addToCart(page, item.quantity);
        if (success) {
          result.push({
            item: item,
            status: 'added',
            reason: bestMatch.reason,
            productName: bestMatch?.name || '',
            href: bestMatch?.href || '',
            price: bestMatch?.price || ''
          });          
        } else {
          result.push({
            item: item,
            status: 'not_added',
            suggestions: ['Add to Cart button not found or failed to click.'],
            reason: bestMatch.reason
          });
        }
        
      } catch (err) {
        console.error(`❌ Automation failed for ${item.name}:`, err);
        result.push({
          item: item,
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
  } finally {
    await new Promise(r => setTimeout(r, 1000));
    browser?.close()
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});