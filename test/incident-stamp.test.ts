import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateQRMatrix, generateQRSvg } from '../src/lib/qr/qrcode.ts';
import {
  computePayloadHash,
  buildIncidentDigest,
  formatCertificateText,
  formatDigestForQr,
} from '../src/lib/qr/incident-digest.ts';

describe('Phase F: Zero-Dependency QR & Section 63 BSA 2023 Evidence Stamp', () => {
  describe('Zero-Dependency QR Code Generator (qrcode.ts)', () => {
    test('generateQRMatrix generates valid 2D boolean grid', () => {
      const payload = 'PAUSEPOINT-VERIFICATION-TOKEN-12345';
      const matrix = generateQRMatrix(payload);

      assert.ok(Array.isArray(matrix), 'Matrix should be an array');
      assert.ok(matrix.length > 0, 'Matrix should not be empty');
      assert.equal(matrix.length, matrix[0].length, 'Matrix should be square');

      // QR versions 1-4 with margin 4 produce dimensions >= 29
      assert.ok(matrix.length >= 29, `Matrix size was ${matrix.length}, expected >= 29`);

      // Verify finder pattern corners (top-left, top-right, bottom-left)
      const margin = 4;
      assert.equal(matrix[margin][margin], true, 'Top-left finder pattern core should be dark');
    });

    test('generateQRSvg returns valid SVG string with rects and custom colors', () => {
      const payload = 'https://cybercrime.gov.in/report/1930';
      const svg = generateQRSvg(payload, {
        fgColor: '#00ffee',
        bgColor: '#0b1120',
        cellSize: 8,
      });

      assert.ok(svg.startsWith('<svg'), 'Should start with <svg');
      assert.ok(svg.endsWith('</svg>'), 'Should end with </svg>');
      assert.ok(svg.includes('viewBox="0 0'), 'Should have viewBox');
      assert.ok(svg.includes('fill="#00ffee"'), 'Should use custom fgColor');
      assert.ok(svg.includes('fill="#0b1120"'), 'Should use custom bgColor');
      assert.ok(svg.includes('<rect '), 'Should include rect elements');
    });
  });

  describe('Cryptographic Incident Digest & Section 63 BSA 2023', () => {
    test('computePayloadHash produces deterministic 64-char hex SHA-256', async () => {
      const text1 = 'Digital arrest parcel scam: transfer 50000 to rbi.clearance.sec@okaxis';
      const text2 = 'Digital arrest parcel scam: transfer 50000 to rbi.clearance.sec@okaxis';
      const text3 = 'Digital arrest parcel scam: transfer 50001 to rbi.clearance.sec@okaxis';

      const hash1 = await computePayloadHash(text1);
      const hash2 = await computePayloadHash(text2);
      const hash3 = await computePayloadHash(text3);

      assert.equal(hash1.length, 64, 'SHA-256 hash must be 64 characters');
      assert.match(hash1, /^[0-9a-f]{64}$/, 'Hash must be hexadecimal');
      assert.equal(hash1, hash2, 'Identical inputs must produce identical SHA-256');
      assert.notEqual(hash1, hash3, 'Different inputs must produce different hashes');
    });

    test('buildIncidentDigest builds valid Section 63 compliant digest', async () => {
      const digest = await buildIncidentDigest({
        id: 'case-digital-arrest-01',
        category: 'Fear & Authority Impersonation',
        rawPayload: 'Supreme court arrest warrant courier parcel scam',
        threatLevel: 'critical',
        utr: '429812345678',
        amountInr: 50000,
        payeeVpa: 'rbi.clearance.sec@okaxis',
        payeeName: 'RBI VERIFICATION CELL',
      });

      assert.equal(digest.incidentId, 'case-digital-arrest-01');
      assert.equal(digest.category, 'Fear & Authority Impersonation');
      assert.equal(digest.threatLevel, 'critical');
      assert.equal(digest.financial.utr, '429812345678');
      assert.equal(digest.financial.amountInr, 50000);
      assert.equal(digest.financial.payeeVpa, 'rbi.clearance.sec@okaxis');
      assert.equal(digest.statutoryReference, 'Section 63, Bharatiya Sakshya Adhiniyam, 2023');
      assert.equal(digest.sha256Hash.length, 64);
      assert.ok(digest.timestamp.length > 0);
    });

    test('formatCertificateText creates court-ready legal certificate', async () => {
      const digest = await buildIncidentDigest({
        id: 'case-test-123',
        category: 'Financial / Repeat Deposit Trap',
        rawPayload: 'Telegram part time task balance freeze scam',
        threatLevel: 'high',
        utr: '987654321012',
        amountInr: 12500,
        payeeVpa: 'vip.tasks@ybl',
      });

      const cert = formatCertificateText(digest);

      assert.match(cert, /SECTION 63/i);
      assert.match(cert, /BHARATIYA SAKSHYA ADHINIYAM, 2023/);
      assert.match(cert, /ELECTRONIC RECORD CERTIFICATE/);
      assert.match(cert, /INCIDENT VERIFICATION NUMBER : case-test-123/);
      assert.match(cert, /CRYPTOGRAPHIC HASH PROOF \(SHA-256\)/);
      assert.match(cert, /TRANSACTION FORENSICS/);
      assert.match(cert, /₹12,500/);
      assert.match(cert, /987654321012/);
      assert.match(cert, /SECTION 63 COMPLIANCE DECLARATION/);
      assert.match(cert, /Web Crypto primitives/);
    });

    test('formatDigestForQr generates compact JSON within safe QR length limits', async () => {
      const digest = await buildIncidentDigest({
        id: 'case-compact-qr',
        category: 'Urgency & Utility Disruption',
        rawPayload: 'Bijli bill update apk malware SMS',
        threatLevel: 'medium',
        utr: '112233445566',
        amountInr: 3200,
      });

      const qrPayload = formatDigestForQr(digest);

      assert.ok(qrPayload.length < 500, `QR payload was ${qrPayload.length} bytes, expected < 500`);
      const parsed = JSON.parse(qrPayload);
      assert.equal(parsed.v, 1);
      assert.equal(parsed.case, 'case-compact-qr');
      assert.equal(parsed.sec, 'BSA-63');
      assert.equal(parsed.utr, '112233445566');
      assert.equal(parsed.inr, 3200);
      assert.ok(parsed.sha.startsWith(digest.sha256Hash.substring(0, 16)));
    });
  });
});
