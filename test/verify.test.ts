import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { payAgainBrake } from '../src/lib/engine/golden.ts';

describe('Phase 3: Before You Pay Again Repeat Deposit Brake', () => {
  const TASK_SCAM_UNLOCK =
    'Dear user, your total earnings of ₹45,000 are ready to withdraw. To unlock your withdrawal, you must pay a 15% platform clearance tax of ₹6,750 within 30 minutes.';
  const CRYPTO_UPGRADE =
    'Withdrawal frozen by liquidity pool. Please deposit 0.05 ETH (approx ₹12,000) security deposit to upgrade your account to VIP level and release your full balance.';
  const CBI_BAIL_DEMAND =
    'This is Crime Branch officer. To verify your assets and cancel your arrest warrant, deposit ₹50,000 into the RBI holding account immediately. It will be returned after verification.';
  const RECOVERY_FEE_TRAP =
    'Your frozen funds of ₹1,20,000 have been traced by our cyber recovery agent. Please transfer ₹10,000 recovery fee to release the frozen account.';

  test('detects task scam unlock tax demand', () => {
    const res = payAgainBrake(TASK_SCAM_UNLOCK);
    assert.equal(res.stop, true);
    assert.ok(res.reasons.length > 0);
    assert.match(res.truth, /never ask you to pay/i);
  });

  test('detects crypto/trading VIP upgrade deposit demand', () => {
    const res = payAgainBrake(CRYPTO_UPGRADE);
    assert.equal(res.stop, true);
    assert.ok(res.reasons.length > 0);
  });

  test('detects digital arrest CBI asset verification trap', () => {
    const res = payAgainBrake(CBI_BAIL_DEMAND);
    assert.equal(res.stop, true);
    assert.ok(res.reasons.length > 0);
  });

  test('detects recovery fee secondary extortion trap', () => {
    const res = payAgainBrake(RECOVERY_FEE_TRAP);
    assert.equal(res.stop, true);
    assert.ok(res.reasons.length > 0);
  });

  test('passes genuine messages without triggering brake', () => {
    const safeMessages = [
      'Your order has been shipped and will arrive tomorrow via BlueDart.',
      'Mom, can you send ₹500 for groceries? Paying with UPI now.',
      'Electricity bill reminder: Bill of ₹1,420 is due on 25 Oct 2026.',
      'Meeting scheduled for tomorrow at 11 AM in the conference room.',
    ];

    for (const msg of safeMessages) {
      const res = payAgainBrake(msg);
      assert.equal(res.stop, false, `Expected false for safe message: "${msg}"`);
      assert.equal(res.reasons.length, 0);
    }
  });
});
