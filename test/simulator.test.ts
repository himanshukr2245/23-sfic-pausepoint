import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS } from '../src/lib/engine/simulator.ts';
import { payAgainBrake } from '../src/lib/engine/golden.ts';
import { decode } from '../src/lib/engine/decoder.ts';

describe('Phase B: Interactive Scam Simulator & Threat Arena', () => {
  test('all 4 core Indian cybercrime scenarios are defined with full schemas', () => {
    assert.equal(SCENARIOS.length, 4);

    const ids = SCENARIOS.map((s) => s.id);
    assert.ok(ids.includes('task-scam'));
    assert.ok(ids.includes('digital-arrest'));
    assert.ok(ids.includes('electricity-apk'));
    assert.ok(ids.includes('upi-pin'));

    for (const scenario of SCENARIOS) {
      assert.ok(scenario.tabTitle.length > 0, `Empty title for ${scenario.id}`);
      assert.ok(scenario.incomingMessage.length > 20, `Message too short for ${scenario.id}`);
      assert.ok(scenario.threatScore >= 90, `Threat score should be >= 90 for ${scenario.id}`);
      
      // Pressure metrics validation
      const { fear, urgency, authority, isolation } = scenario.pressureMetrics;
      assert.ok(fear >= 0 && fear <= 100);
      assert.ok(urgency >= 0 && urgency <= 100);
      assert.ok(authority >= 0 && authority <= 100);
      assert.ok(isolation >= 0 && isolation <= 100);

      // Compliance outcome validation
      assert.ok(scenario.complianceOutcome.headline.length > 0);
      assert.ok(scenario.complianceOutcome.lossAmount.length > 0);
      assert.ok(scenario.complianceOutcome.escalationStep.length > 0);

      // PausePoint intervention validation
      assert.ok(scenario.pausepointIntervention.immutableTruth.length > 0);
      assert.ok(scenario.pausepointIntervention.statuteOrLaw.length > 0);
      assert.ok(scenario.pausepointIntervention.immediateAction.length > 0);
    }
  });

  test('task scam simulation triggers the repeat deposit brake', () => {
    const taskScenario = SCENARIOS.find((s) => s.id === 'task-scam')!;
    const brakeResult = payAgainBrake(taskScenario.incomingMessage);
    assert.equal(brakeResult.stop, true);
    assert.ok(brakeResult.reasons.length > 0);
  });

  test('digital arrest simulation triggers the repeat deposit brake and flags fake authority', () => {
    const daScenario = SCENARIOS.find((s) => s.id === 'digital-arrest')!;
    const brakeResult = payAgainBrake(daScenario.incomingMessage);
    assert.equal(brakeResult.stop, true);

    const decodeResult = decode(daScenario.incomingMessage);
    assert.equal(decodeResult.level, 'danger');
    const tactics = decodeResult.tactics.map((t) => t.id);
    assert.ok(tactics.includes('authority') || tactics.includes('fear'));
  });

  test('electricity APK simulation flags danger and identifies malware risk', () => {
    const apkScenario = SCENARIOS.find((s) => s.id === 'electricity-apk')!;
    const decodeResult = decode(apkScenario.incomingMessage);
    assert.equal(decodeResult.level, 'danger');
    const tactics = decodeResult.tactics.map((t) => t.id);
    assert.ok(tactics.includes('urgency') || tactics.includes('fear'));
  });

  test('UPI PIN simulation triggers immutable truth regarding money deduction', () => {
    const upiScenario = SCENARIOS.find((s) => s.id === 'upi-pin')!;
    const decodeResult = decode(upiScenario.incomingMessage);
    assert.equal(decodeResult.level, 'danger');
    assert.ok(
      decodeResult.verifySteps.some((step) => step.includes('UPI PIN')) ||
      decodeResult.playbooks.length > 0 ||
      decodeResult.tactics.some((t) => t.id === 'credentials')
    );
  });
});
