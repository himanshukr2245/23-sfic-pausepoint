// node --test test/  → PausePoint Golden Hour engine v2. All fixtures are fictional, written in the style of real
// receipts and bank SMS. Replace nothing here with real people's data.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractTxn, extractAck, parseWhen, suggestCategory, payAgainBrake, missing, callScript, complaintDraft,
  steps, clock, firstPaidAt, familyAlert, total, evidenceManifest, MAX_INPUT,
} from '../src/lib/engine/golden.ts';

const GPAY = `₹15,000\nPaid to RAHUL SHARMA\nrahul.jobs.hr@okaxis\nCompleted\n18 Oct 2026, 3:42 pm\nUPI transaction ID\n429812345678\nTo: RAHUL SHARMA\nGoogle Pay • rahul.jobs.hr@okaxis\nFrom: HIMANSHU K (State Bank of India) ••1234\nGoogle transaction ID\nCICAgOjr7aDbHw`;
const PHONEPE = `Paid Successfully\n03:30 pm on 18 Oct 2026\nPaid to\nQUICK EARN TASKS\ntaskpay77@ybl\n₹2,499\nTransfer Details\nTransaction ID\nT2610181530123456789\nDebited from\nXXXXXXXX4321\nUTR: 612345678901`;
const PAYTM = `Paid Successfully to\nQuick Earn Tasks\nUPI ID: taskpay77@paytm\n₹ 5,000\n18 Oct 2026, 04:10 PM\nUPI Ref No: 629187654321\nFrom: HDFC Bank - 4321`;
const SBI_SMS = `Dear UPI user A/C X7788 debited by 50000.0 on date 18Oct26 trf to CBI VERIFY CELL Refno 512398765432. If not u? call 1800111109. -SBI`;
const HDFC_SMS = `Sent Rs.2499.00\nFrom HDFC Bank A/C x4321\nTo QUICK EARN TASKS\nOn 18/10/26\nRef 612345678901\nNot You?\nCall 18002586161/SMS BLOCK UPI to 7308080808`;
const ICICI_SMS = `ICICI Bank Acct XX123 debited for Rs 9,999.00 on 18-Oct-26; TASKPAY77 credited. UPI:612398712345. Call 18002662 for dispute. SMS BLOCK 123 to 9215676766.`;
const AXIS_IMPS = `INR 25,000.00 debited from A/c no. XX5566 on 18-10-2026 15:42:10 IST via IMPS to A/c XX9012 (RRN 629112345678). Not you? SMS BLOCKALL to 919951860002 - Axis Bank`;
const CARD_SMS = `Rs 9,999.00 spent on HDFC Bank Credit Card ending 4321 at AMAZONPAY on 2026-10-18:15:42:10. Avl Lmt: Rs 50,000. Not you? Call 18002586161`;
const ACK_SMS = `Your complaint has been registered with acknowledgement number 31810260012345. Please submit complete details of the fraud at cybercrime.gov.in using this number. -NCRP`;
const NOW = new Date('2026-10-18T11:00:00Z'); // 4:30 pm IST
const at = (a: string[], i: number): string => a[i] ?? ''; // strict index access

