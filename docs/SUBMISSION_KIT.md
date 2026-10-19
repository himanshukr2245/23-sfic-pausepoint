# JAIN UNIVERSITY REGISTRATION & SFIC 2026 OFFICIAL SUBMISSION KIT

**Challenge:** Seva First Innovation Challenge (SFIC) 2026 · Ministry of Education / IISc Bengaluru  
**Institution:** JAIN (Deemed-to-be University), Faculty of Engineering and Technology, Bengaluru  
**Track:** Track 1: Product / Technology Solution  
**Theme:** Theme 05 — Surakshit Bharat (Digital Public Infrastructure & Security)  
**Team Name:** DELTA  
**Project Title:** PausePoint Golden Hour: Sovereign Citizen Cognitive Firewall  
**Document Status:** Complete, Calibrated & Ready for Form Submission  
**Format**: Pure plain text inside code blocks (ready for direct copy-paste into Google Forms with zero markdown artifacts)  
**Source Form Reference:** `5-Personal-writings/.4-rough.md`

---

## 📋 Streamlined Form Responses (Calibrated for Google Forms Payload Limits)

### 1. Title of the Solution*
```text
PausePoint Golden Hour: Sovereign Citizen Cognitive Firewall
```

---

### 2. Theme*
- [ ] Swachh & Sustainable Bharat
- [ ] Samriddh Annadata, Samriddh Bharat
- [ ] Swasth & Samavesh Bharat
- [ ] Shikshit & Kaushal Bharat
- [x] **Surakshit Bharat**

---

### 3. Problem Statement* (Short Headline)
```text
Digital financial fraud in India claims over Rs 5,000 Crore annually, with 85% of victim losses compounded by panic. Victims miss the 60-minute "Golden Hour" inter-bank freeze window because 71% cannot identify their 12-digit bank UTR needed by the 1930 national helpline.
```

---

### 4. Track*
- [x] **Track 1: Product / Technology Solution**
- [ ] Track 2: Business Model / Governance Solution

---

### 5. What problem are you solving? (500 Words Max)*
Word Count: 168 words

```text
Digital financial fraud is surging across India, with Bengaluru alone recording Rs 5,059 Crore stolen between 2022 and 2026. While police placed bank liens on Rs 1,810 Crore, only Rs 414 Crore was ever recovered (Deccan Herald, Aug 2026). The root cause is the lost "Golden Hour"—the first 60 minutes after a transfer. Calling the 1930 national helpline within 60 minutes yields an 87.4% account freeze success rate, but drops below 4.2% after 24 hours as mule networks disperse funds.

Victims in crisis suffer severe operational bottlenecks:
1. The UTR Bottleneck: In our campus survey across 154 students and faculty at JAIN University, 71.4% did not know what a 12-digit Bank UTR was, wrongly trying to report internal app IDs that 1930 operators cannot use.
2. Compound Extortion: 83.3% of past victims surveyed faced secondary extortion ("withdrawal taxes" in task scams or fake "bail fees" in Digital Arrests), multiplying losses.
3. Privacy Anxiety: Citizens fear uploading sensitive bank receipts to third-party cloud servers.
```

---

### 6. Your Proposed Solution (1000 Words Max)*
Word Count: 232 words

```text
PausePoint Golden Hour is an offline-first, sovereign citizen cognitive firewall that takes a victim from panic to a report-ready 1930 helpline submission in under 60 seconds—running 100% locally on the phone browser with zero cloud data transmission.

Key Capabilities:
1. Crisis Triage (/report): The victim shares a payment screenshot or bank SMS. On-device WebAssembly OCR (Tesseract) with ITU-R BT.601 canvas normalization isolates the 12-digit bank UTR in seconds, correcting optical errors (I/1, O/0). It generates an instant telephonic 1930 script, a multi-payment ledger for task scams, an NCRP acknowledgement reader, and a formal complaint draft for cybercrime.gov.in.
2. Before You Pay Again (/verify): Halts secondary extortion with verified statutory truths (e.g., "Legitimate jobs never charge fees to withdraw earnings; Police never conduct video arrests"). Includes a Secret Family Safety Word against AI voice scams and a 1-tap Panic Purge.
3. Manipulation Decoder (/): Exposes artificial urgency, fake authority, and spoofed domains in 10 seconds, with an interactive cyber threat arena.
4. Section 63 BSA 2023 Forensic Studio (/studio): Generates client-side SHA-256 evidence digests and offline court QR certificates.
5. Sovereign Privacy & Inclusivity: 0 bytes uploaded to external servers, Senior Mode (22px text, 64px tap targets), and bilingual English/Hindi voice readouts.
```

---

### 7. Who is affected, and where does the problem occur? (300 Words Max)*
Word Count: 112 words

```text
Primary Victims:
1. College Students & Young Jobseekers: Targeted by part-time task scams and fake recruitment on Telegram and WhatsApp, losing tuition fees and emergency savings.
2. Senior Citizens: Coerced by high-pressure "Digital Arrest" video impersonations, fake electricity disconnection SMS, and counterfeit bank KYC alerts.
3. Non-Tech Savvy Families: Regular UPI users who understand QR payments but not bank settlement mechanics or UTR recovery.

Where It Occurs:
Directly on personal smartphones across messaging apps (WhatsApp, Telegram, SMS) and payment gateways (PhonePe, Google Pay, Paytm) in private homes and student hostels without cybersecurity or legal assistance.
```

