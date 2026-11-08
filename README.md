# Fariid AI Assistant

**Version 0.9.0 (open beta).** It works and is ready to try, but it's still being tested.

Fariid AI Assistant is a free, reusable AI assistant for a personal website. This copy is set up for **ahmedmc.com** and answers questions about Ahmed MC, his skills and projects, and how to use the Antibot Email Shield plugin. It answers **only from the content of the website**, links to the page each answer comes from, and says so when it doesn't know.

Built by [Ahmed MC](https://ahmedmc.com) with Google Gemini (free tier), Cloudflare Workers and Cloudflare Turnstile. Set `AI_PROVIDER = "claude"` to use Claude instead.

**Documentation:** [docs.ahmedmc.com/ai-assistant](https://docs.ahmedmc.com/ai-assistant/)

**Easiest setup:** follow `DASHBOARD-SETUP.md` (browser only, nothing to install).

## How it works

```
Visitor question
   → Turnstile check (once per 30 minutes)
   → Cloudflare Worker
       → keyword search finds the most relevant sections of the site (src/knowledge.json)
       → Gemini answers using only those sections, citing them as [1], [2]
   → answer + source links shown in the chat
```

| Part | File |
|---|---|
| Website content the assistant knows | `content/*.md` → built into `src/knowledge.json` |
| Search (finds relevant sections, no AI) | `src/retrieve.js` |
| Backend (Turnstile, limits, Gemini call) | `src/worker.js` |
| Paste-in version for the Cloudflare dashboard | `dist/worker-dashboard.js` |
| Chat widget for the website | `widget/fariid-ai-assistant.html` |
| Test questions | `eval/questions.json` |

## Make it about you

Anyone can reuse this for their own site:
1. Edit `src/config.json`: assistant name, your name, a one-line description, your site and contact page.
2. Replace the files in `content/` with information about you (only things already public on your site).
3. Run `node scripts/build-knowledge.mjs`, then deploy your own Worker with your own free Gemini key.
4. In `widget/fariid-ai-assistant.html`, set `name`, `apiUrl` and `siteKey`.

## Safety and privacy

- **Grounded answers:** the AI only sees the matching sections of your site and is told not to add facts. Citations that don't match a real source are removed.
- **Private details:** the assistant never shares email addresses, phone numbers or other private details; a filter removes any that slip through.
- **Stays on topic:** off-topic requests and attempts to override the rules are declined.
- **Bot protection:** Cloudflare Turnstile before the first question, a signed 30-minute session tied to the visitor, and daily limits per visitor and in total.
- **Only your site:** requests from other websites are refused.
- **No chat storage:** questions and answers are not saved or logged. Visitors' questions are sent to Google Gemini to generate answers (on the free tier Google may use them to improve its products); mention this in your privacy policy.
- **Secrets stay secret:** the Gemini API key and Turnstile secret live only in the Worker, never in the page.

## Setup

Command-line setup (or use `DASHBOARD-SETUP.md` instead). You need a Cloudflare account and a free Gemini API key from aistudio.google.com, and Node.js 20+ on your computer.

1. **Install the tools.** In a terminal inside this folder run `npm install -D wrangler`, then `npx wrangler login`.
2. **Create a Turnstile widget** in the Cloudflare dashboard (Protect & Connect → Application security → Turnstile → Add widget), add `ahmedmc.com`, Managed mode. Keep the Site Key and Secret Key.
3. **Get a free Gemini API key** at aistudio.google.com → Get API key.
4. **Turn on daily limits (recommended).** Run `npx wrangler kv namespace create RATE`, then paste the id it prints into `wrangler.toml` and remove the `#` signs in that section.
5. **Add the secrets**, one at a time (each command asks you to paste the value):
   ```
   npx wrangler secret put GEMINI_API_KEY
   npx wrangler secret put TURNSTILE_SECRET
   npx wrangler secret put SESSION_SECRET      # any long random text, 40+ characters
   ```
6. **Deploy:** `npx wrangler deploy`. It prints your Worker address, like `https://fariid-ai-assistant.yourname.workers.dev`. Open `/api/health` on it to check it says `{"ok":true}`.
7. **Add the widget to your site.** Open `widget/fariid-ai-assistant.html`, set `apiUrl` to your Worker address and `siteKey` to your Turnstile Site Key, then paste the whole file into an Elementor **HTML** widget in your site footer (so it appears on every page). Clear your cache.

## Updating what it knows

Edit or add Markdown files in `content/`. Each file starts with a title and the page URL; each `## ` heading becomes one searchable section (add ` #anchor` to link to part of a page). Then run:

```
node scripts/build-knowledge.mjs
node scripts/eval-retrieval.mjs
npx wrangler deploy
```

Only add information that is already public on your website.

## Testing

- `node scripts/eval-retrieval.mjs` checks that search finds the right section for each test question (no API key needed). Current result: right section in the top 3 for **41/41** questions, ranked first for 34/41.
- `scripts/eval-live.mjs` asks the deployed assistant every test question, including off-topic and "ignore your instructions" ones, and saves the answers to `eval/results.md`. Set an `EVAL_KEY` secret on the Worker first (`npx wrangler secret put EVAL_KEY`), then run:
  ```
  ASK_URL=https://fariid-ai-assistant.yourname.workers.dev EVAL_KEY=your-key node scripts/eval-live.mjs
  ```
  Delete the `EVAL_KEY` secret afterwards if you don't plan to test again soon.

## Cost

**$0.** Cloudflare Workers, KV and Turnstile are free at this size, and Gemini Flash-Lite has a free tier with daily limits. If the free limit is reached, visitors see "The assistant is busy, try again in a minute." Change the model or limits in `wrangler.toml`.

## License

MIT. Developed by [Ahmed MC](https://ahmedmc.com).