describe('extraction: payment-app receipts', () => {
  test('Google Pay: amount, payee, UPI ID, time, UTR, bank, app ID, payer last 4', () => {
    const t = extractTxn(GPAY);
    assert.equal(t.amountInr, 15000); assert.equal(t.payeeName, 'RAHUL SHARMA'); assert.equal(t.payeeVpa, 'rahul.jobs.hr@okaxis');
    assert.equal(t.utr, '429812345678'); assert.equal(t.appTxnId, 'CICAgOjr7aDbHw'); assert.equal(t.when, '18 Oct 2026, 3:42 pm');
    assert.equal(t.app, 'Google Pay'); assert.equal(t.bank, 'SBI'); assert.equal(t.payerLast4, '1234'); assert.equal(t.channel, 'upi');
    assert.deepEqual(t.warnings, []); assert.deepEqual(missing(t), []);
  });
  test('PhonePe: the bank UTR wins over PhonePe\'s own transaction ID (v1 got this wrong)', () => {
    const t = extractTxn(PHONEPE);
    assert.equal(t.utr, '612345678901'); assert.equal(t.appTxnId, 'T2610181530123456789');
    assert.equal(t.amountInr, 2499); assert.equal(t.payeeName, 'QUICK EARN TASKS'); assert.equal(t.payerLast4, '4321');
  });
  test('PhonePe: "03:30 pm on 18 Oct 2026" keeps the time', () => {
    assert.equal(extractTxn(PHONEPE).when, '03:30 pm on 18 Oct 2026');
  });
  test('Paytm: name on the line after "Paid Successfully to"; payee handle does not decide the app', () => {
    const t = extractTxn(PAYTM);
    assert.equal(t.payeeName, 'Quick Earn Tasks'); assert.equal(t.payeeVpa, 'taskpay77@paytm'); assert.equal(t.utr, '629187654321');
    assert.equal(t.amountInr, 5000); assert.equal(t.bank, 'HDFC Bank'); assert.equal(t.app, undefined);
  });
});

describe('extraction: bank SMS', () => {
  test('SBI: "debited by 50000.0" without a ₹ sign, compact date 18Oct26, payee after "trf to"', () => {
    const t = extractTxn(SBI_SMS);
    assert.equal(t.amountInr, 50000); assert.equal(t.when, '18Oct26'); assert.equal(t.payeeName, 'CBI VERIFY CELL');
    assert.equal(t.utr, '512398765432'); assert.equal(t.bank, 'SBI'); assert.equal(t.payerLast4, '7788'); assert.equal(t.channel, 'upi');
  });
  test('HDFC: payee name stops at "On"; bare "Ref" with 12 digits is the UTR', () => {
    const t = extractTxn(HDFC_SMS);
    assert.equal(t.payeeName, 'QUICK EARN TASKS'); assert.equal(t.utr, '612345678901'); assert.equal(t.amountInr, 2499); assert.equal(t.when, '18/10/26');
  });
  test('ICICI: "UPI:" reference and "X credited" payee', () => {
    const t = extractTxn(ICICI_SMS);
    assert.equal(t.utr, '612398712345'); assert.equal(t.payeeName, 'TASKPAY77'); assert.equal(t.amountInr, 9999); assert.equal(t.bank, 'ICICI Bank');
  });
  test('Axis IMPS: channel is netbanking, not card (v1 bug); RRN beats a 12-digit phone number', () => {
    const t = extractTxn(AXIS_IMPS);
    assert.equal(t.channel, 'netbanking'); assert.equal(t.utr, '629112345678');
    assert.equal(t.payeeAccountLast4, '9012'); assert.equal(t.payerLast4, '5566'); assert.equal(t.bank, 'Axis Bank');
  });
  test('card SMS: channel card, card last 4, amount skips the available limit, ISO time', () => {
    const t = extractTxn(CARD_SMS);
    assert.equal(t.channel, 'card'); assert.equal(t.payerLast4, '4321'); assert.equal(t.amountInr, 9999); assert.equal(t.when, '2026-10-18:15:42:10');
  });
  test('balance is never taken as the amount', () => {
    assert.equal(extractTxn('Avl Bal Rs 12,000. Rs 700 debited via UPI to x@ybl').amountInr, 700);
  });
});

