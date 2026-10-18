# PERFORMANCE BUDGET — PausePoint (owner: Himanshu, updated 2026-10-06)
Budget phone: a ₹8,000–12,000-class Android, 3–4 GB RAM (DEV-1) · Network profile: DevTools "Slow 3G"
| Metric | Target | Ceiling | Gate |
|---|---|---|---|
| Route weight (empty cache) | 750 KB | 1,300 KB | check-weight (`hk.config.json` weight.budgetKB) |
| Asset folders total | 3 MB | 5 MB | check-assets |
| Largest asset | 80 KB | 200 KB | check-assets |
| LCP / INP / CLS on the budget phone | 2.0 s / 100 ms / 0.05 | 2.5 s / 200 ms / 0.1 | manual Lighthouse mobile on the deployed URL |
Exceptions (with reason): none.