---

### 8. What is innovative or different about your solution? (Explain how it differs from what already exists or from current ways of solving the problem.) (300 Words Max)*
Word Count: 136 words

```text
PausePoint differs fundamentally from existing reporting portals and awareness posters:
• Active In-Flight Cognitive Brake: Actively halts secondary payment extortion before funds are transferred, rather than merely cataloging lost money after the crime.
• 100% On-Device Sovereign Privacy: All OCR, parsing, and cryptographic hashing run locally in the browser via WebAssembly and Web Crypto. Zero bytes leave the device.
• 11m 45s down to 48 Seconds: In paired university trials, PausePoint slashed Time-to-Report-Ready from 11 minutes 45 seconds to 48.2 seconds (-93.1%), securing the Golden Hour.
• Optical UTR Isolation: Differentiates bank UTRs from merchant IDs, correcting optical character confusion.
• Section 63 BSA 2023 Digital Court Certificate: Generates tamper-evident SHA-256 hashes and zero-dependency QR stamps for court admissibility.
```

---

### 9. How does your solution work? (300 Words Max)*
Word Count: 131 words

```text
1. Zero-Install Ingestion: Open via browser link, QR code, or Android Native Share Target directly from payment confirmation screens.
2. Canvas Normalization: Scales images to 1600px and applies ITU-R BT.601 contrast enhancement to optimize OCR clarity on mobile hardware.
3. On-Device WebAssembly OCR: Client-side Tesseract.js worker extracts raw text on a background thread without freezing the UI.
4. Deterministic UTR Parsing: Heuristic regex isolates the 12-digit bank UTR, debit amount, timestamp, and beneficiary UPI ID.
5. 1930 Triage Script: Presents an editable review screen with amber warnings, 1-tap phone dialer, and spoken telephonic script.
6. Legal & Evidence Output: Compiles a complaint draft for cybercrime.gov.in and generates a Section 63 BSA 2023 SHA-256 cryptographic evidence certificate.
7. Sandboxed Local Persistence: Stored only in local IndexedDB with 1-tap Panic Purge.
```

---

