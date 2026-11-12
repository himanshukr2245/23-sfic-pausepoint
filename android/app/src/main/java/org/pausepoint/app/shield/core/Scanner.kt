package org.pausepoint.app.shield.core

import java.security.MessageDigest
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.regex.Pattern

/**
 * PausePoint Shield Core Forensic Scanner (100% On-Device, Airgapped)
 *
 * Implements canonical detection rules from rules/pack.json:
 * - Harmful Link & URL Dissector (Shorteners, Malicious APKs, Suspicious TLDs, Typosquatting)
 * - 12 Canonical Psychological Manipulation Levers
 * - 11 Real Indian Cybercrime Threat Playbooks
 * - Entity Extraction (Dangerous 10-digit mobile, UPI handles, amounts)
 * - Section 63 BSA 2023 Digital Evidence Docket
 */

data class LinkDissection(
    val rawUrl: String,
    val domain: String,
    val isShortener: Boolean,
    val hasDangerousExtension: Boolean,
    val isSuspiciousTld: Boolean,
    val isImpersonatingBank: Boolean,
    val isRawIpAddress: Boolean,
    val isVerifiedPlatform: Boolean = false,
    val platformLabel: String = "",
    val riskSummary: String,
    val redFlags: List<String>
)

data class ExtractedEntities(
    val links: List<LinkDissection>,
    val phoneNumbers: List<String>,
    val suspiciousPhones: List<String>,
    val upiIds: List<String>,
    val amounts: List<String>
)

data class DetailedScanResult(
    val score: Int,
    val isScam: Boolean,
    val level: String, // "danger", "suspicious", "low"
    val category: String,
    val headline: String,
    val trap: String,
    val truth: String,
    val whatToDo: String,
    val detectedLevers: List<String>,
    val entities: ExtractedEntities,
    val sha256: String,
    val timestamp: String,
    val whatsappWarning: String,
    val playbookName: String = category,
    val containsHighRiskLink: Boolean = entities.links.any { it.isShortener || it.hasDangerousExtension || it.isSuspiciousTld || it.isImpersonatingBank }
)

typealias ScanResult = DetailedScanResult

object Scanner {

    // ─────────────────────────────────────────────────────────────────────────
    // 1. LINK & URL FORENSICS PATTERNS
    // ─────────────────────────────────────────────────────────────────────────
    private val URL_PATTERN = Pattern.compile(
        "(https?://[\\w\\d:#@%/;$()~_?\\+-=\\\\\\.&]+|[a-zA-Z0-9-]+\\.(?:xyz|top|live|work|click|link|cc|icu|vip|site|online|club|ru|cn|apk)(?:/[\\w\\d:#@%/;$()~_?\\+-=\\\\\\.&]*)?)",
        Pattern.CASE_INSENSITIVE
    )

    private val SHORTENER_DOMAINS = setOf(
        "bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "rb.gy", "shorturl.at", "goo.gl", "ow.ly", "buff.ly"
    )

    private val SUSPICIOUS_TLDS = setOf(
        "xyz", "top", "live", "work", "click", "link", "cc", "icu", "vip", "ru", "cn", "site", "online", "club"
    )

    // Authenticated, Official Platform Domains (Never flagged as malware)
    private val VERIFIED_PLATFORMS = mapOf(
        "chat.whatsapp.com" to "Official WhatsApp Group",
        "whatsapp.com" to "Official WhatsApp",
        "wa.me" to "Official WhatsApp Direct",
        "meet.google.com" to "Google Meet",
        "drive.google.com" to "Google Drive",
        "docs.google.com" to "Google Docs",
        "forms.gle" to "Google Forms",
        "google.com" to "Google Services",
        "teams.microsoft.com" to "Microsoft Teams",
        "microsoft.com" to "Microsoft Portal",
        "zoom.us" to "Zoom Video",
        "linkedin.com" to "LinkedIn",
        "internshala.com" to "Internshala",
        "unstop.com" to "Unstop Platform",
        "naukri.com" to "Naukri",
        "cybercrime.gov.in" to "National Cybercrime Portal",
        "sancharsaathi.gov.in" to "DoT Sanchar Saathi",
        "mca.gov.in" to "Ministry of Corporate Affairs",
        "incometax.gov.in" to "Income Tax Department",
        "uidai.gov.in" to "UIDAI Aadhaar Official",
        "sbi.co.in" to "State Bank of India",
        "onlinesbi.sbi" to "SBI NetBanking",
        "hdfcbank.com" to "HDFC Bank",
        "icicibank.com" to "ICICI Bank",
        "axisbank.com" to "Axis Bank",
        "kotak.com" to "Kotak Mahindra Bank",
        "pnbindia.in" to "Punjab National Bank",
        "bankofbaroda.in" to "Bank of Baroda",
        "canarabank.com" to "Canara Bank",
        "npci.org.in" to "NPCI / UPI Official"
    )