describe('extraction: OCR noise and safety regressions', () => {
  test('₹ read as % → amount still found, with a warning to check', () => {
    const t = extractTxn(GPAY.replace('₹15,000', '%15,000'));
    assert.equal(t.amountInr, 15000); assert.ok(t.warnings.some((w) => w.startsWith('amount:')));
  });
  test('₹ read as "2" ("215,000" breaks Indian grouping) → ₹15,000, flagged', () => {
    const t = extractTxn(GPAY.replace('₹15,000', '215,000'));
    assert.equal(t.amountInr, 15000); assert.ok(t.warnings.some((w) => /read as "2"/.test(w)));
  });
  test('a valid Indian-grouped "21,25,000" is not second-guessed', () => {
    assert.equal(extractTxn('21,25,000\nPaid to A B C\nabc@ybl').amountInr, undefined);
  });
  test('masked account lines (X7788) and years are never read as amounts', () => {
    const t = extractTxn('Paid to\nQUICK EARN TASKS\nX7788\n2026');
    assert.equal(t.amountInr, undefined);
  });
  test('UTR with OCR letters (I for 1, O for 0) is corrected and flagged — never passed on silently', () => {
    const t = extractTxn(GPAY.replace('429812345678', '4298I23456O8'));
    assert.equal(t.utr, '429812345608'); assert.ok(t.warnings.some((w) => w.startsWith('utr:')));
  });
  test('an email like support@phonepe.com is not a UPI ID (v1 reported it as the payee)', () => {
    const t = extractTxn(`Need help? support@phonepe.com\nPaid to\nQUICK EARN TASKS\ntaskpay77@ybl\n₹2,499`);
    assert.equal(t.payeeVpa, 'taskpay77@ybl');
  });
  test('the victim\'s own UPI ID after "From" is never reported as the scammer\'s (v1 bug)', () => {
    const t = extractTxn(`₹15,000\nFrom: Himanshu himanshu.k@oksbi\nTo: RAHUL SHARMA rahul.jobs.hr@okaxis\nUPI transaction ID 429812345678`);
    assert.equal(t.payeeVpa, 'rahul.jobs.hr@okaxis'); assert.equal(t.payeeName, 'RAHUL SHARMA');
  });
  test('two possible payee UPI IDs → a warning asks the person to confirm', () => {
    const t = extractTxn('Paid ₹500 to a1@ybl. Also see b2@okicici');
    assert.ok(t.warnings.some((w) => w.startsWith('payeeVpa: 2 UPI IDs')));
  });
  test('a 12-digit 91-prefixed phone number is not guessed as a UTR', () => {
    assert.equal(extractTxn('Rs 500 sent. Call 919876543210').utr, undefined);
  });
  test('NEFT-style alphanumeric UTR is kept as is', () => {
    assert.equal(extractTxn('NEFT of Rs 40,000 UTR SBIN526291234567 to A/c XX1111').utr, 'SBIN526291234567');
  });
  test('huge input is truncated, not choked on', () => {
    const t = extractTxn('x '.repeat(MAX_INPUT) + ' ₹999 paid');
    assert.equal(t.amountInr, undefined); assert.equal(t.channel, 'unknown');
  });
  test('hostile input stays fast (bounded regex and name search)', () => {
    const t0 = performance.now();
    for (const e of ['to '.repeat(6000), 'a'.repeat(19_990) + '@', 'pay ' + 'x '.repeat(9000) + 'to', '1,'.repeat(9000)]) extractTxn(e);
    assert.ok(performance.now() - t0 < 250, 'took too long');
  });
  test('empty text → everything missing, nothing invented', () => {
    const t = extractTxn('I paid someone on WhatsApp');
    assert.equal(missing(t).length, 4); assert.equal(t.utr, undefined); assert.equal(t.payeeVpa, undefined);
  });
});

describe('1930 acknowledgement SMS', () => {
  test('reads the 14-digit acknowledgement number that starts with 3', () => {
    assert.deepEqual(extractAck(ACK_SMS), { ack: '31810260012345', from1930: true });
  });
  test('a labelled 14-digit number not starting with 3 is kept but marked', () => {
    assert.deepEqual(extractAck('Acknowledgement No: 20810260012345'), { ack: '20810260012345', from1930: false });
  });
  test('no acknowledgement → null', () => { assert.equal(extractAck('Thank you for calling'), null); });
});

