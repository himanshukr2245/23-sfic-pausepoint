import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decode, analyzeLink, extractLinks, registrable, domainEntropy } from '../src/lib/engine/decoder.ts';

const SAMPLES = {
  digitalArrest: 'This is Inspector Sharma from Mumbai Crime Branch. A parcel in your name contains drugs. A warrant is issued. Stay on the video call and do not tell anyone or you will be arrested. Pay the clearance fee immediately.',
  kyc: 'Dear customer your SBI account will be BLOCKED today. Update KYC immediately: http://sbi-kyc-update.xyz/login',
  upi: 'Congratulations! You won Rs 5000 cashback. Enter your UPI PIN to receive money in your account.',
  electricity: 'Dear consumer your electricity will be disconnected tonight at 9.30 pm. Contact electricity officer 98XXXXXX10 immediately.',
  newNumber: 'Hi mom this is my new number, my phone is broken. Please send money urgently, I will explain later.',
  job: 'Part-time job! Earn ₹5,000 daily by liking YouTube videos. Join our telegram task group now.',
  apk: 'Your RTO challan is pending. Download the app: https://rto-challan.top/mParivahan.apk',
  benign: 'Hey, the DBMS lab is shifted to room 304 tomorrow. Bring your record book.',
  fraudLink: 'Please visit https://fraud.com',
  traiSim: 'Urgent notice from TRAI: Your SIM card and mobile number will be blocked within 24 hours due to missing biometric KYC.',
  fedexDrugs: 'FedEx customs alert: Your parcel from Taiwan has been seized with illegal narcotics. Pay clearance fee immediately to avoid police arrest.',
  sextortion: 'Your private video recording is going viral on YouTube and Facebook. Transfer ₹25,000 right now or I will send it to your relatives.',
  panAadhaar: 'Income Tax reminder: Your PAN card will become inoperative. Link Aadhaar immediately to avoid penalty fine of Rs 1000.',
  ccPoints: 'Dear Cardholder, your 15,000 credit card reward points worth Rs 7,500 expire today. Redeem cash directly: http://points-redeem-bank.cc',
  stockScam: 'Exclusive SEBI VIP group! Guaranteed 500% profit with special institutional IPO allotment. Join our Telegram group now.',
};

test('digital arrest → danger, playbook named, secrecy + authority + fear found', () => {
  const v = decode(SAMPLES.digitalArrest);
  assert.equal(v.level, 'danger');
  assert.ok(v.playbooks.some((p) => p.id === 'digital-arrest'));
  for (const t of ['secrecy', 'authority', 'fear', 'urgency']) assert.ok(v.tactics.some((x) => x.id === t), t);
  assert.ok(v.verifySteps.some((s) => /Tell a family member/.test(s)));
});

test('KYC SMS with an SBI look-alike link → danger, link says it is not the official site', () => {
  const v = decode(SAMPLES.kyc);
  assert.equal(v.level, 'danger');
  assert.ok(v.playbooks.some((p) => p.id === 'kyc'));
  const l = v.links[0];
  assert.equal(l.domain, 'sbi-kyc-update.xyz');
  assert.ok(l.flags.some((f) => f.flag === 'brand-in-name') && l.flags.some((f) => f.flag === 'risky-tld') && l.flags.some((f) => f.flag === 'no-https'));
});

test('"enter UPI PIN to receive money" → the single most important truth is shown', () => {
  const v = decode(SAMPLES.upi);
  assert.equal(v.level, 'danger');
  assert.match(v.playbooks.find((p) => p.id === 'upi-receive')!.truth, /NEVER need your UPI PIN/);
});

test('electricity, new-number, job and APK scams are each recognised', () => {
  assert.ok(decode(SAMPLES.electricity).playbooks.some((p) => p.id === 'electricity'));
  assert.ok(decode(SAMPLES.newNumber).playbooks.some((p) => p.id === 'new-number'));
  assert.ok(decode(SAMPLES.job).playbooks.some((p) => p.id === 'task-job'));
  const apk = decode(SAMPLES.apk);
  assert.ok(apk.playbooks.some((p) => p.id === 'apk')); assert.ok(apk.links[0].flags.some((f) => f.flag === 'apk'));
  for (const k of ['electricity', 'newNumber', 'job', 'apk'] as const) assert.notEqual(decode(SAMPLES[k]).level, 'low', k);
});

