// src/lib/engine/golden.ts — PausePoint "Golden Hour" engine, v2.
// The minutes after a fraud payment, when a fast, complete 1930 report gives the best chance of a hold on the money.
// Turns OCR'd payment screenshots and bank SMS into: a 1930 call script, an NCRP complaint draft, ordered steps,
// a family alert, and an evidence manifest. Pure functions, no network, no storage → unit-tested with node:test.
//
// Honesty rules baked in (LAW-4): never promises recovery, never cites penal sections, never calls anything
// "court-admissible". Every extracted field can carry a warning so the UI asks the person to check it.

export type Channel = 'upi' | 'netbanking' | 'card' | 'wallet' | 'unknown';

export interface Txn {
  amountInr?: number;
  /** Bank reference that traces the money across banks: UPI UTR / RRN (12 digits) or NEFT/RTGS UTR. */
  utr?: string;
  /** Payment-app internal ID (PhonePe T…, Google transaction ID). Useful, but not the bank UTR. */
  appTxnId?: string;
  payeeVpa?: string;
  payeeName?: string;
  /** Last 4 digits of the beneficiary account, when only a masked account is shown (IMPS/NEFT). */
  payeeAccountLast4?: string;
  /** Last 4 digits of the victim's own account or card. */
  payerLast4?: string;
  app?: string;
  bank?: string;
  when?: string;
  channel: Channel;
  /** Fields the person must double-check before using them (OCR guesses, ambiguous matches). */
  warnings: string[];
}

export const MAX_INPUT = 20_000; // OCR text larger than this is truncated (keeps regex work bounded)

// ───────────────────────────── helpers ─────────────────────────────

const clean = (s: string) => s.slice(0, MAX_INPUT).replace(/\r/g, '');
const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Indian digit grouping: 999 · 15,000 · 1,25,000 · 12,34,56,789 (optionally .dd). */
const INDIAN_GROUPED = /^(?:\d{1,3}|\d{1,2}(?:,\d{2})*,\d{3})(?:\.\d{1,2})?$/;
const toNumber = (s: string) => Number(s.replace(/,/g, ''));

const APPS: [RegExp, string][] = [
  [/\b(?:google pay|gpay|g pay)\b/i, 'Google Pay'], [/\bphone ?pe\b/i, 'PhonePe'], [/\bpaytm\b/i, 'Paytm'],
  [/\bbhim\b/i, 'BHIM'], [/\bamazon ?pay\b/i, 'Amazon Pay'], [/\bcred\b/i, 'CRED'], [/\bwhatsapp pay\b/i, 'WhatsApp Pay'],
  [/\bmobikwik\b/i, 'MobiKwik'], [/\bfreecharge\b/i, 'Freecharge'],
];

const BANKS: [RegExp, string][] = [
  [/\b(?:sbi|state bank of india|state bank)\b/i, 'SBI'], [/\bhdfc\b/i, 'HDFC Bank'], [/\bicici\b/i, 'ICICI Bank'],
  [/\baxis\b/i, 'Axis Bank'], [/\bkotak\b/i, 'Kotak Mahindra Bank'], [/\bcanara\b/i, 'Canara Bank'],
  [/\bbank of baroda\b|\bbob\b/i, 'Bank of Baroda'], [/\bpnb\b|\bpunjab national\b/i, 'Punjab National Bank'],
  [/\bunion bank\b/i, 'Union Bank of India'], [/\bindian bank\b/i, 'Indian Bank'], [/\byes bank\b/i, 'Yes Bank'],
  [/\bidfc\b/i, 'IDFC FIRST Bank'], [/\bindusind\b/i, 'IndusInd Bank'], [/\bfederal bank\b/i, 'Federal Bank'],
  [/\bkarnataka bank\b/i, 'Karnataka Bank'], [/\bbank of india\b/i, 'Bank of India'], [/\bidbi\b/i, 'IDBI Bank'],
  [/\bairtel payments bank\b/i, 'Airtel Payments Bank'], [/\bpaytm payments bank\b/i, 'Paytm Payments Bank'],
];

