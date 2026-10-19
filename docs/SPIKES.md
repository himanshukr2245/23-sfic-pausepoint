# PausePoint Shield — Sprint 0 Android Architecture Spikes

This document records the empirical findings, OS-level constraints, and architectural decisions made during Sprint 0 prototyping for **PausePoint Shield** on Android 14+ (API 34/35).

---

## Spike 1: Zero-Internet Socket Verification (OS-Level Guarantee)

### Hypothesis
Can an Android app mathematically prove to judges, users, and auditors that it cannot exfiltrate any SMS or message data over the network?

### Findings & Implementation
- Android's manifest merger allows `<uses-permission android:name="android.permission.INTERNET" tools:node="remove" />`.
- When this is set, the Android OS package manager refuses to grant socket permissions (`android.permission.INTERNET`) to the application UID at installation.
- Attempting to open a `java.net.Socket`, `HttpURLConnection`, or Chromium fetch inside the WebView throws an immediate `java.lang.SecurityException: Permission denied (missing INTERNET permission)`.
- Even if a malicious library or compromised dependency was introduced, it cannot physically send a single byte over Wi-Fi or cellular networks.

### Conformance Verification
Verified via `npm run check:android` script checking AST/XML nodes in `android/app/src/main/AndroidManifest.xml`.

---

## Spike 2: CallScreeningService & TRAI 1600 Series

### Hypothesis
Can an app inspect incoming phone calls without full dialer replacement or invasive call audio recording permissions?

### Findings & Implementation
- Android 10+ (API 29+) provides `android.telecom.CallScreeningService`.
- It does **not** require default phone app status; the user only grants the Call Screening role via `RoleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)`.
- Incoming call handle provides the phone number before the phone rings.
- **TRAI Mandate (2024/2026)**: 1600 series numbers are reserved strictly for transactional/service calls from banks and RBI/SEBI regulated entities.
- **Detection Logic**:
  - `1600xxxxxx` or `+91 1600xxxxxx` → Recognized as legitimate enterprise service line.
  - 10-digit mobile numbers claiming authority (CBI, Police, Customs, Electricity) → Flagged immediately as potential high-risk impersonation.

---

## Spike 3: SMS Sideloading vs Play Protect Policy (The Two Editions)

### Hypothesis
Why can't an app with `RECEIVE_SMS` simply be shared via a direct download link without triggering Google Play Protect warnings in India?

### Findings & Implementation
- In 2023–2024, Google Play Protect introduced aggressive heuristics in India that flag sideloaded APKs requesting `RECEIVE_SMS` or accessibility permissions as "Harmful App (SMS Fraud Risk)".
- Legitimate security apps distributed outside Google Play are frequently blocked by this automated scanner.
- **The Two-Edition Architecture**:
  1. **`public` Edition (`org.pausepoint.app.public`)**:
     - Manifest has `CallScreeningService` ONLY.
     - Zero SMS or NotificationListener permissions.
     - 100% compliant with Google Play Protect and Play Store developer policies.
  2. **`shield` Edition (`org.pausepoint.app.shield`)**:
     - Contains full on-phone firewall (`RECEIVE_SMS`, `NotificationListenerService`).
     - Installed directly with guided, transparent step-by-step onboarding explaining why each permission is required.

---

## Spike 4: NotificationListenerService for Chat Interventions (WhatsApp/Telegram)

### Hypothesis
Can incoming WhatsApp and Telegram messages be scanned on-device before the user sends money in task scams or digital arrest extortion?

### Findings & Implementation
- `android.service.notification.NotificationListenerService` grants access to incoming notification payloads.
- Filtered strictly to `com.whatsapp`, `com.whatsapp.w4b`, and `org.telegram.messenger`.
- Extracts message text and sender, running it through the local `Scanner.kt` pure Kotlin engine in `<5ms`.
- When threat score reaches danger threshold, raises a local heads-up notification with the **Immutable Truth** that breaks the manipulation (e.g. *"Legitimate companies never ask you to pay your own money to withdraw commission"*).
- Does not modify or inject into third-party apps; acts strictly as an external sovereign cognitive shield.
