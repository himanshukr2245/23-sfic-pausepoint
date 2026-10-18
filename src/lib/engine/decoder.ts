// src/engine.ts — PausePoint 2.0 (The Manipulation Decoder)
// Pure TypeScript, deterministic, explainable, zero external network dependency.
// Multi-layered classifier: 12 tactics + 15 Indian scam playbooks + 14-point URL decomposition.

export type TacticId =
  | 'urgency'
  | 'fear'
  | 'authority'
  | 'reward'
  | 'secrecy'
  | 'credentials'
  | 'remote'
  | 'payment'
  | 'familiarity'
  | 'curiosity'
  | 'scarcity'
  | 'link_bait';

export interface Tactic {
  id: TacticId;
  label: string;
  lever: string;
  weight: number;
  re: RegExp;
}

// English + common Hinglish. Overlaps resolved by weight.
export const TACTICS: Tactic[] = [
  {
    id: 'urgency',
    label: 'Urgency',
    lever: 'Rushes you so you skip thinking and act on impulse',
    weight: 12,
    re: /\b(urgent(?:ly)?|immediately|right now|act now|asap|within \d+\s*(?:hours?|hrs?|minutes?|mins?)|today only|last (?:chance|warning|reminder|date)|expires? (?:today|tonight|soon)|tonight|turant|abhi|jaldi|bina deri)\b/gi,
  },
  {
    id: 'fear',
    label: 'Fear / Threat',
    lever: 'Scares you into obeying through penalties, arrest, or disconnection',
    weight: 15,
    re: /\b(blocked|suspended|deactivated|disconnected|disconnection|legal action|arrest(?:ed)?|warrant|penalty|fine of|FIR|seized|frozen|money laundering|drugs?|illegal|band ho jayega|kat jayegi|police karyawahi|giraftar)\b/gi,
  },
  {
    id: 'authority',
    label: 'Fake Authority',
    lever: 'Borrows the power of a government body, police, or bank to demand compliance',
    weight: 12,
    re: /\b(RBI|SEBI|CBI|ED officer|customs|income ?tax|TRAI|DOT|police|cyber ?cell|crime branch|narcotics|NCB|court|judge|UIDAI|government|bank manager|officer|electricity (?:board|department)|parivahan|traffic police)\b/gi,
  },
  {
    id: 'reward',
    label: 'Greed / Reward',
    lever: 'Dangles unearned cash, lottery, or windfall profits to cloud judgment',
    weight: 12,
    re: /\b(won|winner|lottery|prize|cashback|reward|gift|lucky draw|KBC|refund|bonus|earn (?:rs\.?|₹)?\s?\d[\d,]*|part[- ]time job|work from home|double your|free|guaranteed profit|daily income)\b/gi,
  },
  {
    id: 'secrecy',
    label: 'Secrecy / Isolation',
    lever: 'Cuts you off from family, friends, or advisors who would warn you',
    weight: 15,
    re: /\b(don'?t tell (?:anyone|anybody|your family)|do not (?:tell|inform|share with) (?:anyone|anybody|your family)|keep (?:this )?(?:confidential|secret)|stay on (?:the )?(?:call|video)|don'?t disconnect|kisi ko mat batana|raaz rakhna)\b/gi,
  },
  {
    id: 'credentials',
    label: 'Asks for Secrets',
    lever: 'Wants the master keys to your bank account, email, or identity',
    weight: 20,
    re: /\b(OTP|UPI PIN|PIN|CVV|password|passcode|login details|card number|netbanking (?:id|password)|verification code|expiry date)\b/gi,
  },
  {
    id: 'remote',
    label: 'Remote Control / APK Trojan',
    lever: 'Attempts to gain screen control or install surveillance software on your device',
    weight: 20,
    re: /\b(AnyDesk|TeamViewer|QuickSupport|RustDesk|screen ?share|install (?:this|the) app|download (?:this|the) app|\S+\.apk)\b/gi,
  },
  {
    id: 'payment',
    label: 'Money Request',
    lever: 'The ultimate extraction: pressuring you to transfer funds or scan a QR',
    weight: 10,
    re: /\b(pay(?:ment)?|transfer|send (?:money|rs|₹)|scan (?:the |this )?QR|processing fee|registration fee|security deposit|clearance fee|UPI|bhejo|jama karo)\b/gi,
  },
  {
    id: 'familiarity',
    label: 'Fake Familiarity',
    lever: 'Pretends to be a loved one, family member, or close contact in distress',
    weight: 12,
    re: /\b(hi (?:mom|mum|maa|dad|papa)|this is my new number|my (?:old )?phone (?:is )?(?:lost|broken|stolen)|it'?s me|beta|bhai)\b/gi,
  },
  {
    id: 'curiosity',
    label: 'Curiosity / Sextortion Bait',
    lever: 'Tricks you into clicking through shock, leaked photos, or scandal bait',
    weight: 10,
    re: /\b(you won'?t believe|see who|your (?:photo|video) (?:is )?(?:viral|leaked)|private video|check this out|is this you|morphed clip|viral video)\b/gi,
  },
  {
    id: 'scarcity',
    label: 'Scarcity / Social Proof',
    lever: 'Manufactures fear of missing out with limited slots or fake testimonials',
    weight: 6,
    re: /\b(only \d+ (?:left|seats|slots)|limited (?:offer|slots|time)|thousands (?:have|already)|everyone is joining|hurry up)\b/gi,
  },
  {
    id: 'link_bait',
    label: 'Click / Visit Bait',
    lever: 'Directs you to open an external web address or portal',
    weight: 8,
    re: /\b(click (?:here|on|this)|open (?:this|the) link|visit (?:https?:\/\/|\S+\.\S+|this)|tap (?:here|on)|link given below|given link)\b/gi,
  },
];

export interface Playbook {
  id: string;
  name: string;
  truth: string;
  test: (t: string, found: Set<TacticId>) => boolean;
  weight: number;
}

export const PLAYBOOKS: Playbook[] = [
  {
    id: 'digital-arrest',
    name: '"Digital arrest" scam',
    weight: 35,
    truth: 'No Indian police, CBI, ED or customs officer arrests anyone over a video call or asks for money to "clear" a case.',
    test: (t, f) =>
      f.has('authority') &&
      /\b(video call|skype|whatsapp call|parcel|money laundering|drugs|arrest|warrant)\b/i.test(t),
  },
  {
    id: 'kyc',
    name: 'KYC / account-block scam',
    weight: 25,
    truth: "Banks do not block accounts through SMS links. Update KYC only in the bank's own app or at the branch.",
    test: (t) =>
      /\b(kyc|pan|aadhaar)\b/i.test(t) &&
      /\b(update|expired?|blocked|suspended|link)\b/i.test(t),
  },
  {
    id: 'upi-receive',
    name: '"Enter PIN to receive money" trap',
    weight: 35,
    truth: 'You NEVER need your UPI PIN or a QR scan to RECEIVE money. A PIN only ever sends money out.',
    test: (t) =>
      /\b(receive|get|refund|cashback|credited|prize)\b/i.test(t) &&
      /\b(UPI PIN|enter (?:your )?pin|scan (?:the |this )?QR|approve (?:the )?request)\b/i.test(t),
  },
  {
    id: 'otp',
    name: 'OTP request scam',
    weight: 30,
    truth: 'No bank, delivery company or government office will ever ask you to share an OTP.',
    test: (t) =>
      [...t.matchAll(/\b(share|send|tell|forward|give)\b[^.]{0,40}\b(OTP|code)\b/gi)].some(
        (m) =>
          !/\b(not|never|don'?t)\s+$/i.test(t.slice(Math.max(0, m.index! - 12), m.index!))
      ),
  },
  {
    id: 'electricity',
    name: 'Electricity disconnection scam',
    weight: 25,
    truth: "Power companies don't text personal mobile numbers threatening disconnection 'tonight'. Check bills in official utility apps.",
    test: (t) =>
      /\b(electricity|bijli|power)\b/i.test(t) && /\b(disconnect\w*|cut|kat)\b/i.test(t),
  },
  {
    id: 'task-job',
    name: 'Task / part-time job scam',
    weight: 25,
    truth: "Real companies don't pay you to like YouTube videos or write Google reviews, and never ask for a 'prepaid deposit' to unlock earnings.",
    test: (t) =>
      /\b(part[- ]time|work from home|daily income|task)\b/i.test(t) &&
      /\b(earn|income|salary|like|review|telegram|prepaid)\b/i.test(t),
  },
  {
    id: 'parcel',
    name: 'Courier / parcel customs scam',
    weight: 20,
    truth: "Couriers don't hold parcels for 'illegal items' over SMS, and don't demand fees through random links or UPI.",
    test: (t) =>
      /\b(parcel|courier|fedex|dhl|india post|shipment|delivery)\b/i.test(t) &&
      /\b(held|failed|illegal|customs|drugs|address (?:update|incomplete)|redeliver)\b/i.test(t),
  },
  {
    id: 'new-number',
    name: '"New number" family impersonation',
    weight: 25,
    truth: 'Before sending money to a "new number", call the person on their OLD number or ask a question only they would know.',
    test: (_t, f) => f.has('familiarity') && (f.has('payment') || f.has('urgency')),
  },
  {
    id: 'apk',
    name: 'Malicious APK app link',
    weight: 30,
    truth: 'Apps should come only from the Google Play Store / Apple App Store. An .apk sent over chat can take over your phone and read your OTPs.',
    test: (t, f) => /\.apk\b/i.test(t) || f.has('remote'),
  },
  {
    id: 'trai-sim',
    name: 'TRAI / SIM deactivation scam',
    weight: 30,
    truth: 'TRAI or telecom operators never call or SMS threatening mobile disconnection within hours. Official SIM verification is done only at authorized telecom centers.',
    test: (t) =>
      /\b(trai|sim card|mobile number|telecom|department of telecom|dot)\b/i.test(t) &&
      /\b(block|suspend|deactivat\w*|disconnect\w*|within \d+ hours?)\b/i.test(t),
  },
  {
    id: 'sextortion',
    name: 'Video call extortion / Sextortion',
    weight: 35,
    truth: 'Blackmailers use screen-recorded video clips. Do not panic, never send money—they will demand more. Block immediately and dial 1930.',
    test: (t) =>
      /\b(video|clip|recording|morphed|private)\b/i.test(t) &&
      /\b(viral|youtube|facebook|leak|relatives|police|reputation)\b/i.test(t),
  },
  {
    id: 'pan-aadhaar',
    name: 'PAN-Aadhaar linking penalty scam',
    weight: 25,
    truth: 'PAN-Aadhaar linking status can only be verified on incometax.gov.in. No third party or SMS link has the legal authority to charge penalties.',
    test: (t) =>
      /\b(pan|aadhaar)\b/i.test(t) &&
      /\b(link|fine of|penalty|rs\.?\s?1000|inactive|inoperative)\b/i.test(t),
  },
  {
    id: 'cc-points',
    name: 'Credit card reward points expiry scam',
    weight: 25,
    truth: 'Banks never ask you to redeem credit card reward points by entering card CVV or netbanking passwords on third-party links.',
    test: (t) =>
      /\b(credit card|debit card|reward points?|points expire)\b/i.test(t) &&
      /\b(redeem|cash|worth rs|convert)\b/i.test(t),
  },
  {
    id: 'stock-tips',
    name: 'Fake WhatsApp stock / IPO scam',
    weight: 30,
    truth: 'SEBI-registered brokers never operate institutional IPO allocations or guaranteed 500% profit groups on WhatsApp or Telegram.',
    test: (t) =>
      /\b(stock|shares|ipo|trading|crypto|forex)\b/i.test(t) &&
      /\b(guaranteed|profit|vip group|telegram|allotment|double)\b/i.test(t),
  },
];

// ── Link Inspection & Heuristic Threat Intel ─────────────────────────────────

const OFFICIAL = [
  'sbi.co.in',
  'onlinesbi.sbi',
  'hdfcbank.com',
  'icicibank.com',
  'axisbank.com',
  'kotak.com',
  'pnbindia.in',
  'bankofbaroda.in',
  'paytm.com',
  'phonepe.com',
  'npci.org.in',
  'amazon.in',
  'flipkart.com',
  'google.com',
  'uidai.gov.in',
  'incometax.gov.in',
  'india.gov.in',
  'cybercrime.gov.in',
  'sancharsaathi.gov.in',
  'indiapost.gov.in',
  'irctc.co.in',
  'jainuniversity.ac.in',
  'whatsapp.com',
  'instagram.com',
  'microsoft.com',
  'apple.com',
  'youtube.com',
  'github.com',
  'wikipedia.org',
];

const BRANDS = [
  'sbi',
  'hdfc',
  'icici',
  'axis',
  'kotak',
  'pnb',
  'bob',
  'paytm',
  'phonepe',
  'gpay',
  'amazon',
  'flipkart',
  'uidai',
  'aadhaar',
  'incometax',
  'irctc',
  'indiapost',
  'npci',
  'whatsapp',
  'instagram',
  'trai',
  'parivahan',
  'challan',
];

const SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  't.co',
  'is.gd',
  'cutt.ly',
  'rb.gy',
  'shorturl.at',
  'tiny.cc',
  'ow.ly',
  'rebrand.ly',
  'surl.li',
];

const RISKY_TLDS = [
  'xyz',
  'top',
  'click',
  'live',
  'buzz',
  'icu',
  'rest',
  'sbs',
  'cfd',
  'monster',
  'shop',
  'online',
  'site',
  'info',
  'tk',
  'ml',
  'ga',
  'cf',
  'gq',
  'zip',
  'mov',
  'cc',
  'bid',
  'work',
  'date',
];

const TWO_LEVEL = [
  'co.in',
  'gov.in',
  'org.in',
  'ac.in',
  'net.in',
  'nic.in',
  'res.in',
  'edu.in',
  'co.uk',
  'com.au',
];

// Explicit keywords that immediately indicate malicious/fraud intent in a domain
export const DANGEROUS_DOMAIN_KEYWORDS = [
  'fraud',
  'scam',
  'phish',
  'fake',
  'hack',
  'steal',
  'cheat',
  'spoof',
  'malware',
  'trojan',
  'exploit',
  'darkweb',
  'blackhat',
];

// Adult, NSFW & Sextortion gateway keywords (restricted under DoT IT Act Sec 69A in India)
export const ADULT_DOMAIN_KEYWORDS = [
  'porn',
  'pornhub',
  'xvideos',
  'xnxx',
  'xhamster',
  'redtube',
  'onlyfans',
  'chaturbate',
  'camgirl',
  'stripchat',
  'nude',
  'erotic',
  'sexvideo',
];

// Illegal Online Betting, Gambling & Color Prediction platforms (prohibited in India)
export const GAMBLING_DOMAIN_KEYWORDS = [
  'mahadev',
  '1xbet',
  'bet365',
  'parimatch',
  'colorprediction',
  'aviator',
  'winzo',
  'rummy',
  'teenpatti',
  'casino',
  'betting',
  'satta',
  'matka',
];

// Keywords commonly used in unverified phishing domains to fool victims
export const SUSPICIOUS_DOMAIN_KEYWORDS = [
  'kyc',
  'verify',
  'verification',
  'secure',
  'security',
  'login',
  'signin',
  'account',
  'banking',
  'bank',
  'portal',
  'update',
  'claim',
  'reward',
  'cashback',
  'lottery',
  'prize',
  'gift',
  'bonus',
  'crypto',
  'wallet',
  'airdrop',
  'free',
  'bill',
  'challan',
  'customs',
  'refund',
  'support',
  'helpdesk',
  'service',
  'alert',
  'recharge',
  'telecom',
  'trai',
  'rbi',
  'sebi',
];

export function registrable(host: string): string {
  const parts = host.toLowerCase().replace(/\.$/, '').split('.');
  const last2 = parts.slice(-2).join('.');
  return TWO_LEVEL.includes(last2) ? parts.slice(-3).join('.') : last2;
}

function lev(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return d[a.length][b.length];
}

/** Computes Shannon entropy of a string to detect randomly generated domain names */
export function domainEntropy(str: string): number {
  const clean = str.replace(/[^a-z0-9]/gi, '');
  if (clean.length < 5) return 0;
  const counts: Record<string, number> = {};
  for (const c of clean) counts[c] = (counts[c] || 0) + 1;
  let ent = 0;
  for (const c in counts) {
    const p = counts[c] / clean.length;
    ent -= p * Math.log2(p);
  }
  return ent;
}

export interface LinkFlag {
  flag: string;
  why: string;
  weight: number;
}

export interface LinkReport {
  url: string;
  host: string;
  domain: string;
  official: boolean;
  flags: LinkFlag[];
  risk: number;
}

export function analyzeLink(raw: string): LinkReport {
  const withScheme = /^[a-z]+:\/\//i.test(raw) ? raw : `http://${raw}`;
  let u: URL;
  try {
    u = new URL(withScheme);
  } catch {
    return {
      url: raw,
      host: '',
      domain: '',
      official: false,
      flags: [{ flag: 'unparseable', why: 'Not a valid web address', weight: 20 }],
      risk: 20,
    };
  }

  const host = u.hostname.toLowerCase();
  const domain = registrable(host);
  const official = OFFICIAL.includes(domain);
  const flags: LinkFlag[] = [];
  const f = (flag: string, why: string, weight: number) => flags.push({ flag, why, weight });

  // 1. Dangerous Explicit Keywords in host or path (e.g. fraud.com)
  const dangerWord = DANGEROUS_DOMAIN_KEYWORDS.find(
    (w) => host.includes(w) || u.pathname.toLowerCase().includes(w)
  );
  if (dangerWord) {
    f(
      'dangerous-keyword',
      `Web address explicitly contains malicious/fraud keyword: "${dangerWord}"`,
      70
    );
  }

  // 2. Suspicious Banking / Credential / Bait Keywords on unverified domains
  if (!official) {
    const suspWord = SUSPICIOUS_DOMAIN_KEYWORDS.find(
      (w) => host.includes(w) || host.split('.')[0].includes(w)
    );
    if (suspWord) {
      f(
        'suspicious-domain-keyword',
        `Unverified domain contains credential/financial bait keyword: "${suspWord}"`,
        35
      );
    }

    // Adult / Explicit / Sextortion gateway detection
    const adultWord = ADULT_DOMAIN_KEYWORDS.find(
      (w) => host.includes(w) || u.pathname.toLowerCase().includes(w)
    );
    if (adultWord) {
      f(
        'adult-content',
        `Contains adult/explicit keyword "${adultWord}" — high correlation with video call extortion, sextortion blackmail, and restricted under DoT IT Act Sec 69A in India`,
        45
      );
    }

    // Illegal Online Betting / Gambling platforms
    const betWord = GAMBLING_DOMAIN_KEYWORDS.find(
      (w) => host.includes(w) || u.pathname.toLowerCase().includes(w)
    );
    if (betWord) {
      f(
        'illegal-gambling',
        `Online betting/gambling vector ("${betWord}") — prohibited under Public Gambling Act & Section 69A IT Act; frequent vehicle for deposit freeze frauds`,
        40
      );
    }
  }

  // 3. User Credentials in URL (@ trick)
  if (u.username || /@/.test(raw.split('/')[2] ?? '')) {
    f('at-sign', 'Contains "@" — the real destination is what comes AFTER it', 35);
  }

  // 4. Raw IP address instead of domain name
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    f('ip-address', 'Uses a raw IP address instead of a domain name', 35);
  }

  // 5. Punycode (internationalized look-alike letters)
  if (host.split('.').some((l) => l.startsWith('xn--'))) {
    f('punycode', 'Uses look-alike international letters (punycode deceptive homograph)', 40);
  }

  // 6. Shortener hiding destination
  if (SHORTENERS.includes(domain)) {
    f('shortener', 'Shortened link hides the real destination — expand before trusting', 15);
  }

  // 7. High-Risk Scam TLDs
  const tld = host.split('.').pop() ?? '';
  if (!official && RISKY_TLDS.includes(tld)) {
    f('risky-tld', `Ends in ".${tld}", commonly used by cheap temporary scam sites`, 20);
  }

  // 8. Insecure HTTP
  if (u.protocol === 'http:' && /^https?:\/\//i.test(raw)) {
    f('no-https', 'Not encrypted (http, not https)', 10);
  }

  // 9. Brand Spoofing & Typosquatting
  if (!official) {
    const brand = BRANDS.find((b) => host.includes(b));
    if (brand) {
      f(
        'brand-in-name',
        `Mentions brand "${brand}" but the real domain is "${domain}" — NOT the official site`,
        40
      );
    }

    const label = domain.split('.')[0];
    const near = OFFICIAL.find((o) => {
      const ol = o.split('.')[0];
      return label !== ol && ol.length >= 4 && lev(label, ol) <= 2;
    });
    if (near) {
      f('lookalike', `"${domain}" looks like official "${near}" with letters changed (typosquatting)`, 40);
    }
  }

  // 10. Deep subdomains hiding real domain
  if (host.split('.').length - domain.split('.').length >= 3) {
    f('deep-subdomains', 'Unusually long chain of subdomains hiding true destination', 15);
  }

  // 11. Malicious APK Android Trojan
  if (/\.apk(\?|$)/i.test(u.pathname)) {
    f('apk', 'Downloads an Android executable (.apk) — can take over your phone and intercept OTPs', 50);
  }

  // 12. Bait Login/Verify/Update Paths
  if (!official && /(login|verify|kyc|update|secure|account|otp|reward|claim)/i.test(u.pathname + u.search)) {
    f('bait-path', 'Path prompts you to enter credentials or claim money on unverified server', 15);
  }

  // 13. DGA / Algorithmic High-Entropy Domain Detection
  const firstLabel = host.split('.')[0];
  if (!official && firstLabel.length >= 10 && domainEntropy(firstLabel) > 3.6 && /\d/.test(firstLabel)) {
    f('dga-entropy', 'Unusually random or machine-generated domain name (high entropy)', 25);
  }

  // 14. Unverified Third-Party Registry Notice
  if (!official && flags.length === 0) {
    // If it's an arbitrary unverified domain without explicit threat flags
    f('unverified-domain', `Domain "${domain}" is an unverified third-party address not in certified registries`, 15);
  }

  const calculatedRisk = Math.min(100, flags.reduce((s, x) => s + x.weight, 0));
  return {
    url: raw,
    host,
    domain,
    official,
    flags,
    risk: calculatedRisk,
  };
}

export function extractLinks(text: string): string[] {
  const re =
    /\b(?:https?:\/\/[^\s<>"')]+|www\.[^\s<>"')]+|(?:[a-z0-9-]+\.)+(?:com|in|net|org|xyz|top|click|live|info|ly|co|me|io|app|site|online|shop|apk|sbi|gl|gd|at|cc|bid|biz|club)(?:\/[^\s<>"')]*)?)/gi;
  return [...new Set((text.match(re) ?? []).map((s) => s.replace(/[.,!?;:]+$/, '')))].filter(
    (s) => !/@/.test(s.split('/')[0]) || /^https?:/i.test(s)
  );
}

