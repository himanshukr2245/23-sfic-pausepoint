// src/lib/qr/incident-digest.ts — BSA 2023 Tamper-Evident Incident Verification Engine
// Generates Section 63 compliance certificates, cryptographic SHA-256 fingerprints,
// and compact verification digests for QR code rendering.

export interface IncidentVerificationDigest {
  version: 1;
  incidentId: string;
  category: string;
  timestamp: string;
  sha256Hash: string;
  financial: {
    utr?: string;
    amountInr?: number;
    payeeVpa?: string;
    payeeName?: string;
  };
  threatLevel: string;
  statutoryReference: 'Section 63, Bharatiya Sakshya Adhiniyam, 2023';
  systemOrigin: 'PausePoint Sovereign Citizen Cognitive Firewall (On-Device)';
}

/**
 * Computes a deterministic SHA-256 hash string for an arbitrary text input.
 * Uses Web Crypto API in browser / Node.
 */
export async function computePayloadHash(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(payload);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Builds the structured verification digest for an incident.
 */
export async function buildIncidentDigest(incident: {
  id: string;
  category: string;
  rawPayload: string;
  threatLevel: string;
  utr?: string;
  amountInr?: number;
  payeeVpa?: string;
  payeeName?: string;
  timestamp?: string;
}): Promise<IncidentVerificationDigest> {
  const sha256Hash = await computePayloadHash(incident.rawPayload || incident.id);

  return {
    version: 1,
    incidentId: incident.id,
    category: incident.category,
    timestamp: incident.timestamp ?? new Date().toISOString(),
    sha256Hash,
    financial: {
      utr: incident.utr,
      amountInr: incident.amountInr,
      payeeVpa: incident.payeeVpa,
      payeeName: incident.payeeName,
    },
    threatLevel: incident.threatLevel,
    statutoryReference: 'Section 63, Bharatiya Sakshya Adhiniyam, 2023',
    systemOrigin: 'PausePoint Sovereign Citizen Cognitive Firewall (On-Device)',
  };
}

/**
 * Compact format for QR Code embedding (<150 chars).
 * Designed for immediate offline smartphone scanner inspection by police or bank officials.
 */
export function formatDigestForQr(digest: IncidentVerificationDigest): string {
  const compact = {
    v: 1,
    case: digest.incidentId,
    utr: digest.financial.utr || 'N/A',
    inr: digest.financial.amountInr || 0,
    vpa: digest.financial.payeeVpa || 'N/A',
    sha: digest.sha256Hash.substring(0, 16) + '...',
    sec: 'BSA-63',
  };
  return JSON.stringify(compact);
}

/**
 * Generates the full legal certificate text for Section 63 BSA 2023.
 */
export function formatCertificateText(digest: IncidentVerificationDigest): string {
  return `================================================================================
ELECTRONIC RECORD CERTIFICATE UNDER SECTION 63
BHARATIYA SAKSHYA ADHINIYAM, 2023 (BSA 2023)
================================================================================
INCIDENT VERIFICATION NUMBER : ${digest.incidentId}
REGISTERED TIMESTAMP         : ${digest.timestamp}
DEVICE ENVIRONMENT           : 100% Client-Side Sandbox (Web Crypto API)
SYSTEM ORIGIN                : ${digest.systemOrigin}
--------------------------------------------------------------------------------
TRANSACTION FORENSICS:
- Bank UTR / Reference No.   : ${digest.financial.utr || 'PENDING'}
- Amount Lost (INR)          : ₹${digest.financial.amountInr?.toLocaleString('en-IN') || '0'}
- Beneficiary Account / UPI  : ${digest.financial.payeeVpa || 'N/A'}
- Beneficiary Name           : ${digest.financial.payeeName || 'N/A'}
- Cyber Threat Category      : ${digest.category}
- Assessed Threat Severity   : ${digest.threatLevel.toUpperCase()}
--------------------------------------------------------------------------------
CRYPTOGRAPHIC HASH PROOF (SHA-256):
${digest.sha256Hash}

SECTION 63 COMPLIANCE DECLARATION:
1. The electronic evidence data was recorded contemporaneously by the user during
   the Golden Hour response window.
2. The SHA-256 cryptographic digest above was computed strictly on-device using
   standard Web Crypto primitives without server intermediary transfer.
3. This certificate serves to identify the electronic record and describe the
   manner in which it was produced to satisfy statutory admissibility requirements.
================================================================================`;
}
