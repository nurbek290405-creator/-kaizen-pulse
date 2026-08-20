# Kaizen Pulse — 改善

A productivity app (tasks + habits) with a Telegram bot companion and PWA support,
in a soft Japanese wabi-sabi aesthetic. Streaks that break get "repaired" visually
with gold seams (kintsugi), instead of just resetting to zero silently.

```
kaizen-pulse/
├── frontend/                  React + Vite + Tailwind PWA
├── supabase/
│   ├── migrations/            SQL schema + RLS policies
│   └── functions/
│       ├── telegram-webhook/  Bot logic: /start, linking, voice-to-text, ack button
│       └── alert-engine/      Scheduled function, exact-time + 5-min recurring alerts
└── wrangler.toml               Cloudflare Pages config
```

## 1. Supabase setup

1. Create a project at supabase.com.
2. Push the schema:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
   This runs both migration files (`0001_init.sql`, `0002_telegram_linking.sql`),
   creating `profiles`, `tasks`, `habits`, `alert_log`, `telegram_link_codes`,
   the `leaderboard` view, and all RLS policies.
3. Make your own account an admin after signing up once in the app:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

## 2. Telegram Bot

1. Message **@BotFather** on Telegram → `/newbot` → grab the bot token.
2. Get an OpenAI API key for Whisper transcription (voice-to-text).
3. Set Edge Function secrets:
   ```bash
   npx supabase secrets set TELEGRAM_BOT_TOKEN=xxx OPENAI_API_KEY=xxx
   ```
4. Deploy the two functions:
   ```bash
   npx supabase functions deploy telegram-webhook --no-verify-jwt
   npx supabase functions deploy alert-engine --no-verify-jwt
   ```
5. Point Telegram at the webhook:
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<project-ref>.functions.supabase.co/telegram-webhook
   ```
6. Schedule the alert engine to run every minute (checks due tasks, resends every 5 min until acknowledged):
   ```bash
   npx supabase functions schedule alert-engine --cron "* * * * *"
   ```
   (If your Supabase plan doesn't support `functions schedule`, use `pg_cron` +
   `pg_net` to call the function URL every minute instead — see Supabase docs
   on "Scheduling Edge Functions".)

## 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev
```

## 4. Deploy to Cloudflare Pages

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name kaizen-pulse
```
Or connect the repo in the Cloudflare dashboard: build command `npm run build`,
output directory `frontend/dist`, and add `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY` as environment variables there.

## 5. Icons

Placeholder icons are in `frontend/public/icons/`. Swap `icon-192.png` and
`icon-512.png` for your real app icon before shipping — the manifest and
Apple touch icon both reference these paths.

## How the pieces connect

- **Voice task capture**: user sends a voice note to the bot → `telegram-webhook`
  downloads it from Telegram, sends it to Whisper, inserts a row into `tasks`
  with `source = 'telegram_voice'` → the web app's Kanban board updates instantly
  via a Supabase Realtime subscription (no refresh needed).
- **Persistent alerts**: `alert-engine` runs every minute, finds tasks past
  `due_datetime` with `is_acknowledged = false`, and sends a Telegram message
  with an inline "✅ Ескерілді / Орындалды" button. It re-sends every 5 minutes
  (tracked in `alert_log`) until that button is tapped, which flips
  `is_acknowledged` via `telegram-webhook`'s callback handler.
- **Account linking**: the bot's "🔗 Аккаунтты байланыстыру" button generates a
  6-character code stored in `telegram_link_codes`; the user enters it on the
  `/telegram` page in the web app, which calls the `confirm_telegram_link` RPC
  to attach their `telegram_chat_id` to their profile.
- **Admin access**: gated both client-side (route guard) and server-side (RLS
  policies check `public.is_admin()`), so the leaderboard/user table can't be
  reached by non-admins even via direct API calls.
