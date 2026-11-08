# Fariid AI Assistant — setup in the browser (no PowerShell, no installs)

Everything happens in the Cloudflare and Google AI Studio websites. Your WordPress site only shows the chat button.
Cloudflare sometimes renames menus; if something looks different, use the search bar in the dashboard.

## 1. Get a free Gemini API key
1. Go to **aistudio.google.com** and sign in with your Google account.
2. Click **Get API key → Create API key**. No credit card is needed for the free tier.
3. Copy the key and keep it somewhere safe. Don't add billing to this project if you want to stay on the free tier.

> On the free tier, Google may use what is sent to Gemini to improve its products, and there are daily request limits. That's fine here because the assistant only sends your public site content and visitors' questions. The chat window tells visitors not to share personal information.

## 2. Create a Turnstile widget
1. In the Cloudflare dashboard go to **Protect & Connect → Application security → Turnstile → Add widget**.
2. Name: `Fariid - AI Assistant` · Hostnames: `ahmedmc.com` and `www.ahmedmc.com` · Mode: **Managed** · Pre-clearance: **No** → **Create**.
3. Keep the **Site Key** and **Secret Key**.

## 3. Create the Worker
1. Go to **Workers & Pages → Create → Create Worker** (start from "Hello World").
2. Name it `fariid-ai-assistant` and click **Deploy**.
3. Click **Edit code**. Delete everything in `worker.js`, paste the whole file **`dist/worker-dashboard.js`**, and click **Deploy**.

## 4. Add the settings
In your Worker, open **Settings → Variables and Secrets → Add**.

**Secrets** (choose type *Secret*):

| Name | Value |
|---|---|
| `GEMINI_API_KEY` | Your Gemini API key |
| `TURNSTILE_SECRET` | The Turnstile **Secret** Key |
| `SESSION_SECRET` | Any random text of 40+ characters (a password generator works well) |

**Variables** (choose type *Text*):

| Name | Value |
|---|---|
| `ALLOWED_ORIGINS` | `https://ahmedmc.com,https://www.ahmedmc.com` |
| `AI_PROVIDER` | `gemini` |
| `MODEL` | `gemini-flash-lite-latest` |
| `DAILY_LIMIT_PER_VISITOR` | `20` |
| `DAILY_LIMIT_TOTAL` | `300` |

Click **Deploy** (or **Save and deploy**) after adding them.

## 5. Turn on the daily limits
1. Go to **Storage & Databases → KV → Create** and name it `fariid-ai-rate`.
2. Back in your Worker: **Settings → Bindings → Add → KV namespace**.
3. Variable name: `RATE` · Namespace: `fariid-ai-rate` → **Deploy**.

## 6. Check it works
Open `https://fariid-ai-assistant.YOUR-SUBDOMAIN.workers.dev/api/health` (your address is shown on the Worker's page). You should see `{"ok":true}`.

## 7. Add the chat button to WordPress
1. Open `widget/fariid-ai-assistant.html` in Notepad and set the two lines at the top:
   - `apiUrl:` your Worker address (no `/` at the end)
   - `siteKey:` your Turnstile **Site** Key
2. In WordPress, edit your **footer** with Elementor, add an **HTML** widget at the bottom, paste the whole file, and click **Update**.
3. Clear your cache (**LiteSpeed → Purge All**) and open your site in a private window. The **Fariid AI Assistant** button appears at the bottom-right.

## If something goes wrong
| What you see | Fix |
|---|---|
| Button doesn't appear | Clear the cache; check the footer was updated |
| "Verification failed" | Wrong Site Key, or the Turnstile widget is missing your domain |
| "Assistant is unavailable" | Check the Gemini API key. In the Worker, open **Logs** (or **Observability**) to see the error. If it says the model isn't found, change `MODEL` to a current Gemini Flash-Lite model listed on ai.google.dev/pricing with a free tier |
| "The assistant is busy" | The free daily or per-minute Gemini limit was reached. It resets on its own; lower `DAILY_LIMIT_TOTAL` if it happens often |

## Updating what it knows
Edit the files in `content/`, then ask for a new `dist/worker-dashboard.js` (or run `node scripts/build-knowledge.mjs` and rebuild), and paste it into **Edit code** again.