describe('time: India time, day-first', () => {
  test('"18 Oct 2026, 3:42 pm" → 10:12 UTC', () => {
    assert.equal(parseWhen('18 Oct 2026, 3:42 pm', NOW)?.at.toISOString(), '2026-10-18T10:12:00.000Z');
  });
  test('"03:30 pm on 18 Oct 2026" and ISO "2026-10-18:15:42:10" both parse with time', () => {
    assert.equal(parseWhen('03:30 pm on 18 Oct 2026', NOW)?.at.toISOString(), '2026-10-18T10:00:00.000Z');
    assert.equal(parseWhen('2026-10-18:15:42:10', NOW)?.at.toISOString(), '2026-10-18T10:12:00.000Z');
  });
  test('date-only "18Oct26" and "18/10/26" parse with hasTime false', () => {
    assert.deepEqual(parseWhen('18Oct26', NOW), { at: new Date('2026-10-17T18:30:00Z'), hasTime: false });
    assert.equal(parseWhen('18/10/26', NOW)?.hasTime, false);
  });
  test('impossible or future dates are rejected (30 Feb, tomorrow)', () => {
    assert.equal(parseWhen('30/02/2026', NOW), null); assert.equal(parseWhen('19 Oct 2026, 9:00 am', NOW), null);
  });
  test('firstPaidAt takes the earliest timed payment; clock counts from it', () => {
    const paid = firstPaidAt([extractTxn(PHONEPE), extractTxn(GPAY)], NOW)!;
    assert.equal(paid.toISOString(), '2026-10-18T10:00:00.000Z');
    assert.match(clock(paid, NOW).message, /^60 min|^1 h 0 min/);
  });
  test('clock: calm urgency before and after the first hour', () => {
    const paid = new Date('2026-10-18T10:00:00Z');
    assert.match(clock(paid, new Date('2026-10-18T10:12:00Z')).message, /^12 min since payment/);
    assert.match(clock(paid, new Date('2026-10-18T12:05:00Z')).message, /^2 h 5 min .* still report now/);
  });
});

describe('category and the pay-again brake', () => {
  test('job/task words and a "jobs.hr" handle suggest job-task', () => {
    assert.equal(suggestCategory('Telegram recruiter asked for a registration fee for the internship', 'rahul.jobs.hr@okaxis').category, 'job-task');
  });
  test('trading words suggest investment; "cbi.verify" suggests digital arrest; nothing → other', () => {
    assert.equal(suggestCategory('VIP group stock trading app showed 300% returns').category, 'investment');
    assert.equal(suggestCategory('cbi.verify@paytm').category, 'digital-arrest');
    assert.equal(suggestCategory('hello').category, 'other');
  });
  test('brake fires on the classic repeat-deposit hooks', () => {
    for (const msg of [
      'Your commission of ₹8,400 is ready. Pay ₹5,000 to unlock withdrawal.',
      'Withdrawal fee of 18% applies before release.',
      'Pay GST on your profits before we can process.',
      'Your account has been frozen due to wrong operation. Deposit 30% to recover it.',
      'Upgrade to VIP level 3 by recharging ₹10,000.',
      'Complete 3 more tasks; pay 15,000 to finish.',
    ]) assert.equal(payAgainBrake(msg).stop, true, msg);
  });
  test('brake stays quiet on normal messages', () => {
    for (const msg of ['Your salary of ₹25,000 has been credited.', 'Pay your electricity bill by the 25th.', 'Meeting at 4 pm?'])
      assert.equal(payAgainBrake(msg).stop, false, msg);
  });
});