test('new 2026 playbooks: TRAI SIM block, FedEx drugs, Sextortion, PAN-Aadhaar, CC points, Stock tips', () => {
  assert.ok(decode(SAMPLES.traiSim).playbooks.some((p) => p.id === 'trai-sim'));
  assert.ok(decode(SAMPLES.fedexDrugs).playbooks.some((p) => p.id === 'parcel'));
  assert.ok(decode(SAMPLES.sextortion).playbooks.some((p) => p.id === 'sextortion'));
  assert.ok(decode(SAMPLES.panAadhaar).playbooks.some((p) => p.id === 'pan-aadhaar'));
  assert.ok(decode(SAMPLES.ccPoints).playbooks.some((p) => p.id === 'cc-points'));
  assert.ok(decode(SAMPLES.stockScam).playbooks.some((p) => p.id === 'stock-tips'));
});

test('fraud.com link prompt → flagged as DANGER with dangerous keyword detected', () => {
  const v = decode(SAMPLES.fraudLink);
  assert.equal(v.level, 'danger');
  assert.ok(v.links.length > 0);
  assert.ok(v.links[0].flags.some((f) => f.flag === 'dangerous-keyword'));
  assert.ok(v.links[0].risk >= 70);
  assert.match(v.headline, /STOP/);
});

test('an ordinary class message stays low', () => {
  const v = decode(SAMPLES.benign);
  assert.equal(v.level, 'low');
  assert.equal(v.playbooks.length, 0);
});

test('highlights never overlap and point at the exact words', () => {
  const v = decode(SAMPLES.digitalArrest);
  for (let i = 1; i < v.highlights.length; i++) assert.ok(v.highlights[i].start >= v.highlights[i - 1].end);
  for (const h of v.highlights) assert.equal(SAMPLES.digitalArrest.slice(h.start, h.end), h.text);
});

test('links: official domains pass clean; tricks and suspicious keywords are caught', () => {
  assert.equal(analyzeLink('https://www.onlinesbi.sbi/').flags.length, 0);
  assert.equal(analyzeLink('https://cybercrime.gov.in').official, true);
  assert.ok(analyzeLink('http://192.168.4.21/login').flags.some((f) => f.flag === 'ip-address'));
  assert.ok(analyzeLink('https://xn--pypal-4ve.com').flags.some((f) => f.flag === 'punycode'));
  assert.ok(analyzeLink('https://bit.ly/3xYz').flags.some((f) => f.flag === 'shortener'));
  assert.ok(analyzeLink('https://www.sbi.co.in@evil.top/kyc').flags.some((f) => f.flag === 'at-sign'));
  assert.ok(analyzeLink('https://hdfcbamk.com/login').flags.some((f) => f.flag === 'lookalike'));
  assert.ok(analyzeLink('https://sbi.co.in.verify-now.click/').flags.some((f) => f.flag === 'brand-in-name'));
  assert.ok(analyzeLink('https://fraud-test.com/login').flags.some((f) => f.flag === 'dangerous-keyword'));
  assert.ok(analyzeLink('https://secure-account-update.net/verify').flags.some((f) => f.flag === 'suspicious-domain-keyword'));
});

test('registrable domain handles .co.in / .gov.in', () => {
  assert.equal(registrable('www.retail.sbi.co.in'), 'sbi.co.in');
  assert.equal(registrable('a.b.example.xyz'), 'example.xyz');
});

test('entropy calculator detects random algorithmic DGA domains', () => {
  const highEntropy = domainEntropy('x7k9p2q8z1w4');
  const lowEntropy = domainEntropy('google');
  assert.ok(highEntropy > lowEntropy);
});

test('link extraction finds bare domains and strips trailing punctuation', () => {
  assert.deepEqual(extractLinks('Visit sbi-kyc.xyz/login, or www.example.com.'), ['sbi-kyc.xyz/login', 'www.example.com']);
});

test('genuine messages stay low: bank OTP that says "do not share", delivery update, salary credit', () => {
  for (const t of [
    '123456 is your OTP for txn of Rs 2,499.00 at AMAZON on HDFC Bank card ending 1234. Valid for 10 mins. Do not share this OTP with anyone. -HDFC Bank',
    'Your Amazon order #405-1234 has been shipped and will be delivered tomorrow. Track: https://www.amazon.in/progress-tracker',
    'Rs 500 credited to your a/c XX1234 by UPI ref 4321. -SBI',
  ]) assert.equal(decode(t).playbooks.length, 0, t);
  assert.ok(decode('Sir please share the OTP you received to complete verification').playbooks.some((p) => p.id === 'otp'));
});

test('adult and illegal gambling domains are accurately categorized', () => {
  const adult = analyzeLink('https://pornhub.com');
  assert.ok(adult.flags.some((f) => f.flag === 'adult-content'));
  assert.ok(adult.risk >= 40);

  const gambling = analyzeLink('https://mahadev-book-login.online');
  assert.ok(gambling.flags.some((f) => f.flag === 'illegal-gambling'));
  assert.ok(gambling.risk >= 40);
});