// ── The Verdict Engine ───────────────────────────────────────────────────────

export interface Highlight {
  start: number;
  end: number;
  text: string;
  tactic: TacticId;
  label: string;
}

export interface Verdict {
  score: number;
  level: 'danger' | 'suspicious' | 'low';
  headline: string;
  tactics: { id: TacticId; label: string; lever: string; examples: string[] }[];
  playbooks: { id: string; name: string; truth: string }[];
  links: LinkReport[];
  highlights: Highlight[];
  verifySteps: string[];
}

export function decode(text: string): Verdict {
  const hits: Highlight[] = [];

  for (const t of TACTICS) {
    for (const m of text.matchAll(t.re)) {
      hits.push({
        start: m.index!,
        end: m.index! + m[0].length,
        text: m[0],
        tactic: t.id,
        label: t.label,
      });
    }
  }

  hits.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const highlights: Highlight[] = [];
  for (const h of hits) {
    if (!highlights.some((k) => h.start < k.end && k.start < h.end)) {
      highlights.push(h);
    }
  }

  const found = new Set(hits.map((h) => h.tactic));
  const tactics = TACTICS.filter((t) => found.has(t.id)).map((t) => ({
    id: t.id,
    label: t.label,
    lever: t.lever,
    examples: [...new Set(hits.filter((h) => h.tactic === t.id).map((h) => h.text))].slice(0, 3),
  }));

  const playbooks = PLAYBOOKS.filter((p) => p.test(text, found));
  const links = extractLinks(text).map(analyzeLink);

  let score = tactics.reduce((s, t) => s + TACTICS.find((x) => x.id === t.id)!.weight, 0);
  score += playbooks.reduce((s, p) => s + p.weight, 0);

  // Link risk directly informs verdict score
  if (links.length > 0) {
    const worstLinkRisk = Math.max(0, ...links.map((l) => l.risk));
    score += worstLinkRisk;
  }

  // Stacked pressure penalty
  if (found.size >= 3) {
    score += 10;
  }

  score = Math.min(100, score);

  // If any link has risk >= 60, escalate to danger
  const hasHighRiskLink = links.some((l) => l.risk >= 60);
  const level: 'danger' | 'suspicious' | 'low' =
    score >= 60 || hasHighRiskLink
      ? 'danger'
      : score >= 30 || links.some((l) => l.risk >= 20)
      ? 'suspicious'
      : 'low';

  let headline: string;
  if (level === 'danger') {
    headline = hasHighRiskLink && playbooks.length === 0
      ? 'STOP. Dangerous or fraudulent web link detected.'
      : 'STOP. This message shows strong signs of a scam.';
  } else if (level === 'suspicious') {
    headline = links.some((l) => !l.official && l.risk > 0)
      ? 'PAUSE. Unverified link with suspicious attributes detected.'
      : 'PAUSE. Verify before you act.';
  } else {
    headline = 'No strong red flags found — still verify anything involving money or codes.';
  }

  const verifySteps = [
    "Don't click links or call numbers given in the message — open the official app or website yourself.",
    ...(playbooks.some((p) => p.id === 'new-number')
      ? ['Call the person on the number you already had saved, or ask something only they would know.']
      : []),
    ...(found.has('credentials') || playbooks.some((p) => p.id === 'otp' || p.id === 'upi-receive')
      ? ['Never share OTP, UPI PIN, CVV or passwords — with anyone, for any reason.']
      : []),
    ...(found.has('secrecy')
      ? ['Tell a family member or friend now. Scammers need you isolated and panicked.']
      : []),
    ...(links.some((l) => l.risk >= 30)
      ? ['Do not visit the destination link; it does not belong to a certified official domain.']
      : []),
    'Lost money? Call 1930 immediately and report at cybercrime.gov.in.',
    'Report the number/message at sancharsaathi.gov.in (Chakshu).',
  ];

  return {
    score,
    level,
    headline,
    tactics,
    playbooks: playbooks.map(({ id, name, truth }) => ({ id, name, truth })),
    links,
    highlights,
    verifySteps,
  };
}
