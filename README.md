# 🛒 AI Grocery Shopping Agent

This project is an AI-powered automation tool that searches for Whole Foods products on Amazon based on user input and preferences, selects the best match using Gemini AI, and adds them to your shopping cart with Puppeteer.

## ✨ Features

- 🌱 Natural language grocery input (e.g. "organic fuji apple from Japan")
- 🧠 AI selects the best match from top search results
- 🛒 Automatically adds items (with quantity) to your Amazon Whole Foods cart
- ⚙️ Puppeteer-controlled browser session
- ✅ Works with quantity dropdowns and custom Whole Foods quantity selectors
- 🧾 Displays Gemini reasoning for each product selection

## 🧑‍💻 Tech Stack

- Node.js + Express
- Puppeteer (browser automation)
- React (frontend UI)
- Gemini API (for intelligent product selection)
- TypeScript + Zod (schema validation)

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/SomeiLam/ai-wholefoods-agent.git
cd ai-grocery-agent
```

### 2. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 3. Create .env file

In the `server/` folder:

```bash
GEMINI_API_KEY=your_google_generative_ai_key
```

### 4. Start the servers

- **Backend**

```bash
cd server
npx ts-node index.ts
```

- **Frontend**

```bash
cd client
npm run dev
```

Then open `http://localhost:5173` to access the app.

## 📸 Example Usage

1. Input your grocery items with preferences (brand, organic, country, etc.)
2. Click **Start AI Shopping**
3. AI picks the best product and shows its reason
4. Items are added to your Amazon cart

## 🧠 Gemini Prompt Example

```json
{
  "index": 3,
  "reason": "This product best matches the user's request for organic coffee beans from Italy."
}
```

## 📦 Project Structure

```
├── client/              # React UI
├── server/              # Node.js backend + Puppeteer logic
│   ├── automation/      # searchAmazon, addToCart
│   ├── agent/           # Gemini integration
│   └── utils/           # helpers like runAgentStep
```

## 🛡️ License

MIT

---

> Created with ☕️ and AI by [your-name](https://github.com/your-username)
