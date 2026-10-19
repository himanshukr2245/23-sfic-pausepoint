# 🛡️ PAUSEPOINT SHIELD: THE ON-PHONE SCAM FIREWALL
## Master Execution Blueprint & Multi-Phase Implementation Plan

> **Authority:** Derived directly from `6-Hackathon/Offline/4-SFIC_2026/26_PAUSEPOINT_SHIELD_ANDROID_PLAN.md` and `25_SFIC_2026_PAUSEPOINT_GOLDEN_HOUR_FINAL_PLAN.md`.  
> **Target Application:** `4-Projects/23-sifc-pausepoint`  
> **Philosophy:** Balanced-Minimalist, Mind-Blowing Speed, 100% Offline Zero-Internet Defense, 90-Second Golden Path Jury Demo.

---

### 🏛️ Executive Summary & Paradigm Shift

PausePoint is evolving from a static fraud-reporting web app into **PausePoint Shield: an on-phone scam firewall**. It operates continuously in the background on the user's Android phone:
1. **Guard:** Evaluates incoming SMS, WhatsApp/Telegram task notifications, and unknown phone calls in under 50 milliseconds.
2. **Warn:** Delivers a calm, clear sub-second warning detailing why the message is dangerous and the single truth that breaks it.
3. **Watch the Money (The Missing Link):** When a bank debit occurs, it matches against flagged communications from the preceding 72 hours. If a correlation is detected (e.g. ₹5,000 sent 2 minutes after a task scam text), it immediately triggers: *"Did you just pay a scammer?"*.
4. **Report:** One tap launches the Golden Hour recovery dossier, prefilled with the debit transaction ID, payee UPI handle, and timestamp, preparing the victim to dial **1930** with an automated script.
5. **Follow Up:** Catches the 14-digit 1930 acknowledgement SMS, updates the case file, and unlocks the cybercrime.gov.in complaint draft.

---

### ⚖️ The India Play Protect Sideloading Reality & The Two-Flavor Solution

Google Play Protect in India blocks web- or WhatsApp-sideloaded APKs requesting `RECEIVE_SMS` or `BIND_NOTIFICATION_LISTENER_SERVICE` (due to rampant OTP malware). Google Play Store only grants anti-smishing SMS exceptions to established apps.

**The Solution: One App, Two Flavors**
```
                           PAUSEPOINT CODEBASE
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
      PUBLIC EDITION (Play Store / Web)         SHIELD EDITION (USB / Pilot / Jury)
      ├── No dangerous permissions              ├── RECEIVE_SMS (New incoming only)
      ├── Web Share Target Level 2              ├── NotificationListenerService
      ├── Manual text / link / receipt share    ├── CallScreeningService
      ├── CallScreeningService (1600 check)     ├── Automatic Money Watch
      └── Zero Internet Permission              └── Zero Internet Permission
```

1. **Public Edition (`public`):** Fully compliant with Google Play. Zero dangerous permissions. Users share suspicious texts, links, or receipts via Android's native Share Sheet. Call screening checks unknown numbers against the TRAI 1600 mandate.
2. **Shield Edition (`shield`):** Installed via USB/ADB for hackathon jury evaluation and consensual pilot participants. Features automatic `SmsReceiver` (strictly new messages, never reading existing inbox) and `ChatNotificationListener` (monitoring WhatsApp/Telegram notifications where task scams happen).
3. **Zero Internet Permission:** Both editions strip `<uses-permission android:name="android.permission.INTERNET" tools:node="remove"/>`. User data literally **cannot** leave the device. When judges ask: *"Isn't reading SMS what malware does?"*, the answer is immediate: *"Malware exfiltrates data. PausePoint has no internet permission. Here is the manifest."*

---

### ⏱️ The 90-Second Offline Golden Path Jury Demo

```mermaid
sequenceDiagram
    autonumber
    actor Judge as 🧑‍⚖️ Judge / Teammate Phone
    actor Target as 📱 PausePoint Shield (Demo Phone - Airplane Mode)
    actor Victim as 👤 User / Presenter

    Note over Target: Wi-Fi & Mobile Data Switched OFF
    Judge->>Target: SMS: "Your task commission ₹8,400 is ready. Pay ₹5,000 to unlock withdrawal."
    Target->>Victim: 🚨 Alert in <50ms: "Pause: this looks like a task scam. Real jobs never ask you to pay."
    Judge->>Target: Teammate sends Bank Debit SMS: ₹5,000 to taskpay77@ybl
    Target->>Victim: ⚡ Money Watch Alert: "Did you just pay a scammer? Clock at 0 min."
    Victim->>Target: Taps "Report Now"
    Target->>Victim: 📋 Golden Hour Dossier prefilled; Ready to dial 1930 with exact script
    Judge->>Target: Teammate sends 1930 Ack SMS: "Complaint 30202600123456 registered"
    Target->>Victim: 🟢 Status: "Complaint registered. Open portal draft."
    Judge->>Target: Unknown 10-digit mobile call arrives
    Target->>Victim: 📞 Call Guard: "Real bank calls now come from 1600 numbers."
    Victim->>Target: Settings -> "Delete Everything" -> Instant Local Wipe
```

