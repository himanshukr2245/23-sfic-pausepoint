# GOLDEN PATH — the core journey (BLD-3)
The starter is a template, so its golden path is the journey that proves the template works. Every beat is covered by `e2e/golden-path.spec.ts` on a phone and a laptop viewport.

| Beat | What the person does | What the screen shows | Proven by |
|---|---|---|---|
| 1 | Opens the home page | The promise ("HK Starter") and what every app starts with | golden-path beat 1 · a11y · csp |
| 2 | Taps "How it works" | The gate ladder, without a page reload | golden-path beat 2 · soft-nav |
| 3 | Submits the form empty, then with a name | A plain-words error, then a server-validated answer | golden-path beat 3 |
| 4 | Opens Notes, writes a note, reloads | The note is still there, "saved in this browser on this device" | golden-path beat 4 · notes spec |
| 5 | (offline module) Goes offline, reloads, adds a note, reloads again; opens a page it never saved | The notes screen opens from the cache, the note survives; the calm offline page offers a way back | offline spec |
| 5b | (auth + offline) Reconnects | The note syncs once; another device sees it | synced-store unit suite (fake server) · auth spec real-account test (S6) |
| 6 | (auth module, guest mode until Supabase is set up) Signs up, confirms by email, signs in | Their own notes only | auth spec (S4) + rls-proof |
