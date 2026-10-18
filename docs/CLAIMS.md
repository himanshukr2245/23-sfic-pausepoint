# CLAIMS — every non-FACT statement in the README, UI or pitch
| ID | Claim | Type (FACT/MEASURED/SOURCED/ASSUMPTION/VISION/NEVER) | Evidence / method | How we say it |
|---|---|---|---|---|
| C1 | A new app goes live in about 15 minutes | ASSUMPTION until timed | Time the "Use this template → live" rehearsal in S6 and replace with MEASURED | "About 15 minutes, measured on <date>" |
| C2 | Every rule has a gate | FACT for the gates listed in docs/FACTS.md | `npm run facts` scorecard | "N HK gates run before every release" (number from FACTS) |
| C4 | "Your notes work offline" (offline module) | FACT | `e2e/offline.spec.ts` on phone + laptop viewports: reload with no network is served from the service worker cache (`x-hk-offline: 1`), a note saved offline survives a reload | "Opens and saves notes with no internet — tested in Chrome on every phase"; say "verified on" the phones in docs/testing/device-matrix.md, never "works on all devices" |
| C5 | "Your notes sync to your account" (auth + offline) | ASSUMPTION until S6 | Unit suite against a fake server passes; the real-account e2e test runs against the live project in S6 → then FACT | Only say it after the S6 run is green; until then "syncing is built and tested against a simulated server" |
| C3 | Unhackable / fully secure | NEVER | — | "Passes a defined security baseline and shows the output" (honesty-ok: this row names a banned claim on purpose) |
