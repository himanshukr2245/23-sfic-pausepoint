'use client';

// lib/i18n.ts — Bilingual Crisis Dictionary & State Store (HK Universal Library v3).
// English (en) and Hindi (hi) with reactive subscription support and localStorage persistence.
import { useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

export interface TranslationDict {
  // Navigation & General
  appTitle: string;
  appSubtitle: string;
  navReport: string;
  navVerify: string;
  navDecode: string;
  navSeniorMode: string;
  langSwitch: string;
  clientPrivacyBadge: string;

  // Crisis Reporting Flow (/report)
  goldenHourActive: string;
  goldenHourDesc: string;
  uploadScreenshotTitle: string;
  uploadScreenshotSub: string;
  dropFileOrBrowse: string;
  pasteSmsTitle: string;
  pasteSmsPlaceholder: string;
  ocrProcessing: string;
  ocrReady: string;

  // Transaction Fields
  amountPaid: string;
  bankUtr: string;
  whoYouPaid: string;
  paymentDateTime: string;
  checkThisNotice: string;
  totalLoss: string;

  // 1930 Telephonic Helpline
  call1930Title: string;
  call1930Sub: string;
  dial1930Button: string;
  speakScriptPrompt: string;
  helperModeTitle: string;
  helperModeDesc: string;
  audioPlaybackPrompt: string;
  stopAudioPrompt: string;

  // Acknowledgement & Complaint
  ackSmsTitle: string;
  ackSmsSub: string;
  ackInputPlaceholder: string;
  complaintDraftTitle: string;
  complaintDraftSub: string;
  copyDraftButton: string;
  copiedFeedback: string;
  portalLink: string;

  // Evidence Docket
  evidenceDocketTitle: string;
  evidenceDocketSub: string;
  sha256Hash: string;
  downloadDocketButton: string;

  // Before You Pay Again (/verify)
  verifyTitle: string;
  verifySubtitle: string;
  verifyPlaceholder: string;
  stopAlertTitle: string;
  stopAlertSub: string;
  safeAlertTitle: string;
  safeAlertSub: string;
  whyFlagged: string;
  reportPaidFundsButton: string;
  tellFamilyButton: string;
  alertCopiedFeedback: string;

  // 3 Permanent Truths
  truthsHeader: string;
  truth1Badge: string;
  truth1Text: string;
  truth1Sub: string;
  truth2Badge: string;
  truth2Text: string;
  truth2Sub: string;
  truth3Badge: string;
  truth3Text: string;
  truth3Sub: string;

  // Family Shield
  familyShieldTitle: string;
  familyShieldSub: string;
  familySafetyWordLabel: string;
  familySafetyWordSub: string;
  addContactLabel: string;
  whatsappSosButton: string;

  // Senior Mode
  seniorModeOn: string;
  seniorModeOff: string;
  seniorModeTooltip: string;

  // Crisis Flow Extended (Phase E)
  emergencyActionBadge: string;
  reportingWindowLabel: string;
  minSincePayment: string;
  panicPurgeButton: string;
  panicPurgeTitle: string;
  panicPurgeAlert: string;
  draftRestoredNotice: string;
  discardDraftButton: string;
  uploadScreenshotInstead: string;
  pasteSmsInstead: string;
  extractDetailsButton: string;
  dropScreenshotPrompt: string;
  supportedAppsHint: string;
  quickTestSamples: string;
  multiPaymentLedgerTitle: string;
  multiPaymentSub: string;
  addAnotherTransfer: string;
  transferLabel: string;
  editingTransfer: string;
  txnDetailsReviewTitle: string;
  txnDetailsReviewSub: string;
  totalStolenLost: string;
  checkThisTag: string;
  criticalForLienBadge: string;
  bankLienHelper: string;
  recipientNameLabel: string;
  recipientUpiLabel: string;
  paymentChannelLabel: string;
  call1930Action: string;
  alertFamilyAction: string;
  alertCopiedLabel: string;
  recoveryChecklistTitle: string;
  call1930HeroTitle: string;
  call1930HeroSub: string;
  openCallScriptButton: string;
  addReceiptPromptRight: string;
  callScriptModalTitle: string;
  callScriptModalSub: string;
  filingOnBehalfLabel: string;
  victimFullNameLabel: string;
  yourRelationshipLabel: string;
  grandchildRel: string;
  sonDaughterRel: string;
  spouseRel: string;
  closeButton: string;
  attachScreenshotsButton: string;
  hashingInProgress: string;
  bsaIntegrityBadge: string;
  copyManifestButton: string;
  ackSmsStageTitle: string;
  scamStoryLabel: string;
  scamStoryPlaceholder: string;
  officialComplaintLabel: string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  en: {
    appTitle: 'PausePoint Golden Hour',
    appSubtitle: 'The sovereign citizen cognitive firewall. 100% on-device, zero cloud.',
    navReport: 'Report (1930)',
    navVerify: 'Before You Pay',
    navDecode: 'Decode',
    navSeniorMode: 'Senior Mode',
    langSwitch: 'हिन्दी',
    clientPrivacyBadge: '100% Client-Side Privacy',

    goldenHourActive: 'CRISIS GOLDEN HOUR ACTIVE',
    goldenHourDesc: 'Stolen funds are still moving through intermediate bank nodes. Report to 1930 now to put liens on recipient accounts before cashout.',
    uploadScreenshotTitle: 'Upload Payment Screenshot or Bank SMS',
    uploadScreenshotSub: 'Screenshot from Google Pay, PhonePe, Paytm, BHIM, or your bank debit SMS.',
    dropFileOrBrowse: 'Drop payment screenshot here, or click to browse',
    pasteSmsTitle: 'Or paste your Bank Debit SMS text',
    pasteSmsPlaceholder: 'e.g. Sent Rs.15,000.00 from SBI A/c ... to rahul@okaxis Ref: 429812345678...',
    ocrProcessing: 'Reading payment receipt locally on your device...',
    ocrReady: 'Receipt details extracted with on-device OCR.',

    amountPaid: 'Amount Paid (₹)',
    bankUtr: '12-Digit Bank UTR / Reference No.',
    whoYouPaid: 'Who You Paid (UPI ID or Account)',
    paymentDateTime: 'Date & Time of Transaction',
    checkThisNotice: 'Uncertain character detected. Please verify against your bank app.',
    totalLoss: 'Total Cumulative Stolen Amount',

    call1930Title: 'Call National Cybercrime Helpline 1930',
    call1930Sub: 'Do not panic. Read the telephonic script below to the police operator word for word.',
    dial1930Button: 'Direct Dial 1930',
    speakScriptPrompt: 'Telephonic Police Report Script',
    helperModeTitle: 'Filing on behalf of family member (Helper Mode)',
    helperModeDesc: 'Allowed under NCRP SOP for assisting elderly or panicking relatives.',
    audioPlaybackPrompt: 'Listen to Script',
    stopAudioPrompt: 'Stop Voice',

    ackSmsTitle: '14-Digit NCRP Acknowledgement Number',
    ackSmsSub: 'Police sends this via SMS after your 1930 call. Numbers start with 3 (Jan 2026 SOP).',
    ackInputPlaceholder: 'Paste SMS or enter 14 digits (e.g. 30202600123456)',
    complaintDraftTitle: 'Complaint Narrative for cybercrime.gov.in',
    complaintDraftSub: 'Use this formatted factual statement when logging into the national portal with your acknowledgement number.',
    copyDraftButton: 'Copy Complaint Draft',
    copiedFeedback: 'Copied to Clipboard!',
    portalLink: 'Open cybercrime.gov.in',

    evidenceDocketTitle: 'Digital Evidence Integrity Docket',
    evidenceDocketSub: 'SHA-256 cryptographic hashes generated on your device to support verification under the Bharatiya Sakshya Adhiniyam, 2023.',
    sha256Hash: 'SHA-256 Digest',
    downloadDocketButton: 'Export Evidence Docket (.txt)',

    verifyTitle: 'Before You Pay Again: Repeat Deposit Brake',
    verifySubtitle: 'Were you asked to pay a "withdrawal fee", "tax", "VIP level upgrade", or "court clearance deposit" to unlock your money? Check before sending funds.',
    verifyPlaceholder: 'Paste the WhatsApp, Telegram, SMS or email demanding payment...',
    stopAlertTitle: 'STOP! DO NOT SEND MONEY',
    stopAlertSub: 'This message matches known repeat-payment extortion hooks used in task scams and fake investment schemes.',
    safeAlertTitle: 'No Repeat Deposit Trap Detected',
    safeAlertSub: 'This message does not show withdrawal-fee or bail-demand triggers. Always verify financial transactions independently.',
    whyFlagged: 'Why this was flagged:',
    reportPaidFundsButton: "I've Already Paid Money → Report to 1930",
    tellFamilyButton: 'Tell My Family',
    alertCopiedFeedback: 'Alert Message Copied!',

    truthsHeader: 'Three Permanent Truths That Break Cyber Frauds',
    truth1Badge: 'Truth #1',
    truth1Text: 'Real jobs and legitimate platforms NEVER charge you money to withdraw your own earnings.',
    truth1Sub: 'Any demand for an "unlock fee" or "security deposit" is the scam asking for more.',
    truth2Badge: 'Truth #2',
    truth2Text: 'No Indian Police, CBI, ED, or Customs officer arrests citizens over a Skype/WhatsApp video call.',
    truth2Sub: 'Government agencies never demand deposits into "RBI verification accounts".',
    truth3Badge: 'Truth #3',
    truth3Text: 'You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE money.',
    truth3Sub: 'Your UPI PIN is strictly for AUTHORIZING outgoing payments from your bank account.',

    familyShieldTitle: 'Trusted Family Shield & Secret Safety Word',
    familyShieldSub: 'Scammers try to isolate victims. Agree on a secret code-word to verify unexpected emergency calls.',
    familySafetyWordLabel: 'Secret Family Safety Word',
    familySafetyWordSub: 'If anyone calls claiming an emergency, ask for this secret word before sending funds.',
    addContactLabel: 'Add Trusted Relative Contact',
    whatsappSosButton: 'WhatsApp SOS',

    seniorModeOn: 'Senior Mode: ON',
    seniorModeOff: 'Senior Mode',
    seniorModeTooltip: 'Enlarge text to 22px, enhance touch targets, and optimize contrast for seniors.',

    // Crisis Flow Extended (Phase E)
    emergencyActionBadge: 'Emergency Action',
    reportingWindowLabel: 'Reporting Window',
    minSincePayment: 'min since payment',
    panicPurgeButton: 'Panic Purge',
    panicPurgeTitle: 'Instantly wipes all local draft receipts, codeword, and evidence traces from this device',
    panicPurgeAlert: 'All incident traces have been permanently erased from this device.',
    draftRestoredNotice: 'Previous Incident Draft Restored:',
    discardDraftButton: 'Discard Draft',
    uploadScreenshotInstead: 'Upload Screenshot instead',
    pasteSmsInstead: 'Paste SMS Text instead',
    extractDetailsButton: 'Extract Details Now',
    dropScreenshotPrompt: 'Drop screenshot here or tap to select from gallery',
    supportedAppsHint: 'Google Pay, PhonePe, Paytm, BHIM, or Mobile Banking screenshots',
    quickTestSamples: 'Quick Test Samples:',
    multiPaymentLedgerTitle: 'Multi-Payment Fraud Ledger',
    multiPaymentSub: 'Task and investment scams coerce victims into multiple transfers. Every transaction is added to your 1930 case.',
    addAnotherTransfer: 'Add Another Transfer',
    transferLabel: 'Transfer',
    editingTransfer: 'Editing Transfer',
    txnDetailsReviewTitle: 'Transaction Details Review',
    txnDetailsReviewSub: 'Confirm extracted fields before calling 1930. Any uncertain OCR reading is flagged in amber.',
    totalStolenLost: 'Total Lost',
    checkThisTag: 'Check this',
    criticalForLienBadge: 'Critical for Bank Lien',
    bankLienHelper: 'The bank-side reference that traces money across banks (not the app ID)',
    recipientNameLabel: 'Recipient Name / Business',
    recipientUpiLabel: 'Recipient UPI ID / VPA',
    paymentChannelLabel: 'Bank & Payment Channel',
    call1930Action: 'Call 1930 Helpline (View Script)',
    alertFamilyAction: 'Alert Family Member',
    alertCopiedLabel: 'Alert Copied',
    recoveryChecklistTitle: 'Ordered Recovery Checklist (NCRP & Bank Protocol)',
    call1930HeroTitle: 'Call 1930 Right Now',
    call1930HeroSub: 'Calling 1930 flags your transaction in the inter-bank freeze portal.',
    openCallScriptButton: 'Open Operator Call Script',
    addReceiptPromptRight: 'Add receipt screenshot or bank SMS on the left to activate 1930 police script and NCRP incident docket.',
    callScriptModalTitle: '1930 Helpline Call Script',
    callScriptModalSub: 'Read these exact lines to the police officer',
    filingOnBehalfLabel: 'I am filing on behalf of a family member (Grandparent / Parent)',
    victimFullNameLabel: "Victim's Full Name",
    yourRelationshipLabel: 'Your Relationship',
    grandchildRel: 'Grandchild',
    sonDaughterRel: 'Son / Daughter',
    spouseRel: 'Spouse',
    closeButton: 'Close',
    attachScreenshotsButton: 'Attach Screenshots',
    hashingInProgress: 'Hashing...',
    bsaIntegrityBadge: 'BSA 2023 Integrity Aid',
    copyManifestButton: 'Copy Docket',
    ackSmsStageTitle: 'Stage 2: 1930 Acknowledgement SMS & Portal Draft',
    scamStoryLabel: 'Brief description of how the scam occurred (Optional)',
    scamStoryPlaceholder: 'e.g. Contacted on WhatsApp offering part-time YouTube video like job',
    officialComplaintLabel: 'Official Complaint Description (for cybercrime.gov.in)',
  },

  hi: {
    appTitle: 'पॉजपॉइंट गोल्डन आवर',
    appSubtitle: 'नागरिकों का डिजिटल रक्षा कवच। 100% आपके डिवाइस पर, बिना किसी सर्वर के।',
    navReport: 'ठगी रिपोर्ट (1930)',
    navVerify: 'भुगतान से पहले जांचें',
    navDecode: 'संदेश डिकोडर',
    navSeniorMode: 'सीनियर मोड',
    langSwitch: 'English',
    clientPrivacyBadge: '100% डिवाइस पर सुरक्षित एवं निजी',

    goldenHourActive: 'गोल्डन आवर सक्रिय है',
    goldenHourDesc: 'धोखेबाज़ों के खातों में भेजा गया पैसा अभी रुक सकता है। तुरंत 1930 पर कॉल करें ताकि बैंक उन खातों पर रोक (lien) लगा सके।',
    uploadScreenshotTitle: 'भुगतान का स्क्रीनशॉट या बैंक SMS चुनें',
    uploadScreenshotSub: 'Google Pay, PhonePe, Paytm, BHIM या बैंक से आया डेबिट SMS।',
    dropFileOrBrowse: 'रसीद का स्क्रीनशॉट यहाँ डालें या फ़ाइल चुनें',
    pasteSmsTitle: 'या बैंक से आया SMS यहाँ पेस्ट करें',
    pasteSmsPlaceholder: 'उदाहरण: Sent Rs.15,000.00 from SBI A/c to rahul@okaxis Ref: 429812345678...',
    ocrProcessing: 'आपके फोन पर ही रसीद पढ़ी जा रही है...',
    ocrReady: 'रसीद से विवरण सफलतापूर्वक निकाल लिया गया है।',

    amountPaid: 'भुगतान की गई राशि (₹)',
    bankUtr: '12 अंकों का बैंक UTR / संदर्भ संख्या',
    whoYouPaid: 'किसे भेजा (UPI ID या बैंक खाता)',
    paymentDateTime: 'भुगतान की तारीख और समय',
    checkThisNotice: 'अक्षर में संशय हो सकता है। कृपया अपने बैंक ऐप से मिलान कर लें।',
    totalLoss: 'कुल धोखाधड़ी की राशि',

    call1930Title: 'राष्ट्रीय साइबर हेल्पलाइन 1930 पर तुरंत कॉल करें',
    call1930Sub: 'घबराएं नहीं। पुलिस ऑपरेटर को नीचे लिखा विवरण शांत आवाज़ में पढ़कर सुनाएं।',
    dial1930Button: '1930 पर कॉल लगाएं',
    speakScriptPrompt: 'पुलिस ऑपरेटर के लिए बोलने का विवरण',
    helperModeTitle: 'परिवार के सदस्य की ओर से रिपोर्ट (सहायक मोड)',
    helperModeDesc: 'बुजुर्गों या घबराए परिजनों की मदद के लिए SOP के तहत मान्य।',
    audioPlaybackPrompt: 'विवरण सुनें (Voice)',
    stopAudioPrompt: 'आवाज़ बंद करें',

    ackSmsTitle: '14 अंकों की पावती (Acknowledgement) संख्या',
    ackSmsSub: '1930 कॉल के बाद पुलिस SMS में यह संख्या भेजती है (3 से शुरू होने वाली संख्या)।',
    ackInputPlaceholder: 'SMS पेस्ट करें या 14 अंक डालें (उदा. 30202600123456)',
    complaintDraftTitle: 'cybercrime.gov.in के लिए शिकायत का मसौदा',
    complaintDraftSub: 'राष्ट्रीय पोर्टल पर लॉगिन करके इस शिकायत विवरण को कॉपी करके चिपकाएं।',
    copyDraftButton: 'शिकायत विवरण कॉपी करें',
    copiedFeedback: 'कॉपी हो गया!',
    portalLink: 'cybercrime.gov.in खोलें',

    evidenceDocketTitle: 'डिजिटल साक्ष्य प्रमाण डॉकेट',
    evidenceDocketSub: 'भारतीय साक्ष्य अधिनियम, 2023 के तहत सहायता के लिए आपके फ़ोन पर तैयार SHA-256 डिजिटल फिंगरप्रिंट।',
    sha256Hash: 'SHA-256 हैश',
    downloadDocketButton: 'साक्ष्य डॉकेट डाउनलोड करें (.txt)',

    verifyTitle: 'दोबारा पैसे भेजने से पहले: रिपीट डिपॉजिट ब्रेक',
    verifySubtitle: 'क्या आपसे पैसे निकालने, टैक्स, वीआईपी लेवल या डिजिटल अरेस्ट क्लीयरेंस के नाम पर और पैसे मांगे जा रहे हैं? भेजने से पहले जांचें।',
    verifyPlaceholder: 'पैसे मांगने वाला WhatsApp, Telegram या SMS संदेश यहाँ पेस्ट करें...',
    stopAlertTitle: 'रुकें! बिल्कुल पैसे न भेजें',
    stopAlertSub: 'यह संदेश टास्क स्कैम और फर्जी निवेश में और पैसे ऐंठने के जाने-माने जाल से मेल खाता है।',
    safeAlertTitle: 'रिपीट डिपॉजिट का कोई जाल नहीं मिला',
    safeAlertSub: 'इस संदेश में पैसे निकालने के शुल्क का जाल नहीं दिखा। हमेशा वित्तीय लेनदेन की स्वतंत्र पुष्टि करें।',
    whyFlagged: 'यह संदेश क्यों संदिग्ध है:',
    reportPaidFundsButton: 'मैंने पहले ही पैसे दे दिए हैं → 1930 पर रिपोर्ट करें',
    tellFamilyButton: 'परिवार को सचेत करें',
    alertCopiedFeedback: 'अलर्ट संदेश कॉपी हुआ!',

    truthsHeader: 'साइबर ठगी से बचाने वाले तीन अटल सच',
    truth1Badge: 'सच #1',
    truth1Text: 'असली नौकरी या निवेश प्लेटफॉर्म आपकी कमाई निकालने के लिए कभी आपसे पैसे नहीं मांगते।',
    truth1Sub: 'पैसे निकालने के लिए "टैक्स" या "अनलॉक फीस" मांगना उसी ठगी का अगला चरण है।',
    truth2Badge: 'सच #2',
    truth2Text: 'भारत की पुलिस, CBI या ED कभी भी WhatsApp या Skype वीडियो कॉल पर किसी को गिरफ्तार नहीं करती।',
    truth2Sub: 'सरकारी एजेंसियां कभी किसी "RBI वेरिफिकेशन खाते" में पैसे जमा करने को नहीं कहतीं।',
    truth3Badge: 'सच #3',
    truth3Text: 'पैसे प्राप्त (RECEIVE) करने के लिए आपको कभी UPI PIN डालने या QR कोड स्कैन करने की आवश्यकता नहीं होती।',
    truth3Sub: 'UPI PIN केवल आपके बैंक खाते से पैसे कटने (भेजने) के लिए होता है।',

    familyShieldTitle: 'पारिवारिक सुरक्षा ढाल और गुप्त सुरक्षा शब्द',
    familyShieldSub: 'धोखेबाज़ पीड़ितों को अकेला करने का प्रयास करते हैं। आपातकालीन कॉल की पुष्टि के लिए एक गुप्त शब्द तय करें।',
    familySafetyWordLabel: 'गुप्त पारिवारिक सुरक्षा शब्द',
    familySafetyWordSub: 'यदि कोई आपातकाल का दावा करे, तो पैसे भेजने से पहले यह गुप्त शब्द पूछें।',
    addContactLabel: 'विश्वसनीय रिश्तेदार का संपर्क जोड़ें',
    whatsappSosButton: 'WhatsApp आपात संदेश',

    seniorModeOn: 'सीनियर मोड: चालू',
    seniorModeOff: 'सीनियर मोड',
    seniorModeTooltip: 'अक्षरों को 22px बड़ा करें, बटन का आकार बढ़ाएं और उच्च कंट्रास्ट सक्षम करें।',

    // Crisis Flow Extended (Phase E)
    emergencyActionBadge: 'आपातकालीन कार्रवाई',
    reportingWindowLabel: 'रिपोर्टिंग समय सीमा',
    minSincePayment: 'मिनट पहले भुगतान हुआ',
    panicPurgeButton: 'तत्काल डेटा मिटाएं',
    panicPurgeTitle: 'इस डिवाइस से सभी रसीदें, ड्राफ्ट और साक्ष्य तुरंत हमेशा के लिए मिटाएं',
    panicPurgeAlert: 'इस डिवाइस से घटना के सभी रिकॉर्ड और साक्ष्य पूरी तरह मिटा दिए गए हैं।',
    draftRestoredNotice: 'पिछला ड्राफ्ट पुनर्प्राप्त किया गया:',
    discardDraftButton: 'ड्राफ्ट हटाएं',
    uploadScreenshotInstead: 'इसके बजाय स्क्रीनशॉट अपलोड करें',
    pasteSmsInstead: 'इसके बजाय SMS टेक्स्ट पेस्ट करें',
    extractDetailsButton: 'विवरण अभी निकालें',
    dropScreenshotPrompt: 'रसीद का स्क्रीनशॉट यहाँ डालें या गैलरी से चुनें',
    supportedAppsHint: 'Google Pay, PhonePe, Paytm, BHIM या नेट बैंकिंग के स्क्रीनशॉट',
    quickTestSamples: 'त्वरित परीक्षण नमूने:',
    multiPaymentLedgerTitle: 'एकाधिक भुगतान धोखाधड़ी बहीखाता',
    multiPaymentSub: 'टास्क और फर्जी निवेश ठगी में कई बार पैसे ऐंठे जाते हैं। हर लेनदेन आपके 1930 केस में जोड़ा जाएगा।',
    addAnotherTransfer: 'एक और भुगतान जोड़ें',
    transferLabel: 'भुगतान',
    editingTransfer: 'भुगतान विवरण संपादन',
    txnDetailsReviewTitle: 'लेनदेन विवरण की समीक्षा',
    txnDetailsReviewSub: '1930 पर कॉल करने से पहले निकाले गए विवरण की जांच करें। संदेहास्पद अक्षर पीले रंग में चिह्नित हैं।',
    totalStolenLost: 'कुल हानि',
    checkThisTag: 'जांचें',
    criticalForLienBadge: 'खाता फ्रीज हेतु अति महत्वपूर्ण',
    bankLienHelper: 'बैंक संदर्भ संख्या जो अंतर-बैंक ट्रांसफर को ट्रैक करती है (ऐप आईडी नहीं)',
    recipientNameLabel: 'प्राप्तकर्ता का नाम / फर्म',
    recipientUpiLabel: 'प्राप्तकर्ता की UPI ID / VPA',
    paymentChannelLabel: 'बैंक और भुगतान माध्यम',
    call1930Action: '1930 हेल्पलाइन पर कॉल करें (स्क्रिप्ट देखें)',
    alertFamilyAction: 'परिवार को सूचित करें',
    alertCopiedLabel: 'अलर्ट संदेश कॉपी हुआ',
    recoveryChecklistTitle: 'क्रमबद्ध रिकवरी चेकलिस्ट (NCRP एवं बैंक प्रक्रिया)',
    call1930HeroTitle: 'तुरंत 1930 पर कॉल करें',
    call1930HeroSub: '1930 पर कॉल करने से अंतर-बैंक पोर्टल में आरोपी खातों पर तुरंत रोक (lien) लगाई जाती है।',
    openCallScriptButton: 'पुलिस ऑपरेटर कॉल स्क्रिप्ट खोलें',
    addReceiptPromptRight: '1930 पुलिस स्क्रिप्ट और NCRP डॉकेट सक्रिय करने के लिए बाईं ओर रसीद का स्क्रीनशॉट या बैंक SMS जोड़ें।',
    callScriptModalTitle: '1930 हेल्पलाइन पुलिस स्क्रिप्ट',
    callScriptModalSub: 'पुलिस ऑपरेटर को ठीक यही वाक्य पढ़कर सुनाएं',
    filingOnBehalfLabel: 'मैं अपने परिवार के सदस्य (माता-पिता / बुजुर्ग) की ओर से रिपोर्ट कर रहा हूँ',
    victimFullNameLabel: 'पीड़ित का पूरा नाम',
    yourRelationshipLabel: 'पीड़ित से आपका संबंध',
    grandchildRel: 'पोता / पोती / नाती / नातिन',
    sonDaughterRel: 'बेटा / बेटी',
    spouseRel: 'पति / पत्नी',
    closeButton: 'बंद करें',
    attachScreenshotsButton: 'स्क्रीनशॉट संलग्न करें',
    hashingInProgress: 'डिजिटल हैश निकाला जा रहा है...',
    bsaIntegrityBadge: 'BSA 2023 साक्ष्य सहायता',
    copyManifestButton: 'डॉकेट कॉपी करें',
    ackSmsStageTitle: 'चरण 2: 1930 पावती SMS और पोर्टल शिकायत',
    scamStoryLabel: 'ठगी कैसे हुई इसका संक्षिप्त विवरण (वैकल्पिक)',
    scamStoryPlaceholder: 'उदा. WhatsApp पर पार्ट-टाइम यूट्यूब लाइक जॉब का ऑफर देकर संपर्क किया गया',
    officialComplaintLabel: 'आधिकारिक शिकायत विवरण (cybercrime.gov.in हेतु)',
  },
};

type Listener = () => void;
const listeners = new Set<Listener>();

let currentLang: Language = 'en';

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('pausepoint_lang');
    if (saved === 'en' || saved === 'hi') {
      currentLang = saved;
    }
  } catch {
    // Ignore storage errors
  }
}

export function getLanguage(): Language {
  return currentLang;
}

export function setLanguage(lang: Language): void {
  currentLang = lang;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('pausepoint_lang', lang);
      document.documentElement.lang = lang;
    } catch {
      // Ignore storage errors
    }
  }
  listeners.forEach((l) => l());
}

export function toggleLanguage(): Language {
  const next: Language = currentLang === 'en' ? 'hi' : 'en';
  setLanguage(next);
  return next;
}

export function useTranslation() {
  const [lang, setLangState] = useState<Language>(currentLang);

  useEffect(() => {
    const update = () => setLangState(currentLang);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return {
    lang,
    t: TRANSLATIONS[lang],
    setLanguage,
    toggleLanguage,
  };
}