const firstOf = (list: [RegExp, string][], s: string) => list.find(([re]) => re.test(s))?.[1];

// ───────────────────────────── amount ─────────────────────────────

const RE_AMOUNT_CURRENCY = /(?:₹|\brs\.?|\binr|\brupees)\s?([\d,]+(?:\.\d{1,2})?)/gi;
const RE_AMOUNT_VERB = /\b(?:debited|deducted|paid|sent|transferred|spent)\s+(?:by|for|of|with)?\s*([\d,]+(?:\.\d{1,2})?)\b/i;
const RE_BALANCE_BEFORE = /(?:bal(?:ance)?|lmt|limit)[\s.:]*$/i;
/** A line that is only an amount whose ₹ was misread by OCR as %, &, Z, X, ? or 2. */
const RE_AMOUNT_MISREAD = /^([%&Z?])\s?([\d,]+(?:\.\d{1,2})?)$|^2(\d[\d,]*,\d{3}(?:\.\d{1,2})?)$/;

function extractAmount(text: string, warnings: string[]): number | undefined {
  // 1. Currency-prefixed amounts, skipping balances and limits ("Avl Bal Rs 10,000").
  for (const m of text.matchAll(RE_AMOUNT_CURRENCY)) {
    const before = text.slice(Math.max(0, (m.index ?? 0) - 12), m.index);
    if (RE_BALANCE_BEFORE.test(before)) continue;
    const n = toNumber(m[1] ?? '');
    if (n > 0) return n;
  }
  // 2. Bank SMS without a currency sign: "debited by 50000.0".
  const verb = oneLine(text).match(RE_AMOUNT_VERB)?.[1];
  if (verb && toNumber(verb) > 0) return toNumber(verb);
  // 3. Receipt line where OCR misread the ₹ sign. Always flagged for checking.
  for (const line of text.split('\n').map((l) => l.trim())) {
    const m = line.match(RE_AMOUNT_MISREAD);
    if (!m) continue;
    if (m[2] && (m[1] === '%' || m[2].includes(',')) && INDIAN_GROUPED.test(m[2])) {
      warnings.push('amount: read from a line where the ₹ sign looked like another character — check it');
      return toNumber(m[2]);
    }
    // "₹15,000" read as "215,000": a leading 2 that breaks Indian grouping is almost always the ₹ sign.
    if (m[3] && !INDIAN_GROUPED.test(`2${m[3]}`) && INDIAN_GROUPED.test(m[3])) {
      warnings.push('amount: the ₹ sign may have been read as "2" — check the amount');
      return toNumber(m[3]);
    }
  }
  return undefined;
}

// ───────────────────────────── UTR / reference ─────────────────────────────

