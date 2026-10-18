# TRANSLATIONS & BILINGUAL ACCESSIBILITY REGISTRY

**Project:** PausePoint Golden Hour (SFIC 2026 Edition)  
**Challenge:** Seva First Innovation Challenge 2026 · Ministry of Education / IISc Bengaluru  
**Team:** DELTA (JAIN Deemed-to-be University)  
**Lead & Contributors:** Himanshu Kumar (Lead), Ayush Kumar, Sachin Dwivedi, Kunal Tiwari  
**Last Sign-off:** 2026-10-18  

---

## 1. Scope & Linguistic Architecture

PausePoint is deployed in bilingual form to ensure zero linguistic barrier during acute financial cyber emergencies:
- **English (`en`)**: Primary interface language, technical transaction fields (UTR, UPI VPA, SHA-256).
- **Hindi (`hi` — हिन्दी)**: Complete Devanagari translation of all crisis instructions, telephonic 1930 call scripts, repeat-deposit cognitive warnings, and senior citizen guidance.
- **Kannada (`kn` — ಕನ್ನಡ)**: Architecture prepared in `src/lib/i18n.ts` for Bengaluru city pilot rollout.

---

## 2. Translation & Tone Methodology

1. **Calm, Reassuring Tone**:
   - Victims of financial scams experience extreme physiological stress (racing heartbeat, prefrontal cortex shutdown).
   - Translations deliberately use respectful formal Hindi (*"आप"*, *"करें"*, *"सुनाएं"*) and avoid alarmist sensationalism.

2. **NCRP (1930) Standardized Terminology**:
   - Standard Indian cyber policing terminology is maintained consistently across English and Hindi interfaces to prevent confusion when victims speak to real 1930 operators.

3. **Honesty & Legal Discipline**:
   - In accordance with the project's honesty rules, no translation promises or asserts fund recovery.
   - Cryptographic evidence dockets are identified accurately as integrity aids under the *Bharatiya Sakshya Adhiniyam, 2023* (भारतीय साक्ष्य अधिनियम, 2023), never as "court-certified".

---

## 3. Bilingual Crisis Glossary

| English Phrase | हिन्दी (Devanagari) | Context / Operational Rationale |
| :--- | :--- | :--- |
| **Crisis Golden Hour Active** | **गोल्डन आवर सक्रिय है** | Highlights the critical initial window before mule accounts withdraw cash. |
| **1930 Helpline** | **राष्ट्रीय साइबर हेल्पलाइन 1930** | Official MHA Citizen Financial Cyber Fraud Reporting System. |
| **Bank UTR / Ref No** | **12 अंकों का बैंक UTR / संदर्भ संख्या** | The sole identifier required by bank nodal officers to place liens. |
| **Who You Paid** | **किसे भेजा (UPI ID या बैंक खाता)** | Recipient handle or mule account number. |
| **Repeat Deposit Brake** | **रिपीट डिपॉजिट ब्रेक** | Cognitive brake stopping victims from paying secondary "clearance fees". |
| **Three Permanent Truths** | **तीन अटल सच** | Universal cognitive axioms that instantly disprove cyber frauds. |
| **Digital Arrest** | **डिजिटल अरेस्ट** | Scam impersonating CBI, ED, or Police video interrogations. |
| **Secret Family Safety Word** | **गुप्त पारिवारिक सुरक्षा शब्द** | Anti-AI voice cloning and hostage extortion verification passphrase. |
| **Helper Mode** | **सहायक मोड (परिवार के सदस्य की ओर से रिपोर्ट)** | Enables young people to file accurately on behalf of panicked elders. |
| **Evidence Docket** | **डिजिटल साक्ष्य प्रमाण डॉकेट** | On-device SHA-256 digest under Bharatiya Sakshya Adhiniyam, 2023. |

---

## 4. Senior Citizen Mode Specifications

- **Typography Floor**: 22px body text, 115% root font scaling (`html.senior-mode`).
- **Touch Target Floor**: Minimum 52px – 64px height on all buttons, links, and input elements.
- **Contrast Compliance**: Strict WCAG AAA compliance on high-contrast surfaces (`--color-fg` on `--color-bg`).
- **Regional Voice Narration**: Web Speech API speech synthesis tuned to Indian English (`en-IN`) and Hindi (`hi-IN`) at a calm 0.92x cadence.

---

## 5. Team Sign-Off

| Name | Role | Native Language | Status |
| :--- | :--- | :--- | :--- |
| **Himanshu Kumar** | Lead Architect | Hindi / English | ✅ Signed-off |
| **Ayush Kumar** | Frontend & Speech Lead | Hindi / English | ✅ Signed-off |
| **Sachin Dwivedi** | OCR & Pipeline Engineer | Hindi / English | ✅ Signed-off |
| **Kunal Tiwari** | Testing & Verification | Hindi / English | ✅ Signed-off |