    private val OFFICIAL_ALLOWLIST = setOf(
        "sbi.co.in", "onlinesbi.sbi", "hdfcbank.com", "icicibank.com", "axisbank.com",
        "pnbindia.in", "kotak.com", "canarabank.com", "bankofbaroda.in", "npci.org.in",
        "gov.in", "cybercrime.gov.in", "sancharsaathi.gov.in", "incometax.gov.in", "uidai.gov.in", "mca.gov.in"
    )

    private val BANK_KEYWORDS = listOf(
        "sbi", "yono", "hdfc", "icici", "axis", "pnb", "kotak", "canara", "pan", "aadhaar", "challan", "electricity", "bescom", "tneb"
    )

    // ─────────────────────────────────────────────────────────────────────────
    // 2. PSYCHOLOGICAL LEVERS (12 CANONICAL LEVERS)
    // ─────────────────────────────────────────────────────────────────────────
    private val LEVER_PATTERNS = listOf(
        Pair("Urgency", Pattern.compile("\\b(urgent(?:ly)?|immediately|right now|act now|asap|within \\d+\\s*(?:hours?|hrs?|minutes?|mins?)|today only|last (?:chance|warning|reminder|date)|expires? (?:today|tonight|soon)|tonight|turant|abhi|jaldi|bina deri)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Fear / Threat", Pattern.compile("\\b(blocked|suspended|deactivated|disconnected|disconnection|legal action|arrest(?:ed)?|warrant|penalty|fine of|FIR|seized|frozen|money laundering|drugs?|illegal|band ho jayega|kat jayegi|police karyawahi|giraftar)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Fake Authority", Pattern.compile("\\b(RBI|SEBI|CBI|ED officer|customs|income ?tax|TRAI|DOT|police|cyber ?cell|crime branch|narcotics|NCB|court|judge|UIDAI|government|bank manager|electricity (?:board|department)|parivahan|traffic police)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Greed / Reward", Pattern.compile("\\b(won|winner|lottery|prize|cashback|reward|gift|lucky draw|KBC|refund|bonus|earn (?:rs\\.?|₹)?\\s?\\d[\\d,]*|part[- ]time job|work from home|double your|guaranteed profit|daily income)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Secrecy / Isolation", Pattern.compile("\\b(don'?t tell (?:anyone|anybody|your family)|do not (?:tell|inform|share with)|keep (?:this )?(?:confidential|secret)|stay on (?:the )?(?:call|video)|don'?t disconnect|kisi ko mat batana|raaz rakhna)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Credential Theft", Pattern.compile("\\b(OTP|UPI PIN|PIN|CVV|password|passcode|login details|card number|netbanking (?:id|password)|verification code)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Remote / Trojan APK", Pattern.compile("\\b(AnyDesk|TeamViewer|QuickSupport|RustDesk|screen ?share|install (?:this|the) app|download (?:this|the) app|\\S+\\.apk)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Payment Demand", Pattern.compile("\\b(pay(?:ment)?|transfer|deposit|send (?:money|rs|₹)|scan (?:the |this )?QR|(?:processing|registration|security|clearance|tax|gas)?\\s*fee|clearance fee|UPI|bhejo|jama karo)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Fake Familiarity", Pattern.compile("\\b(hi (?:mom|mum|maa|dad|papa)|this is my new number|my (?:old )?phone (?:is )?(?:lost|broken|stolen)|it'?s me|beta|bhai)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Curiosity / Blackmail", Pattern.compile("\\b(you won'?t believe|your (?:photo|video) (?:is )?(?:viral|leaked)|private video|is this you|morphed clip|viral video)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Scarcity Pressure", Pattern.compile("\\b(only \\d+ (?:left|seats|slots)|limited (?:offer|slots|time)|everyone is joining|hurry up)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Click Bait", Pattern.compile("\\b(click (?:here|on|this)|open (?:this|the) link|visit (?:https?:\\/\\/|\\S+\\.\\S+|this)|tap (?:here|on)|link given below)\\b", Pattern.CASE_INSENSITIVE))
    )

    // ─────────────────────────────────────────────────────────────────────────
    // 3. INDIAN CYBERCRIME THREAT PLAYBOOKS
    // ─────────────────────────────────────────────────────────────────────────
    private data class PlaybookDef(
        val category: String,
        val headline: String,
        val pattern: Pattern,
        val weight: Int,
        val trap: String,
        val truth: String,
        val whatToDo: String
    )

    private val PLAYBOOKS = listOf(
        PlaybookDef(
            category = "DIGITAL ARREST / FAKE POLICE",
            headline = "Digital Arrest / Fake Police Extortion",
            pattern = Pattern.compile("\\b(digital arrest|skype|cbi|ed officer|narcotics|ncb|mumbai police|crime branch)\\b.*?\\b(video call|warrant|customs parcel|money laundering|arrested?|drugs)\\b|\\b(video call|skype)\\b.*?\\b(cbi|police|arrest|warrant)\\b", Pattern.CASE_INSENSITIVE),
            weight = 96,
            trap = "Threatens fake criminal arrest via video call to panic you into transferring funds to a 'safe verification account'.",
            truth = "Indian police, CBI, and courts NEVER conduct trials or issue arrest warrants over Skype or WhatsApp video calls. 'Digital Arrest' does not legally exist.",
            whatToDo = "1. Disconnect call immediately. 2. Block sender. 3. Call 1930 or Chakshu (sancharsaathi.gov.in)."
        ),
        PlaybookDef(
            category = "UTILITY BILL / APK MALWARE",
            headline = "Fake Electricity Disconnection Warning",
            pattern = Pattern.compile("\\b(electricity (?:will be|bill)|power (?:will be|cut)|disconnected tonight|electricity officer|bill unpaid|bescom|tneb|mahadaiscom)\\b", Pattern.CASE_INSENSITIVE),
            weight = 94,
            trap = "Urges you to call an unofficial personal 10-digit mobile number and install a remote control APK app to pay a fake ₹10 bill update fee.",
            truth = "State electricity boards NEVER disconnect power at night, never send SMS from personal mobile numbers, and never ask citizens to install APKs.",
            whatToDo = "1. Do NOT call the phone number. 2. Pay only via official state electricity DISCOM portal or your standard UPI app."
        ),
        PlaybookDef(
            category = "PART-TIME TASK & PREPAID DEPOSIT",
            headline = "Part-Time Task & Telegram Deposit Trap",
            pattern = Pattern.compile("\\b(telegram task|youtube like|rating task|prepaid task|prepaid deposit|deposit.*commission|crypto.*deposit|daily.*commission.*transfer)\\b|\\b(?:part[- ]time|work from home|daily income)\\b.*?(?:prepaid|security deposit|transfer ₹|deposit ₹|pay ₹|pay commission|unlock withdrawal|recharge to earn)", Pattern.CASE_INSENSITIVE),
            weight = 92,
            trap = "Lures you with small initial payouts for simple tasks, then demands escalating 'prepaid deposits' or 'crypto taxes' to unlock earnings.",
            truth = "Legitimate employers never demand upfront security deposits or gas fees to release earned wages. Paying more will NEVER unlock trapped money.",
            whatToDo = "1. Stop depositing immediately. 2. Exit and block the Telegram group. 3. Dial 1930 to freeze the scammer's bank receiver."
        ),
        PlaybookDef(
            category = "MALICIOUS APK / TROJAN DELIVERY",
            headline = "Dangerous Malicious App (Trojan APK)",
            pattern = Pattern.compile("\\b(\\.apk|install (?:this|the) app|mparivahan\\.apk|sbi_reward\\.apk|challan\\.apk|pm_kisan\\.apk)\\b", Pattern.CASE_INSENSITIVE),
            weight = 95,
            trap = "Tricks you into installing an unverified APK outside Google Play that silently reads your SMS, steals banking OTPs, and drains accounts.",
            truth = "Government agencies (Traffic Police e-Challan, mParivahan) and banks NEVER distribute app updates via WhatsApp links or direct APK download files.",
            whatToDo = "1. Do NOT download or install the file. 2. If downloaded, delete immediately from Downloads folder without opening."
        ),
        PlaybookDef(
            category = "CAREER / INTERNSHIP OFFER",
            headline = "Internship Selection Notice (Official WhatsApp Link)",
            pattern = Pattern.compile("\\b(?:internship|selected for|profile has been selected|selection is confirmed|induction session|stipend)\\b", Pattern.CASE_INSENSITIVE),
            weight = 15,
            trap = "Unsolicited recruitment groups sometimes later ask students for paid certificates or task security deposits during induction.",
            truth = "The invite link is on the official WhatsApp domain (chat.whatsapp.com). Legitimate internships pay stipends and never charge students fees to join.",
            whatToDo = "1. You can safely join the WhatsApp induction. 2. If the organizer asks for any payment, registration fee, or security deposit, exit and block immediately."
        ),
        PlaybookDef(
            category = "OFFICIAL BANK TRANSACTION / OTP",
            headline = "Authentic Bank Notification / OTP Security Passcode",
            pattern = Pattern.compile("\\b(?:dear (?:sbi|hdfc|icici|axis|pnb|kotak|customer|user)|your otp is|otp for (?:txn|transaction)|valid for \\d+ (?:mins?|minutes?)|never share otp)\\b", Pattern.CASE_INSENSITIVE),
            weight = 10,
            trap = "Never disclose or forward this OTP to anyone calling or messaging you.",
            truth = "This is a legitimate one-time authentication code generated for your banking transaction.",
            whatToDo = "Keep this code private. Do NOT share it with anyone, even if they claim to be a bank officer."
        ),
        PlaybookDef(
            category = "BANK / KYC BLOCK PHISHING",
            headline = "Bank / SIM KYC Suspension Phishing",
            pattern = Pattern.compile("\\b(kyc|account (?:blocked|suspended)|de-?activated|pan card|sim (?:block|blocked)|yono|netbanking)\\b.*?\\b(update immediately|click here|visit|link|http)\\b", Pattern.CASE_INSENSITIVE),
            weight = 91,
            trap = "Sends frantic warnings that your bank account or SIM is blocked, prompting you to enter NetBanking credentials on a fake phishing portal.",
            truth = "Banks and telecom operators NEVER suspend accounts via SMS links (.xyz, .top, .live) with 24-hour ultimatums.",
            whatToDo = "1. Never tap the link. 2. Check your balance directly in your official bank mobile app. 3. Call the number on the back of your debit card."
        ),
        PlaybookDef(
            category = "UPI RECEIVE MONEY / CASHBACK TRAP",
            headline = "UPI 'Receive Money' Reverse PIN Scam",
            pattern = Pattern.compile("\\b(upi pin|enter pin|scan qr to receive|cashback.*pin|receive.*pin|scan.*cashback)\\b", Pattern.CASE_INSENSITIVE),
            weight = 95,
            trap = "Claims you have won cashback or a lottery refund and asks you to enter your UPI PIN or scan a QR code to 'receive' the funds.",
            truth = "You NEVER enter your UPI PIN or scan a QR code to RECEIVE money. Entering your UPI PIN is exclusively used to SEND money OUT.",
            whatToDo = "1. Never enter your UPI PIN. 2. Disconnect and block caller immediately."
        ),
        PlaybookDef(
            category = "CUSTOMS / DRUG PARCEL EXTORTION",
            headline = "Fake Courier / Customs Drug Parcel Extortion",
            pattern = Pattern.compile("\\b(customs|parcel.*(?:narcotics|drugs|illegal)|fedex|dhl|passport.*parcel|taiwan parcel)\\b", Pattern.CASE_INSENSITIVE),
            weight = 93,
            trap = "Claims an illegal parcel in your name was seized with narcotics, threatening police action unless you transfer 'clearance fees'.",
            truth = "Courier companies (FedEx, DHL, India Post) NEVER transfer calls to police or demand settlement money to avoid arrest.",
            whatToDo = "1. Hang up immediately. 2. Track real parcels only on official carrier websites."
        ),
        PlaybookDef(
            category = "VIDEO CALL SEXTORTION",
            headline = "Video Call Blackmail / Sextortion",
            pattern = Pattern.compile("\\b(private video|morphed (?:video|clip)|viral on (?:youtube|facebook)|relatives|social media.*video)\\b", Pattern.CASE_INSENSITIVE),
            weight = 96,
            trap = "Blackmails you with morphed video clips, demanding urgent money transfers to prevent sharing with friends and relatives.",
            truth = "Blackmailers never delete compromising footage after receiving money; they demand larger amounts every time you pay.",
            whatToDo = "1. Do NOT transfer any money. 2. Block across all channels. 3. File report on cybercrime.gov.in under 'Crime against Women' or call 1930."
        ),
        PlaybookDef(
            category = "TRAI / DOT SIM DECONNECTION",
            headline = "Fake TRAI / DoT Mobile Disconnection Alert",
            pattern = Pattern.compile("\\b(trai|department of telecommunications|dot.*blocked|sim.*blocked within 24 hours)\\b", Pattern.CASE_INSENSITIVE),
            weight = 90,
            trap = "Impersonates TRAI threatening your phone number will be disconnected across India for illegal activities unless verified.",
            truth = "TRAI is a telecom regulator and NEVER contacts individual subscribers to disconnect mobile numbers. Telecom notices come only via telco SMS.",
            whatToDo = "1. Ignore the message. 2. Call your mobile operator's official customer care (198) to verify status."
        )
    )

    // ─────────────────────────────────────────────────────────────────────────
    // 4. ENTITY EXTRACTION PATTERNS
    // ─────────────────────────────────────────────────────────────────────────
    private val PHONE_PATTERN = Pattern.compile("(?:(?:\\+91|91|0)?[6-9]\\d{9})")
    private val UPI_PATTERN = Pattern.compile("[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}")
    private val AMOUNT_PATTERN = Pattern.compile("(?:₹|rs\\.?|inr)\\s?([\\d,]+(?:\\.\\d{2})?)", Pattern.CASE_INSENSITIVE)

    /**
     * Executes deep on-device forensic analysis of the input text payload.
     */
    fun scan(rawText: String, sender: String = ""): DetailedScanResult {
        val trimmed = rawText.trim()
        val md = MessageDigest.getInstance("SHA-256")
        val sha256 = md.digest(trimmed.toByteArray()).joinToString("") { "%02x".format(it) }
        val now = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())

        if (trimmed.isBlank()) {
            return DetailedScanResult(
                score = 0,
                isScam = false,
                level = "low",
                category = "EMPTY PAYLOAD",
                headline = "Ready to Inspect Incoming Traffic",
                trap = "No content provided to analyze.",
                truth = "Paste any message, SMS, WhatsApp text, or link to run forensics.",
                whatToDo = "Tap [Paste & Scan Now] to check any suspicious message.",
                detectedLevers = emptyList(),
                entities = ExtractedEntities(emptyList(), emptyList(), emptyList(), emptyList(), emptyList()),
                sha256 = sha256,
                timestamp = now,
                whatsappWarning = ""
            )
        }

        // 1. Link Dissection
        val extractedLinks = mutableListOf<LinkDissection>()
        val urlMatcher = URL_PATTERN.matcher(trimmed)
        while (urlMatcher.find()) {
            val url = urlMatcher.group()
            val dissection = dissectUrl(url)
            extractedLinks.add(dissection)
        }

        // 2. Entity Extraction
        val extractedPhones = mutableListOf<String>()
        val phoneMatcher = PHONE_PATTERN.matcher(trimmed)
        while (phoneMatcher.find()) {
            extractedPhones.add(phoneMatcher.group())
        }

        val extractedUpis = mutableListOf<String>()
        val upiMatcher = UPI_PATTERN.matcher(trimmed)
        while (upiMatcher.find()) {
            extractedUpis.add(upiMatcher.group())
        }

        val extractedAmounts = mutableListOf<String>()
        val amountMatcher = AMOUNT_PATTERN.matcher(trimmed)
        while (amountMatcher.find()) {
            extractedAmounts.add(amountMatcher.group())
        }

        // 3. Psychological Levers Detection
        val detectedLevers = mutableListOf<String>()
        for ((name, pattern) in LEVER_PATTERNS) {
            if (pattern.matcher(trimmed).find()) {
                detectedLevers.add(name)
            }
        }

        // 4. Playbook Matching
        var matchedPlaybook: PlaybookDef? = null
        for (pb in PLAYBOOKS) {
            if (pb.pattern.matcher(trimmed).find()) {
                matchedPlaybook = pb
                break
            }
        }

        // 5. Threat Score Calculation
        var threatScore = 0
        if (matchedPlaybook != null) {
            threatScore = matchedPlaybook.weight
        } else {
            threatScore += detectedLevers.size * 12
        }

        // Link risk amplifiers: only genuinely dangerous links amplify risk!
        val hasDangerousLink = extractedLinks.any { it.hasDangerousExtension || it.isSuspiciousTld || it.isImpersonatingBank || it.isRawIpAddress }
        if (hasDangerousLink) {
            threatScore = maxOf(threatScore, 92)
        } else if (extractedLinks.any { it.isShortener }) {
            threatScore = maxOf(threatScore, 65)
        }

        // If all extracted links are verified platform links (e.g. chat.whatsapp.com, meet.google.com),
        // ensure educational or authentic communication is not falsely amplified to high danger.
        val allLinksVerified = extractedLinks.isNotEmpty() && extractedLinks.all { it.isVerifiedPlatform }
        if (allLinksVerified && (matchedPlaybook?.category == "CAREER / INTERNSHIP OFFER" || matchedPlaybook?.category == "OFFICIAL BANK TRANSACTION / OTP")) {
            threatScore = matchedPlaybook.weight
        }

        // Suspicious phone detection (personal 10-digit mobile claimed as official)
        val suspiciousPhones = mutableListOf<String>()
        val hasAuthorityOrThreat = detectedLevers.contains("Fake Authority") || detectedLevers.contains("Fear / Threat")
        if (hasAuthorityOrThreat && matchedPlaybook?.category != "CAREER / INTERNSHIP OFFER") {
            for (p in extractedPhones) {
                val digits = p.replace("\\D".toRegex(), "")
                if (digits.length == 10 && (digits.startsWith("6") || digits.startsWith("7") || digits.startsWith("8") || digits.startsWith("9"))) {
                    suspiciousPhones.add(p)
                    threatScore = maxOf(threatScore, 90)
                }
            }
            if (sender.isNotBlank()) {
                val digits = sender.replace("\\D".toRegex(), "")
                if (digits.length == 10 && (digits.startsWith("6") || digits.startsWith("7") || digits.startsWith("8") || digits.startsWith("9"))) {
                    suspiciousPhones.add(sender)
                    threatScore = maxOf(threatScore, 90)
                }
            }
        }

        threatScore = threatScore.coerceIn(0, 100)
        val isScam = threatScore >= 50

        val level = when {
            threatScore >= 60 || hasDangerousLink -> "danger"
            threatScore >= 30 -> "suspicious"
            else -> "low"
        }

        val category = matchedPlaybook?.category ?: if (isScam) "HIGH-RISK SOCIAL ENGINEERING" else "CLEAN PAYLOAD"
        val headline = matchedPlaybook?.headline ?: if (isScam) "Suspicious Coercion Patterns Detected" else "No High-Risk Threat Vectors Found"
        val trap = matchedPlaybook?.trap ?: if (isScam) "Uses pressure tactics to hurry you into an unverified action." else "No predatory extortion or theft traps identified."
        val truth = matchedPlaybook?.truth ?: if (isScam) "Legitimate institutions communicate through verified registered channels, never via threatening unverified messages." else "Standard cyber hygiene still applies: never share OTPs or passwords."
        val whatToDo = matchedPlaybook?.whatToDo ?: if (isScam) "1. Do NOT click any links. 2. Verify independently on official portals." else "Safe to proceed, but stay alert for unexpected money requests."

        // WhatsApp Family Warning Advisory
        val warningBuilder = StringBuilder()
        if (isScam) {
            warningBuilder.append("🚨 *SCAM ALERT via PausePoint Shield*\n\n")
            warningBuilder.append("I checked this message and it is identified as a *${category}*:\n")
            warningBuilder.append("─────────────────────\n")
            warningBuilder.append("⚠️ *Trap:* $trap\n")
            warningBuilder.append("🛡️ *Truth:* $truth\n")
            warningBuilder.append("👉 *Action:* $whatToDo\n")
            if (extractedLinks.isNotEmpty() && hasDangerousLink) {
                warningBuilder.append("❌ *Dangerous Link:* ${extractedLinks.first().rawUrl}\n")
            }
            warningBuilder.append("─────────────────────\n")
            warningBuilder.append("Please do not click any links or send money!")
        } else {
            warningBuilder.append("✅ *VERIFIED via PausePoint Shield*\n\n")
            warningBuilder.append("Message checked: *${category}*\n")
            warningBuilder.append("─────────────────────\n")
            warningBuilder.append("🛡️ *Truth:* $truth\n")
            warningBuilder.append("👉 *Advisory:* $whatToDo\n")
            if (extractedLinks.isNotEmpty() && allLinksVerified) {
                warningBuilder.append("🔗 *Verified Link:* ${extractedLinks.first().rawUrl}\n")
            }
            warningBuilder.append("─────────────────────\n")
            warningBuilder.append("Protected by PausePoint Sovereign Cyber Defense.")
        }

        return DetailedScanResult(
            score = threatScore,
            isScam = isScam,
            level = level,
            category = category,
            headline = headline,
            trap = trap,
            truth = truth,
            whatToDo = whatToDo,
            detectedLevers = detectedLevers,
            entities = ExtractedEntities(
                links = extractedLinks,
                phoneNumbers = extractedPhones,
                suspiciousPhones = suspiciousPhones,
                upiIds = extractedUpis,
                amounts = extractedAmounts
            ),
            sha256 = sha256,
            timestamp = now,
            whatsappWarning = warningBuilder.toString()
        )
    }

    private fun dissectUrl(urlStr: String): LinkDissection {
        val lower = urlStr.lowercase()
        val cleanDomain = extractDomain(lower)

        // 1. Verified Official Platform Check
        val matchedPlatform = VERIFIED_PLATFORMS.entries.firstOrNull { (k, _) ->
            cleanDomain == k || cleanDomain.endsWith(".$k")
        }
        val isVerifiedPlatform = matchedPlatform != null
        val platformLabel = matchedPlatform?.value ?: ""

        // 2. High-Risk Threat Markers
        val isShortener = SHORTENER_DOMAINS.any { cleanDomain == it || cleanDomain.endsWith(".$it") }
        val hasDangerousExtension = lower.endsWith(".apk") || lower.contains(".apk?") || lower.endsWith(".exe") || lower.endsWith(".scr")
        val isSuspiciousTld = !isVerifiedPlatform && SUSPICIOUS_TLDS.any { cleanDomain.endsWith(".$it") }
        val isRawIpAddress = Pattern.compile("\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b").matcher(cleanDomain).find()

        val isOfficialBank = OFFICIAL_ALLOWLIST.any { cleanDomain == it || cleanDomain.endsWith(".$it") }
        val isImpersonatingBank = !isOfficialBank && !isVerifiedPlatform && BANK_KEYWORDS.any { cleanDomain.contains(it) }

        val redFlags = mutableListOf<String>()
        if (hasDangerousExtension) redFlags.add("Dangerous .APK Dropper")
        if (isShortener) redFlags.add("URL Shortener")
        if (isSuspiciousTld) redFlags.add("Untrusted TLD")
        if (isImpersonatingBank) redFlags.add("Fake Official Domain")
        if (isRawIpAddress) redFlags.add("Raw IP Address")

        val riskSummary = when {
            isVerifiedPlatform -> "$platformLabel ($cleanDomain). Domain is authenticated and safe. Verify group admins before sharing confidential documents."
            hasDangerousExtension -> "Hides a Trojan Android APK file that steals banking OTPs and mirrors screen."
            isShortener -> "Shortened link masks real malicious phishing or malware server."
            isImpersonatingBank -> "Typosquatting domain impersonating official bank or government body."
            isSuspiciousTld -> "Cheap, unverified domain commonly used by cybercrime syndicates."
            isRawIpAddress -> "Direct server IP address without legitimate SSL domain registration."
            else -> "External link with unverified sender credentials."
        }

        return LinkDissection(
            rawUrl = urlStr,
            domain = cleanDomain,
            isShortener = isShortener,
            hasDangerousExtension = hasDangerousExtension,
            isSuspiciousTld = isSuspiciousTld,
            isImpersonatingBank = isImpersonatingBank,
            isRawIpAddress = isRawIpAddress,
            isVerifiedPlatform = isVerifiedPlatform,
            platformLabel = platformLabel,
            riskSummary = riskSummary,
            redFlags = redFlags
        )
    }

    private fun extractDomain(url: String): String {
        var str = url.replace("https://", "").replace("http://", "").replace("www.", "")
        val slashIdx = str.indexOf('/')
        if (slashIdx != -1) {
            str = str.substring(0, slashIdx)
        }
        val colonIdx = str.indexOf(':')
        if (colonIdx != -1) {
            str = str.substring(0, colonIdx)
        }
        return str
    }

    fun isTrai1600Series(phoneNumber: String): Boolean {
        val digits = phoneNumber.replace("\\D".toRegex(), "")
        return digits.startsWith("1600") || digits.startsWith("911600")
    }
}
