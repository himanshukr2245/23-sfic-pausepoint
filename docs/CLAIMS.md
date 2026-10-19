# PausePoint Shield — Legal Claims & Evidentiary Boundaries

This document defines the exact boundaries, honesty declarations, and statutory posture for **PausePoint** and **PausePoint Shield** in compliance with the **Bharatiya Sakshya Adhiniyam (BSA), 2023** and SFIC 2026 hackathon standards.

---

## 1. Statutory Evidentiary Boundaries (Section 63 BSA 2023)

### What PausePoint Generates:
- **Cryptographic Audit Digest**: PausePoint computes a client-side SHA-256 fingerprint over the victim's collected screenshots, message text, and extracted transaction parameters (UTR, UPI ID, timestamp).
- **Incident Stamp**: The generated evidence stamp contains the cryptographic hash, timestamp, and device-side verification metadata.

### What PausePoint Does NOT Claim:
- **No Self-Certification of Legal Admissibility**: PausePoint does **not** claim to provide an automatically "court-certified" or "judicially sealed" certificate. Under Section 63 of the BSA 2023, admissibility of electronic records requires an accompanying certificate signed by an authorized custodian of the device or an accredited forensic laboratory under Section 79A of the IT Act.
- **Supportive Evidentiary Dossier**: The output is designed as a structured evidentiary dossier to assist law enforcement officers (NCRP/1930) and cyber cells in freezing beneficiary bank accounts during the Golden Hour window.

---

## 2. No Recovery Promises

- PausePoint explicitly informs victims: **"Reporting quickly increases the probability of funds being frozen by the beneficiary bank, but no app or authority can guarantee 100% financial recovery."**
- We strictly avoid the language of "guaranteed refunds" or "guaranteed fund recovery" used by secondary recovery scammers.

---

## 3. Privacy & Zero-Cloud Telemetry Posture

- **No Remote Telemetry**: PausePoint transmits zero analytics, tracking beacons, or incident details to cloud servers.
- **Kernel-Enforced Isolation**: On Android, the application manifest explicitly removes the `android.permission.INTERNET` permission (`tools:node="remove"`).
- **App-Private Storage**: Flagged cases, evidence manifests, and settings remain in app-private sandboxed storage (`Room` database / `localStorage` / `IndexedDB`), protected from cross-app access.
- **User-Controlled Retention**: Automatic purge default is set to 7 days, configurable between 1 and 30 days, with an instant 1-tap "Emergency Wipe" button that permanently shreds all local device records.
