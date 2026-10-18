// test/ocr.test.ts — Phase 1: OCR Pipeline & Canvas Normalization Tests
// Runs on Node.js using native node:test runner.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTargetDimensions,
  computeLuminance,
  enhanceContrast,
} from '../src/lib/ocr/canvas.ts';
import { extractTxn } from '../src/lib/engine/golden.ts';

describe('Phase 1: Canvas Normalizer Math', () => {
  it('calculateTargetDimensions scales down wide images (>1600px)', () => {
    const res = calculateTargetDimensions(3200, 1800, 1600);
    assert.equal(res.width, 1600);
    assert.equal(res.height, 900);
    assert.equal(res.scaled, true);
  });

  it('calculateTargetDimensions scales down tall phone screenshots (>1600px)', () => {
    // Typical modern Android phone screenshot: 1080 x 2400
    const res = calculateTargetDimensions(1080, 2400, 1600);
    assert.equal(res.height, 1600);
    assert.equal(res.width, 720);
    assert.equal(res.scaled, true);
  });

  it('calculateTargetDimensions leaves images <= 1600px untouched', () => {
    const res = calculateTargetDimensions(800, 600, 1600);
    assert.equal(res.width, 800);
    assert.equal(res.height, 600);
    assert.equal(res.scaled, false);
  });

  it('calculateTargetDimensions handles 0 or negative inputs gracefully', () => {
    const res = calculateTargetDimensions(0, 0, 1600);
    assert.equal(res.width, 0);
    assert.equal(res.height, 0);
    assert.equal(res.scaled, false);
  });

  it('computeLuminance maps black to 0 and white to 255', () => {
    assert.equal(computeLuminance(0, 0, 0), 0);
    assert.equal(computeLuminance(255, 255, 255), 255);
  });

  it('computeLuminance correctly weights Green higher than Red and Blue (BT.601)', () => {
    const greenLum = computeLuminance(0, 255, 0);
    const redLum = computeLuminance(255, 0, 0);
    const blueLum = computeLuminance(0, 0, 255);

    assert.ok(greenLum > redLum, 'Green luminance must be higher than Red');
    assert.ok(redLum > blueLum, 'Red luminance must be higher than Blue');
  });

  it('enhanceContrast stretches contrast centered at 128 and clamps within [0, 255]', () => {
    // 128 (mid-grey) stays 128
    assert.equal(enhanceContrast(128, 1.25), 128);

    // Below 128 gets pulled darker
    assert.ok(enhanceContrast(100, 1.25) < 100);

    // Above 128 gets pushed brighter
    assert.ok(enhanceContrast(150, 1.25) > 150);

    // Extreme boundaries clamp cleanly
    assert.equal(enhanceContrast(0, 2.0), 0);
    assert.equal(enhanceContrast(255, 2.0), 255);
  });
});

describe('Phase 1: Synthetic OCR Receipt Parsing Pipeline', () => {
  it('extracts Google Pay receipt with OCR percent symbol error', () => {
    const syntheticOcrGPay = `
      Google Pay
      Paid to
      Digital Tasks Agency
      digitaltasks@okaxis
      %15,000
      Completed
      18 Oct 2026, 3:45 pm
      UPI transaction ID: 629281729182
      To: DIGITAL TASKS AGENCY
      From: VICTIM USER (HDFC Bank)
      Google transaction ID: CICAgODV46uPg
    `;

    const txn = extractTxn(syntheticOcrGPay);
    assert.equal(txn.amountInr, 15000);
    assert.equal(txn.app, 'Google Pay');
    assert.equal(txn.utr, '629281729182');
    assert.equal(txn.payeeVpa, 'digitaltasks@okaxis');
    assert.ok(
      txn.warnings.some((w) => w.startsWith('amount:')),
      'Must flag amber warning for % character OCR misread'
    );
  });

  it('extracts PhonePe receipt and isolates bank UTR from internal app ID', () => {
    const syntheticOcrPhonePe = `
      PhonePe
      Payment to
      Global Crypto Hub
      globalcrypto@ybl
      Rs 25,000
      Payment Successful
      04:12 pm on 18 Oct 2026
      Transaction ID: T2610181612450091827
      UTR: 629281729199
      Debited from: State Bank of India XX4321
    `;

    const txn = extractTxn(syntheticOcrPhonePe);
    assert.equal(txn.amountInr, 25000);
    assert.equal(txn.app, 'PhonePe');
    assert.equal(txn.utr, '629281729199');
    assert.equal(txn.appTxnId, 'T2610181612450091827');
    assert.equal(txn.payeeVpa, 'globalcrypto@ybl');
  });

  it('recovers UTR with optical letter substitutions (I for 1, O for 0)', () => {
    const noisyUtrReceipt = `
      BHIM UPI
      Paid to: Task Settlement
      Handle: settle@upi
      Amount: INR 8500
      Date: 18/10/2026
      UPI Ref No: 62928I729O82
    `;

    const txn = extractTxn(noisyUtrReceipt);
    assert.equal(txn.amountInr, 8500);
    assert.equal(txn.utr, '629281729082'); // 'I' recovered to '1', 'O' to '0'
    assert.ok(
      txn.warnings.some((w) => w.startsWith('utr:')),
      'Must warn user that UTR contained optical character substitutions'
    );
  });

  it('handles bank debit SMS OCR with compact format', () => {
    const syntheticSmsOcr = `
      Dear SBI User, your A/c XX8899 debited by 49999.0 on 18Oct26 trf to FAKE TRADING PVT via UPI Ref 629281729100. If not done by you call 1930.
    `;

    const txn = extractTxn(syntheticSmsOcr);
    assert.equal(txn.amountInr, 49999);
    assert.equal(txn.utr, '629281729100');
    assert.equal(txn.payerLast4, '8899');
    assert.equal(txn.channel, 'upi');
  });
});