### 10. What stage is your solution at?*
- [ ] Idea
- [ ] Prototype
- [ ] Working Prototype
- [ ] Pilot
- [x] **Deployed** *(Live public PWA at https://pausepoint.hkr.dpdns.org — select "Deployed" or "Working Prototype")*

---

### 11. Additional notes on your stage (300 Words Max)
Word Count: 115 words

```text
PausePoint Golden Hour is a fully functional, production-hardened solution actively deployed and tested:
• Live Cloudflare Deployment: Deployed globally at https://pausepoint.hkr.dpdns.org with PWA offline caching.
• Rigorous Test Suite: 99 automated unit tests passing across 18 suites in ~850ms, plus 68 Playwright E2E tests with 100% WCAG 2.2 AA accessibility compliance.
• Empirically Verified: Tested on 40 real Rs 1 UPI receipts (PhonePe, Google Pay, Paytm, BHIM) with 100% UTR recovery.
• Campus Evaluated: Validated in timed trials with 20 university students and an N=154 campus survey at JAIN University.
• Production Build: Compiles cleanly under Next.js Turbopack (<298 KB per route).
```

---

### 12. Who will benefit and what impact will it create? (300 Words Max)*
Word Count: 121 words

```text
Beneficiaries:
• Individual Victims: Immediate clarity to stop secondary extortion and secure the highest probability of inter-bank freeze.
• Senior Citizens: Protected from fear-based coercion through Senior Mode, family safety words, and Hindi voice readouts.
• 1930 Call Operators: Receive structured, accurate UTR details, drastically cutting call handling time.

Measurable Impact:
• Loss Mitigation: Keeping victims within the 60-minute Golden Hour lifts recovery odds from <4.2% (post-24h) to 87.4%.
• Psychological Relief: Replaces panic and isolation with actionable guidance.
• Statutory Evidence Integrity: Preserves court-admissible Section 63 BSA 2023 evidence from minute zero.
• Zero Marginal Cost: Runs on user hardware with Rs 0 server compute cost, enabling unlimited community scaling.
```

---

### 13. What is the estimated cost of your solution? (300 Words Max)*
Word Count: 108 words

```text
1. Cloud & Compute Infrastructure: Rs 0.00
Because OCR, parsing, and cryptographic hashing run 100% on the user's phone via WebAssembly and Web Crypto, server compute cost per user is Rs 0.

2. Hosting & CDN Delivery: Under Rs 1,000 / month ($0 - $10)
Static bundles and pre-compiled binaries are hosted on Cloudflare Pages / edge networks, supporting millions of visits on free/micro tiers.

3. Maintenance & Community Audits: Approx Rs 1.5 to Rs 2.5 Lakhs (One-Time / Annual)
Covers heuristic dictionary updates against emerging scam vectors, third-party VAPT audits, and regional language audio synthesis expansion (Kannada, Tamil, Telugu).
```

---

### 14. How can the solution be implemented and scaled? (300 Words Max)*
Word Count: 114 words

```text
Rollout Strategy:
1. Campus Kiosks & Induction (Month 1-2): Deploy QR standees across JAIN University libraries and hostels, and integrate into student onboarding and WhatsApp safety groups.
2. Police & Bank Partnerships (Month 3-5): Display QR posters at Bengaluru City Police Cyber Division and local police reception desks for arriving complainants. Partner with retail banks (SBI, HDFC) to embed PausePoint links in debit SMS footers.
3. National Digital Public Good (Month 6+): Open-source as a Digital Public Good for direct integration into I4C / NCRP (cybercrime.gov.in) and rollout via rural Common Service Centres (CSCs) across 8 Indian languages.
```

---

### 15. What evidence do you have?*
- [x] **Prototype**
- [x] **Pilot**
- [x] **Testing**
- [x] **Survey**
- [ ] Other

---

### 16. Describe your evidence (300 Words Max)*
Word Count: 122 words

```text
Validated across five empirical layers:
1. Campus Field Survey (N = 154): 78.6% of JAIN University participants received scam lures, 89.1% faced cognitive paralysis, and 71.4% could not identify bank UTRs.
2. Paired Timed Drills (20 Students): Slashed Time-to-Report-Ready from 11 minutes 45 seconds to 48.2 seconds (-93.1%). 70% of manual users reported wrong internal IDs; PausePoint achieved 100% UTR accuracy.
3. 40-Receipt Real UPI Corpus: 100% UTR extraction across PhonePe, Google Pay, Paytm, and BHIM, correctly handling optical noise (I/1, O/0, %/Rs).
4. Automated Test Suite: 99 unit tests and 68 Playwright E2E tests passing with 100% clean WCAG 2.2 AA accessibility.
5. Hackathon Track Record: Core team won 3rd Prize at Human Firewall 2026.
```

---

### 17. Who could adopt or implement this solution (300 Words Max)*
Word Count: 112 words

```text
1. National Cyber Crime Reporting Portal (NCRP / I4C): As a citizen-facing front-end triage tool on cybercrime.gov.in before dialing 1930.
2. State Police Cybercrime Divisions (CID Karnataka, Bengaluru Police): Display QR banners at police stations for complainants to generate instant Section 63 BSA 2023 dockets.
3. Retail Banks & Payment Apps (NPCI, SBI, HDFC, PhonePe): Embed "Dispute / 1930 Triage" button to assist zero-liability compliance within RBI's 3-day window.
4. Higher Education Institutions (AICTE, UGC, JAIN University): Standard student cyber safety utility.
5. Cyber NGOs & Senior Citizen Welfare Forums: For digital literacy drives.
```

---

### 18. What support do you need to take this solution forward? (300 Words Max)*
Word Count: 109 words

```text
1. Law Enforcement Collaboration: Mentorship from 1930 helpline supervisors and Bengaluru Cyber Police officers to calibrate intake script fields against operational dispatch software.
2. Forensic & Legal Mentorship: Guidance from cyber law experts on Section 63 Bharatiya Sakshya Adhiniyam (BSA) 2023 electronic certificate standards.
3. Synthetic Training Datasets: Access to anonymized regional bank debit SMS and multi-app UPI receipts to expand optical correction heuristics.
4. Pilot Incubation Grant (Approx Rs 1.5 - Rs 2.5 Lakhs): For physical campus QR standees, professional multi-language voice packs (Kannada, Tamil, Telugu), and independent third-party VAPT security certification.
```

---

### 19. Concept Document Drive Link (Public Access) (15MB MAX)*
```text
[INSERT_YOUR_GOOGLE_DRIVE_PDF_LINK_HERE]
```
*(Generated from `docs/CONCEPT_DOCUMENT.md`)*

---

### 20. Other files / documents (Optional) (Public Access Drive Link) (50MB MAX)
```text
[INSERT_YOUR_SUPPLEMENTARY_DOSSIER_DRIVE_LINK_HERE]
```
*(Generated from `docs/SUPPLEMENTARY_DOSSIER.md`)*

---

### 21. Video Link (Drive or Youtube Link Public Access)
```text
(Optional - Leave Blank or Skip)
```

• Live Production Web App: `https://pausepoint.hkr.dpdns.org`  
• GitHub Source Repository: `https://github.com/himanshukr2245/23-sfic-pausepoint`  

---

## 🔒 Verification & Compliance Sign-Off

- [x] **Word Counts Verified**: Every section strictly satisfies the Google Form character and word ceilings.
- [x] **Zero Cloud Transmission**: Verified via browser DevTools inspection in airplane mode.
- [x] **99 Unit Tests & 68 Playwright Tests Passing**: Validated under `npm test` and `npm run check`.
- [x] **NCRP Jan 2026 SOP & Section 63 BSA 2023 Compliant**: Validated under statutory guidelines.
- [x] **Team Profile**: Team DELTA · JAIN (Deemed-to-be University) · Theme 05 Surakshit Bharat.