// Labels that name the bank-side reference (highest priority first).
const UTR_LABELS = [
  /\butr(?:\s*(?:no|number))?\.?\s*[:#-]?\s*([A-Z0-9OIl|]{12,22})\b/i,
  /\brrn\s*(?:no\.?)?\s*[:#-]?\s*([0-9OIl|]{12})\b/i,
  /\bupi\s*(?:transaction|txn)\s*id\s*[:#-]?\s*([0-9OIl|]{12})\b/i,
  /\bupi\s*ref(?:erence)?\.?\s*(?:no\.?|number)?\s*[:#-]?\s*([0-9OIl|]{12})\b/i,
  /\bupi\s*[:#-]\s*([0-9OIl|]{12})\b/i,
  /\bref(?:erence)?\s*(?:no\.?|number)?\s*[:#-]?\s*([0-9OIl|]{12})\b/i,
  /\brefno\s*[:#-]?\s*([0-9OIl|]{12})\b/i,
];
const APP_TXN_LABELS = [
  /\b(?:google\s*)?transaction\s*id\s*[:#-]?\s*([A-Z][A-Za-z0-9]{9,30})\b/i,
  /\b(T\d{18,24})\b/,
];

/** OCR often reads 0 as O and 1 as I, l or |. Only applied to references that must be digits. */
function digitsFromOcr(raw: string): { value: string; fixed: boolean } {
  const value = raw.replace(/[Oo]/g, '0').replace(/[IiLl|]/g, '1');
  return { value, fixed: value !== raw };
}

function extractUtr(t: string, warnings: string[]): string | undefined {
  for (const re of UTR_LABELS) {
    const raw = t.match(re)?.[1];
    if (!raw) continue;
    if (/^[0-9OIl|]{12}$/.test(raw)) {
      const { value, fixed } = digitsFromOcr(raw);
      if (fixed) warnings.push(`utr: OCR letters corrected (${raw} → ${value}) — check against your payment app`);
      return value;
    }
    if (/^[A-Z]{4}[0-9A-Z]{8,18}$/.test(raw)) return raw; // NEFT/RTGS style, e.g. SBIN526291234567
  }
  // Last resort: a lone 12-digit number that is not a phone number (91 + 10 digits) near a number keyword.
  for (const m of t.matchAll(/\b(\d{12})\b/g)) {
    const n = m[1] ?? '';
    if (/^91[6-9]\d{9}$/.test(n)) continue;
    warnings.push('utr: no label found — guessed from a 12-digit number; check it');
    return n;
  }
  return undefined;
}

// ───────────────────────────── payee ─────────────────────────────

// A UPI ID: handle@psp, where the PSP part has no dot after it (so support@phonepe.com is an email, not a UPI ID).
const RE_VPA = /\b([a-z0-9][a-z0-9.\-_]{1,63})@([a-z][a-z0-9]{1,24})\b(?!\.[a-z])/gi;
const RE_FROM_CONTEXT = /\b(?:from|debited from|your upi id|my upi id|sender)\b[^\n@]{0,40}$/i;

function extractVpa(text: string, warnings: string[]): string | undefined {
  const found: { vpa: string; fromSide: boolean }[] = [];
  for (const m of text.matchAll(RE_VPA)) {
    const before = text.slice(Math.max(0, (m.index ?? 0) - 48), m.index);
    found.push({ vpa: `${m[1]}@${m[2]}`.toLowerCase(), fromSide: RE_FROM_CONTEXT.test(before) });
  }
  const payees = [...new Set(found.filter((f) => !f.fromSide).map((f) => f.vpa))];
  if (payees.length > 1) warnings.push(`payeeVpa: ${payees.length} UPI IDs found (${payees.join(', ')}) — confirm which one you paid`);
  return payees[0];
}

const NAME_STOP = /^(?:on|ref|refno|utr|upi|via|from|avl|bal|info|not|if|a\/c|ac|acct|using|at|for|rrn|txn|is|has|was|google|completed|successful)$/i;

function nameAt(rest: string): string | undefined {
  const words: string[] = [];
  for (const w of rest.slice(0, 96).trim().split(/\s+/)) { // a name is a few words; never scan the whole text
    const word = w.replace(/[,;|]+$/, '');
    if (!word || NAME_STOP.test(word) || /@/.test(word) || /^\d/.test(word) || !/^[A-Za-z][A-Za-z.'&-]*$/.test(word)) break;
    words.push(word);
    if (words.length === 5 || /[,;|]$/.test(w)) break;
  }
  const name = words.join(' ');
  return name.length >= 3 && /^[A-Z]/.test(name) ? name : undefined;
}

function nameAfter(label: RegExp, text: string): string | undefined {
  let tries = 0;
  for (const m of text.matchAll(label)) {
    const name = nameAt(text.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 96));
    if (name) return name;
    if (++tries >= 40) break; // bounded work on hostile input
  }
  return undefined;
}

function extractPayeeName(text: string): string | undefined {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  // "Paid to" / "To:" on its own line → the name is on the next line (Google Pay, PhonePe layouts).
  for (let i = 0; i < lines.length - 1; i++) {
    if (/^(?:paid (?:successfully )?to|to|sent to|beneficiary(?: name)?)\s*:?$/i.test(lines[i] ?? '')) {
      const next = nameAt(lines[i + 1] ?? '');
      if (next) return next;
    }
  }
  const flat = oneLine(text);
  return nameAfter(/\b(?:paid (?:successfully )?to|trf to|sent to|transferred to|beneficiary(?: name)?|to)\s*:?\s*/gi, flat)
    ?? flat.match(/;\s*([A-Za-z][A-Za-z0-9 .&']{1,40}?)\s+credited\b/)?.[1];
}

// ───────────────────────────── time ─────────────────────────────

const MON = 'jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec';
const RE_WHEN = [
  new RegExp(`\\b(\\d{1,2}:\\d{2}\\s*(?:am|pm)\\s+on\\s+\\d{1,2}\\s+(?:${MON})[a-z]*,?\\s+\\d{4})`, 'i'), // 03:30 pm on 18 Oct 2026
  new RegExp(`\\b(\\d{1,2}[\\s-]?(?:${MON})[a-z]*[\\s,-]*\\d{2,4}(?:,?\\s+\\d{1,2}:\\d{2}(?::\\d{2})?\\s*(?:am|pm)?)?)`, 'i'), // 18 Oct 2026, 3:42 pm · 18Oct26 · 18-Oct-26
  /\b(\d{4}-\d{2}-\d{2}(?:[ T:]\d{2}:\d{2}(?::\d{2})?)?)/, // 2026-10-18:15:42:10
  /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)?)/i, // 18/10/26 · 18-10-2026 15:42:10
];

function extractWhen(t: string): string | undefined {
  for (const re of RE_WHEN) {
    const m = t.match(re)?.[1];
    if (m) return m.trim();
  }
  return undefined;
}

const IST_OFFSET_MIN = 330;

/** Parse a receipt/SMS time as India time. Day-first dates. Returns null if it can't be trusted. */
export function parseWhen(when: string | undefined, now: Date = new Date()): { at: Date; hasTime: boolean } | null {
  if (!when) return null;
  const s = when.toLowerCase();
  let y: number, mo: number, d: number;
  const named = s.match(new RegExp(`(\\d{1,2})[\\s-]?(${MON})[a-z]*[\\s,-]*(\\d{2,4})`));
  const iso = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  const numeric = s.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  const g = (m: RegExpMatchArray, i: number) => m[i] ?? '';
  if (named) { d = +g(named, 1); mo = MON.split('|').indexOf(g(named, 2)); y = +g(named, 3); }
  else if (iso) { y = +g(iso, 1); mo = +g(iso, 2) - 1; d = +g(iso, 3); }
  else if (numeric) { d = +g(numeric, 1); mo = +g(numeric, 2) - 1; y = +g(numeric, 3); }
  else return null;
  if (y < 100) y += 2000;
  const rest = s.replace(g((named ?? iso ?? numeric) as RegExpMatchArray, 0), ' ');
  const tm = rest.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?/);
  let h = 0, mi = 0;
  if (tm) {
    h = +g(tm, 1); mi = +g(tm, 2);
    if (tm[3] === 'pm' && h < 12) h += 12;
    if (tm[3] === 'am' && h === 12) h = 0;
  }
  if (mo < 0 || mo > 11 || d < 1 || d > 31 || h > 23 || mi > 59) return null;
  const at = new Date(Date.UTC(y, mo, d, h, mi) - IST_OFFSET_MIN * 60_000);
  if (new Date(Date.UTC(y, mo, d)).getUTCMonth() !== mo) return null; // 30 Feb and friends
  if (at.getTime() > now.getTime() + 10 * 60_000) return null; // in the future → misread
  return { at, hasTime: Boolean(tm) };
}

// ───────────────────────────── main extraction ─────────────────────────────

/** Pull what a 1930 complaint needs out of OCR'd receipt text or a bank SMS. */
export function extractTxn(input: string): Txn {
  const text = clean(input);
  const flat = oneLine(text);
  const warnings: string[] = [];
  const payeeVpa = extractVpa(text, warnings);
  const noVpa = flat.replace(RE_VPA, ' '); // a payee handle like x@paytm or x@sbi says nothing about *your* app or bank
  const app = firstOf(APPS, noVpa);
  const bankCtx = noVpa.match(/\b(?:from|debited from|a\/c|acct)\b[^.]{0,40}/i)?.[0] ?? '';
  // Explicit UPI evidence first; then explicit card wording (a merchant called "AMAZONPAY" is not the Amazon Pay app).
  const channel: Channel = payeeVpa || /\bupi\b/i.test(flat) ? 'upi'
    : /\b(?:credit card|debit card|card ending|card no|card xx)\b/i.test(flat) ? 'card'
    : /\b(?:neft|imps|rtgs|net ?banking)\b/i.test(flat) ? 'netbanking'
    : app ? 'upi'
    : /\bcard\b/i.test(flat) ? 'card'
    : /\bwallet\b/i.test(flat) ? 'wallet' : 'unknown';
  const txn: Txn = {
    amountInr: extractAmount(text, warnings),
    utr: extractUtr(flat, warnings),
    appTxnId: APP_TXN_LABELS.map((re) => flat.match(re)?.[1]).find((v) => v && !/^\d{12}$/.test(v)),
    payeeVpa,
    payeeName: extractPayeeName(text),
    payeeAccountLast4: flat.match(/\bto\s+a\/c\s*(?:no\.?)?\s*[xX*•]+(\d{4})\b/i)?.[1],
    payerLast4: flat.match(/\bending\s+(?:in\s+)?[xX*•]*(\d{4})\b/i)?.[1]
      ?? flat.match(/\b(?:a\/c|acct|account|from)\b[^\d]{0,40}?[xX*•]{1,12}\s?(\d{4})\b/i)?.[1],
    app: channel === 'card' ? undefined : app,
    bank: firstOf(BANKS, bankCtx) ?? firstOf(BANKS, noVpa),
    when: extractWhen(flat),
    channel,
    warnings,
  };
  if (txn.payeeAccountLast4 && txn.payerLast4 === txn.payeeAccountLast4) txn.payerLast4 = undefined;
  return txn;
}

/** A 1930-initiated complaint gets a 14-digit acknowledgement starting with 3 by SMS (NCRP-CFCFRMS SOP, Jan 2026). */
export function extractAck(input: string): { ack: string; from1930: boolean } | null {
  const t = oneLine(clean(input));
  const labelled = t.match(/\back(?:nowledge?ment)?\.?\s*(?:no\.?|number)?\s*(?:is)?\s*[:#-]?\s*(\d{14})\b/i)?.[1];
  const ack = labelled ?? t.match(/\b(3\d{13})\b/)?.[1];
  return ack ? { ack, from1930: ack.startsWith('3') } : null;
}

// ───────────────────────────── categories & the pay-again brake ─────────────────────────────

export const CATEGORIES = {
  'job-task': 'Online job / task fraud',
  investment: 'Investment / trading fraud',
  'upi-fraud': 'UPI fraud (collect request, QR, fake refund)',
  'kyc-bank': 'Fake bank / KYC / customer-care fraud',
  'digital-arrest': '"Digital arrest" / impersonation of officials',
  sextortion: 'Sextortion / blackmail',
  other: 'Other online financial fraud',
} as const;
export type Category = keyof typeof CATEGORIES;

const CATEGORY_WORDS: Record<Exclude<Category, 'other'>, string[]> = {
  'job-task': ['task', 'part time', 'part-time', 'work from home', 'like videos', 'review', 'rating', 'prepaid', 'commission', 'internship', 'registration fee', 'recruiter', 'hr', 'job', 'salary', 'earn'],
  investment: ['trading', 'stock', 'ipo', 'crypto', 'usdt', 'returns', 'profit', 'investment', 'share market', 'demat', 'vip group', 'institutional'],
  'upi-fraud': ['collect request', 'qr code', 'scan', 'refund', 'sent by mistake', 'cashback', 'olx'],
  'kyc-bank': ['kyc', 'pan update', 'account blocked', 'card blocked', 'reward points', 'electricity', 'customer care', 'apk', 'sim block', 'anydesk', 'screen share'],
  'digital-arrest': ['cbi', 'ed officer', 'police', 'customs', 'narcotics', 'fedex', 'parcel', 'arrest', 'warrant', 'money laundering', 'trai', 'court'],
  sextortion: ['nude', 'morphed', 'leak your video', 'blackmail', 'intimate', 'video call recording'],
};

/** Suggest a category from the story, chat text and payee details. The person always confirms. */
export function suggestCategory(...texts: (string | undefined)[]): { category: Category; matched: string[] } {
  const hay = ` ${texts.filter(Boolean).join(' ').toLowerCase().replace(/[._@-]+/g, ' ')} `;
  let best: { category: Category; matched: string[] } = { category: 'other', matched: [] };
  for (const [cat, words] of Object.entries(CATEGORY_WORDS) as [Exclude<Category, 'other'>, string[]][]) {
    const matched = words.filter((w) => hay.includes(` ${w} `) || hay.includes(` ${w}s `));
    if (matched.length > best.matched.length) best = { category: cat, matched };
  }
  return best;
}

const BRAKE_PATTERNS: [RegExp, string][] = [
  [/\b(?:pay|deposit|transfer|send)\b[^.]{0,40}\b(?:to|before you can|for)\b[^.]{0,20}\b(?:withdraw|unlock|release|activate|claim|recover)/i, 'asks for money before you can withdraw, unlock or recover'],
  [/\b(?:withdrawal|processing|unlock|release|activation|clearance|verification|recovery) (?:fee|charge|tax)\b/i, 'a fee to get your own money out'],
  [/\b(?:gst|income tax|tds|tax) (?:on|for) (?:your )?(?:profit|earning|commission|winning)s?\b/i, 'tax demanded on fake earnings'],
  [/\b(?:account|wallet|funds?) (?:is |are |has been |have been )?(?:frozen|locked|on hold)\b.{0,60}?\b(?:pay|deposit)/i, '"frozen account" that needs a payment'],
  [/\b(?:upgrade|vip|level)\b.{0,30}?\b(?:pay|deposit|recharg)/i, 'pay to upgrade a level'],
  [/\b(?:complete|finish) (?:\d+ )?(?:more )?(?:tasks?|orders?)\b.{0,30}?\b(?:pay|deposit|recharg)/i, 'pay to finish the next task'],
  [/\b(?:negative balance|credit score (?:is )?low)\b/i, 'a made-up negative balance or score'],
];

/** "Before you pay again": spots the repeat-deposit hook of task and investment scams. */
export function payAgainBrake(input: string): { stop: boolean; reasons: string[]; truth: string } {
  const t = oneLine(clean(input));
  const reasons = BRAKE_PATTERNS.filter(([re]) => re.test(t)).map(([, why]) => why);
  return {
    stop: reasons.length > 0,
    reasons,
    truth: 'Real jobs and real investments never ask you to pay to get your own money out. Paying again only adds to the loss — report what you have already paid.',
  };
}

// ───────────────────────────── outputs ─────────────────────────────

export interface ReportOptions {
  name?: string;
  /** Helper mode: someone filing on behalf of the victim (allowed by the SOP). */
  onBehalfOf?: { name: string; relation: string };
  story?: string;
  /** The person did not make or approve the payment (card misuse, account takeover). */
  unauthorised?: boolean;
  /** A screen-sharing or unknown APK app was installed during the scam. */
  remoteAccessApp?: boolean;
  suspect?: { phones?: string[]; handles?: string[]; links?: string[] };
}

const inr = (n?: number) => (n === undefined ? '[amount]' : `₹${n.toLocaleString('en-IN')}`);
const list = (t: Txn | Txn[]) => (Array.isArray(t) ? t : [t]);
const payeeOf = (t: Txn) => t.payeeVpa ? `UPI ID ${t.payeeVpa}${t.payeeName ? ` (${t.payeeName})` : ''}`
  : t.payeeName ?? (t.payeeAccountLast4 ? `account ending ${t.payeeAccountLast4}` : '[who you paid]');

export function total(t: Txn | Txn[]): number | undefined {
  const known = list(t).map((x) => x.amountInr).filter((n): n is number => n !== undefined);
  return known.length ? known.reduce((a, b) => a + b, 0) : undefined;
}

/** What is still missing for a useful complaint — a checklist that never blocks the call to 1930. */
export function missing(t: Txn | Txn[]): string[] {
  const m = new Set<string>();
  list(t).forEach((x, i) => {
    const tag = list(t).length > 1 ? ` (payment ${i + 1})` : '';
    if (!x.amountInr) m.add(`Amount paid${tag}`);
    if (!x.utr) m.add(`UTR / transaction reference${tag} — in your payment app → transaction details`);
    if (!x.payeeVpa && !x.payeeName && !x.payeeAccountLast4) m.add(`Who you paid${tag} — UPI ID, account number or name`);
    if (!x.when) m.add(`Date and time${tag}`);
  });
  return [...m];
}

/** A calm script to read on the 1930 call. People freeze; a script helps. */
export function callScript(t: Txn | Txn[], cat: Category, o: ReportOptions = {}): string[] {
  const txns = list(t);
  const one: Partial<Txn> = txns[0] ?? {};
  const me = o.name ?? '[your name]';
  const lines = [
    o.onBehalfOf
      ? `Hello, I want to report an online financial fraud on behalf of my ${o.onBehalfOf.relation}, ${o.onBehalfOf.name}. My name is ${me}.`
      : `Hello, I want to report an online financial fraud. My name is ${me}.`,
    `It is a ${CATEGORIES[cat]} case. ${txns.length > 1 ? `There were ${txns.length} payments, ${inr(total(txns))} in total.` : `I paid ${inr(one.amountInr)}${one.when ? ` on ${one.when}` : ''}${one.app ? ` using ${one.app}` : ''}.`}`,
  ];
  txns.forEach((x, i) => {
    const head = txns.length > 1 ? `Payment ${i + 1}: ${inr(x.amountInr)}${x.when ? ` on ${x.when}` : ''}. ` : '';
    lines.push(`${head}UTR ${x.utr ?? '[UTR]'}, paid to ${payeeOf(x)}${x.bank ? `, from ${x.bank}${x.payerLast4 ? ` account ending ${x.payerLast4}` : ''}` : ''}.`);
  });
  lines.push('Please register the complaint. I will note the acknowledgement number from the SMS.');
  return lines;
}

/** Draft text for the incident description on cybercrime.gov.in. The person reviews and edits it. */
export function complaintDraft(t: Txn | Txn[], cat: Category, o: ReportOptions = {}): string {
  const txns = list(t);
  const rows = txns.map((x, i) =>
    `${i + 1}. ${x.when ?? '[date and time]'} — ${inr(x.amountInr)} — UTR ${x.utr ?? '[UTR]'} — to ${payeeOf(x)}${x.app ? ` — via ${x.app}` : ''}${x.bank ? ` — from ${x.bank}${x.payerLast4 ? ` a/c ending ${x.payerLast4}` : ''}` : ''}`);
  const s = o.suspect;
  const suspect = [s?.phones?.length ? `Phone numbers: ${s.phones.join(', ')}` : '', s?.handles?.length ? `Accounts/handles: ${s.handles.join(', ')}` : '', s?.links?.length ? `Links: ${s.links.join(', ')}` : ''].filter(Boolean);
  return [
    `Category: ${CATEGORIES[cat]}.`,
    o.onBehalfOf ? `Filed by ${o.name ?? '[your name]'} on behalf of ${o.onBehalfOf.name} (${o.onBehalfOf.relation}).` : '',
    `Transactions (${txns.length}, total ${inr(total(txns))}):`,
    ...rows,
    `What happened: ${o.story?.trim() || '[in your own words: who contacted you, on which app or number, what they said, why you paid]'}`,
    suspect.length ? `Suspect details: ${suspect.join('; ')}.` : 'Suspect details: [phone numbers, WhatsApp/Telegram handles, links, UPI IDs they used]',
    'I request that the reported amounts be put on hold in the beneficiary accounts. Screenshots of the conversation and payments are attached.',
  ].filter(Boolean).join('\n');
}

/** Ordered steps. Call first; everything else can happen while waiting. */
export function steps(t: Txn | Txn[], cat: Category, o: ReportOptions = {}): string[] {
  const txns = list(t);
  const has = (c: Channel) => txns.some((x) => x.channel === c);
  const s = [
    'Call 1930 now. Keep the SMS with your 14-digit acknowledgement number (it starts with 3).',
    'Use that acknowledgement number to complete the complaint on cybercrime.gov.in, as the SMS says. Paste the draft and add every payment.',
    `Call your bank's fraud line${txns[0]?.bank ? ` (${txns[0].bank})` : ''} using the number in your bank app or on your card — never a number from a web search.`,
  ];
  if (o.unauthorised) s.push('Report the unauthorised debit to your bank in writing too. RBI rules limit your liability when you report within 3 working days.');
  if (has('card')) s.push('Block the card in your bank app.');
  if (o.remoteAccessApp) s.push('Uninstall the screen-sharing or unknown app, then change your UPI PIN and net-banking password from a different phone.');
  if (cat === 'job-task' || cat === 'investment') s.push('Do not pay again to "unlock", "withdraw" or "upgrade". That is the same scam asking for more.');
  if (cat === 'digital-arrest' || cat === 'kyc-bank') s.push('End the call. No police, CBI, ED or bank officer asks for money or keeps you on a video call.');
  if (cat === 'sextortion') s.push('Do not pay more. Keep the chats as evidence and report the account on the platform.');
  s.push(
    'Keep every chat, call log, SMS and screenshot. Do not delete anything, even if it feels embarrassing.',
    'Tell one family member now. This is not your fault, and you should not handle it alone.',
    'Anyone who offers to "recover" your money for a fee is running a second scam.',
    'Later: report the scammer\'s number or link on Sanchar Saathi (Chakshu) so it can be blocked for others.',
  );
  return s;
}

/** Minutes since the payment, with urgency but no panic. */
export function clock(paidAt: Date, now: Date): { minutes: number; message: string } {
  const minutes = Math.max(0, Math.floor((now.getTime() - paidAt.getTime()) / 60_000));
  const message = minutes < 60
    ? `${minutes} min since payment — reporting now gives the best chance of a hold on the money.`
    : `${Math.floor(minutes / 60)} h ${minutes % 60} min since payment — still report now; late reports can still help.`;
  return { minutes, message };
}

/** Earliest parsed payment time across a case, for the clock. Null → ask the person when they paid. */
export function firstPaidAt(t: Txn | Txn[], now: Date = new Date()): Date | null {
  const times = list(t).map((x) => parseWhen(x.when, now)).filter((p): p is { at: Date; hasTime: boolean } => !!p && p.hasTime);
  return times.length ? new Date(Math.min(...times.map((p) => p.at.getTime()))) : null;
}

/** "Please call me" for a trusted person. Breaks the isolation scammers rely on. */
export function familyAlert(t: Txn | Txn[], cat: Category): string {
  return `I think I've been cheated (${CATEGORIES[cat]}). I paid ${inr(total(t))}. I'm calling 1930 now. Please call me.`;
}

// ───────────────────────────── evidence manifest ─────────────────────────────

export interface EvidenceItem { name: string; bytes: number; sha256: string }

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

/**
 * SHA-256 fingerprints of the screenshots the person attaches, computed on the device (Web Crypto).
 * A fingerprint shows a file was not changed after this moment. It is an integrity aid, not a legal certificate.
 */
export async function evidenceManifest(files: { name: string; data: Uint8Array<ArrayBuffer> }[], now: Date = new Date()) {
  const items: EvidenceItem[] = [];
  for (const f of files) items.push({ name: f.name, bytes: f.data.byteLength, sha256: hex(await crypto.subtle.digest('SHA-256', f.data)) });
  return {
    createdAt: now.toISOString(),
    items,
    note: 'Fingerprints computed on this phone. They help show the files were not edited later; they are not a legal certificate.',
  };
}