describe('outputs: script, draft, steps, alert', () => {
  const case3 = [extractTxn(PHONEPE), extractTxn(HDFC_SMS), extractTxn(PAYTM)];
  test('single payment script names amount, time, app, UTR, payee and bank account', () => {
    const s = callScript(extractTxn(GPAY), 'job-task', { name: 'Asha' });
    assert.match(at(s, 0), /My name is Asha/); assert.match(at(s, 1), /Online job \/ task fraud.*₹15,000.*18 Oct 2026.*Google Pay/);
    assert.match(at(s, 2), /UTR 429812345678, paid to UPI ID rahul\.jobs\.hr@okaxis \(RAHUL SHARMA\), from SBI account ending 1234/);
  });
  test('multi-payment case: total and one line per payment', () => {
    assert.equal(total(case3), 2499 + 2499 + 5000);
    const s = callScript(case3, 'job-task');
    assert.match(at(s, 1), /3 payments, ₹9,998 in total/); assert.equal(s.filter((l) => /^Payment \d/.test(l)).length, 3);
  });
  test('helper mode: filing on behalf of a family member', () => {
    const s = callScript(extractTxn(SBI_SMS), 'digital-arrest', { name: 'Kunal', onBehalfOf: { name: 'Ramesh', relation: 'grandfather' } });
    assert.match(at(s, 0), /on behalf of my grandfather, Ramesh\. My name is Kunal/);
    assert.match(complaintDraft(extractTxn(SBI_SMS), 'digital-arrest', { name: 'Kunal', onBehalfOf: { name: 'Ramesh', relation: 'grandfather' } }), /Filed by Kunal on behalf of Ramesh \(grandfather\)/);
  });
  test('draft lists every transaction and suspect details, and cites no penal sections or legal claims', () => {
    const d = complaintDraft(case3, 'job-task', { story: 'Telegram task group.', suspect: { phones: ['+91 90000 00000'], handles: ['@quickearn'] } });
    assert.match(d, /Transactions \(3, total ₹9,998\)/); assert.match(d, /^3\. /m); assert.match(d, /@quickearn/);
    assert.doesNotMatch(d, /section|IPC|BNS|66D|court|admissible|guarantee/i);
  });
  test('steps: 1930 first, then the acknowledgement-number portal step, then bank via official number', () => {
    const s = steps(extractTxn(GPAY), 'job-task');
    assert.match(at(s, 0), /1930.*14-digit acknowledgement/); assert.match(at(s, 1), /acknowledgement number.*cybercrime\.gov\.in/);
    assert.match(at(s, 2), /never a number from a web search/); assert.ok(s.some((x) => /Do not pay again/.test(x)));
  });
  test('steps adapt: card → block card; unauthorised → RBI 3 working days; remote app → uninstall', () => {
    const s = steps(extractTxn(CARD_SMS), 'other', { unauthorised: true, remoteAccessApp: true });
    assert.ok(s.some((x) => /Block the card/.test(x))); assert.ok(s.some((x) => /3 working days/.test(x))); assert.ok(s.some((x) => /Uninstall/.test(x)));
    assert.ok(!steps(extractTxn(GPAY), 'job-task').some((x) => /3 working days/.test(x)), 'no RBI note for a payment the victim made');
  });
  test('no output ever promises recovery', () => {
    const all = [...steps(case3, 'investment'), ...callScript(case3, 'investment'), complaintDraft(case3, 'investment'), familyAlert(case3, 'investment')].join(' ');
    assert.doesNotMatch(all, /guarantee|will be refunded|get your money back|100%/i);
  });
  test('family alert is short and uses the case total', () => {
    assert.equal(familyAlert(case3, 'job-task'), "I think I've been cheated (Online job / task fraud). I paid ₹9,998. I'm calling 1930 now. Please call me.");
  });
});

describe('evidence manifest', () => {
  test('SHA-256 fingerprints computed on device (known vector for "abc")', async () => {
    const m = await evidenceManifest([{ name: 'receipt.png', data: new TextEncoder().encode('abc') }], NOW);
    assert.equal(m.items[0]?.sha256, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    assert.equal(m.items[0]?.bytes, 3); assert.equal(m.createdAt, NOW.toISOString()); assert.match(m.note, /not a legal certificate/);
  });
});