---

### 🏗️ Complete System Architecture

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      ANDROID SYSTEM ON-DEVICE                          │
 │                                                                        │
 │  INPUTS                                  BACKGROUND ENGINE             │
 │  ┌─────────────────────────┐             ┌──────────────────────────┐  │
 │  │ New Incoming SMS        │────────────▶│ shield-core (Kotlin JVM) │  │
 │  │ (Shield: SmsReceiver)   │             │ - RulePack Scanner       │  │
 │  ├─────────────────────────┤             │ - DebitSniffer           │  │
 │  │ WhatsApp/TG Alerts      │────────────▶│ - AckParser (1930)       │  │
 │  │ (ChatNotification)      │             │ - Correlator (72h Match) │  │
 │  ├─────────────────────────┤             └─────────────┬────────────┘  │
 │  │ Unknown Incoming Call   │                           │               │
 │  │ (CallScreeningService)  │───────────┐               ▼               │
 │  ├─────────────────────────┤           │ ┌──────────────────────────┐  │
 │  │ Shared Text / Links     │           │ │ Room Database (Local)    │  │
 │  │ (Android Share Sheet)   │───────────┤ │ - Flagged Items (7 Days) │  │
 │  └─────────────────────────┘           │ │ - Entities (72 Hours)    │  │
 │                                        │ │ - Daily Counter Metrics  │  │
 │                                        │ └─────────────┬────────────┘  │
 │                                        ▼               ▼               │
 │                            ┌───────────────────────────────┐           │
 │                            │ Notifier (Android Channels)   │           │
 │                            │ - High: Scam Warning          │           │
 │                            │ - High: Money Watch Alert     │           │
 │                            │ - High: Call Guard Alert      │           │
 │                            └───────────────┬───────────────┘           │
 └────────────────────────────────────────────┼───────────────────────────┘
                                              │ Deep-link Navigation
 ┌────────────────────────────────────────────▼───────────────────────────┐
 │               CAPACITOR WEBVIEW (Next.js Static Export)                │
 │               Zero Remote URLs · All Assets Offline Bundled            │
 │                                                                        │
 │  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────┐ │
 │  │  Home (/)    │   │ X-ray (?id=) │   │Report(?case=)│   │  Verify  │ │
 │  │ Status & Hub │   │ Scam Tactic  │   │ 1930 Dossier │   │ Fee-Brake│ │
 │  └──────────────┘   └──────────────┘   └──────────────┘   └──────────┘ │
 │  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────┐ │
 │  │ Cases Screen │   │ Settings     │   │ Welcome Flow │   │ Learn    │ │
 │  │ Local Vault  │   │ Wipe & Modes │   │ Step Perms   │   │ Simulator│ │
 │  └──────────────┘   └──────────────┘   └──────────────┘   └──────────┘ │
 └────────────────────────────────────────────────────────────────────────┘
```

---

### 📋 Phase-by-Phase Breakdown

#### 🔹 PHASE 1: Static Export Pipeline & UI Simplification
- Configure Next.js static export (`output: 'export'`) when `CAP=1`.
- Clean up navigation: prune legacy `/editorial` and `/showcase` routes.
- Sanitize legal wording: replace "court-admissible Section 63 BSA" with "evidence summary with file fingerprints".

#### 🔹 PHASE 2: Universal Rule-Pack System (`rules/pack.json`)
- Extract 11 levers, 11 playbooks, link heuristics, sender rules, and brake rules into `rules/pack.json`.
- Create `fixtures/messages.jsonl` with 300 test messages (150 scam, 150 benign).
- Connect TypeScript engine to `pack.json` and verify tests.

#### 🔹 PHASE 3: Minimalist Screen Suite & Query Param Routing
- Redesign Home (`/`) with "Am I Protected?" real-time indicator and 3 action doors.
- Create `/xray?id=`, `/cases`, `/welcome` onboarding flow.
- Update `/settings` with retention slider, senior mode, demo mode, and instant wipe.

#### 🔹 PHASE 4: Native Bridge Layer (`src/lib/native/shield.ts`)
- Strongly-typed Capacitor bridge with Zod schemas.
- Browser mock adapter for seamless web-mode fallback.

#### 🔹 PHASE 5: Capacitor Android Project Scaffolding
- Add `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`.
- Configure `capacitor.config.ts` (appId `org.pausepoint.app`, webDir `out`).
- Setup Gradle product flavors (`public` and `shield`) and strip internet permission.

#### 🔹 PHASE 6: `shield-core` Pure Kotlin Engine
- Standalone Kotlin JVM module with zero Android dependencies.
- Implement `RulePack`, `Scanner`, `DebitSniffer`, `AckParser`, and `Correlator`.
- Match fixture outputs with TypeScript engine.

#### 🔹 PHASE 7: Android Background Services & Room Store
- `CallGuardService`, `SmsReceiver`, `ChatNotificationListener`.
- Local Room database `CaseStore` and high-priority notification channels.

#### 🔹 PHASE 8: Conformance Gates & Evidence Documentation
- `npm run check:android` automated gate.
- Document `docs/SPIKES.md` and `docs/CLAIMS.md`.
