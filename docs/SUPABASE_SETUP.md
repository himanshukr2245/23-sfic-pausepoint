# Supabase setup — switching accounts on (auth module)
Until these steps are done the app runs in guest mode: no sign-in, notes stay on the device, nothing breaks.
About 20 minutes. Dashboard names were checked in October 2026; Supabase sometimes moves a menu — search the dashboard for the bold words if one is not where this says.

## 1. Create the project
1. supabase.com → **New project** → name `hk-starter` → region **Mumbai (ap-south-1)** (closest to India) → a long database password, saved in your password manager.
2. Wait until the project says it is ready.

## 2. Create the tables
1. **SQL Editor** → New query → paste all of `supabase/migrations/0001_starter_notes.sql` → **Run**.
2. New query → paste `supabase/migrations/0002_starter_account.sql` → **Run**.
3. Both are safe to run again.

## 3. Sign-in settings
1. **Authentication → Sign In / Providers → Email**: enabled, **Confirm email** on, minimum password length **8**.
2. **Authentication → URL Configuration**:
   - Site URL: `https://starter.hkr.dpdns.org`
   - Redirect URLs: `https://starter.hkr.dpdns.org/**`, `http://localhost:3000/**`, `http://127.0.0.1:3000/**`
3. **Project Settings → JWT Keys**: the project should sign with an **asymmetric key** (ECC P-256 — the default for new projects). Then the server checks each session locally instead of calling Supabase on every request.

## 4. Emails from your own domain (Resend)
1. Resend → **API Keys** → Create → permission **Sending access**, domain = your verified domain → copy the key (shown once).
2. Supabase → **Authentication → Emails → SMTP Settings** → enable custom SMTP:
   - Host `smtp.resend.com` · Port `465` · Username `resend` · Password = the Resend key
   - Sender email `no-reply@<your verified domain>` · Sender name `HK Starter`
3. **Authentication → Emails → Templates** — paste each file and set its subject:

| Template | File | Subject |
|---|---|---|
| Confirm signup | `supabase/templates/confirm-signup.html` | Confirm your HK Starter account |
| Reset password | `supabase/templates/reset-password.html` | Choose a new HK Starter password |
| Change email address | `supabase/templates/change-email.html` | Confirm your new HK Starter email |

## 5. Give the keys to the app
1. Supabase → **Project Settings → API Keys** → copy the **Project URL** and the **Publishable key** (`sb_publishable_…`). Never copy the secret key anywhere in this app.
2. Cloudflare → Workers & Pages → `hk-starter` → **Settings → Build → Variables and secrets** → add both as **build variables** (they are baked into the app when it builds):
   - `NEXT_PUBLIC_SUPABASE_URL` = the Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = the publishable key
3. Deployments → **Retry** the latest build (or push any commit).
4. Your laptop: put the same two lines in `.env.local` (never committed) so `npm run dev` uses the project too.
5. `hk.config.json` → `live.supabaseUrl` = the Project URL (check-live then also checks the signing keys).

## 6. Prove it
1. `npm run check:live -- https://starter.hkr.dpdns.org --expect-head`
2. Open `https://starter.hkr.dpdns.org/api/health?deep=1` → `"supabase":"ok"` and `"database":"ok"` (database "down" = step 2 was not run).
3. Create an account on the live site → the email arrives from your domain → tap the link → you land signed in on Notes → the badge says "All changes synced." after you add a note.
4. Make a throwaway test account, put `TEST_AUTH_EMAIL` / `TEST_AUTH_PASSWORD` in `.env.local`, and run the real-account test against the live site:
   `BASE_URL=https://starter.hkr.dpdns.org NEXT_PUBLIC_SUPABASE_URL=<project url> npx playwright test e2e/auth.spec.ts`
5. RLS proof with two test accounts: `node scripts/rls-proof.mjs` (variables in `.env.example`).

## Keep it awake
`.github/workflows/keep-awake.yml` asks the live site's deep health check once a day, so the free project never pauses for inactivity.
