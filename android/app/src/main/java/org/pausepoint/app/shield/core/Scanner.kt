package org.pausepoint.app.shield.core

import java.util.regex.Pattern

data class ScanResult(
    val score: Int,
    val level: String, // "danger", "suspicious", "low"
    val headline: String,
    val playbookName: String,
    val truth: String,
    val detectedLevers: List<String>,
    val containsHighRiskLink: Boolean
)

object Scanner {
    private val LEVER_PATTERNS = listOf(
        Pair("Urgency", Pattern.compile("\\b(urgent(?:ly)?|immediately|right now|act now|asap|within \\d+\\s*(?:hours?|hrs?|minutes?|mins?)|today only|last chance|expires? soon|turant|abhi|jaldi)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Fear / Threat", Pattern.compile("\\b(blocked|suspended|deactivated|disconnected|disconnection|legal action|arrest(?:ed)?|warrant|penalty|fine of|FIR|frozen|money laundering|drugs?|police karyawahi|giraftar)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Fake Authority", Pattern.compile("\\b(RBI|SEBI|CBI|ED officer|customs|income ?tax|TRAI|DOT|police|cyber ?cell|crime branch|narcotics|NCB|court|UIDAI|electricity (?:board|department)|parivahan)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Greed / Reward", Pattern.compile("\\b(won|winner|lottery|prize|cashback|reward|lucky draw|KBC|refund|bonus|earn rs|part[- ]time job|work from home|guaranteed profit)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Secrecy / Isolation", Pattern.compile("\\b(don't tell|do not (?:tell|inform|share with)|keep (?:this )?secret|confidential|room alone|lock (?:the )?door|kisi ko mat batana)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Credential Harvesting", Pattern.compile("\\b(share otp|send otp|enter otp|verify otp|upi pin|atm pin|cvv|password|netbanking password|kyc update|pan card update)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Remote Access App", Pattern.compile("\\b(AnyDesk|TeamViewer|RustDesk|QuickSupport|AirDroid|screen share|install this app|download (?:this )?apk)\\b", Pattern.CASE_INSENSITIVE)),
        Pair("Fee Brake / Repeat Demand", Pattern.compile("\\b(pay (?:rs|inr|₹)?\\s?\\d+.*(?:unlock|commission|withdraw|release|refund|tax|gst)|commission.*pay.*unlock)\\b", Pattern.CASE_INSENSITIVE))
    )

    private val PLAYBOOKS = listOf(
        Triple(
            "Task / Part-Time Job Scam",
            Pattern.compile("\\b(commission|telegram task|youtube like|rating task|pay.*unlock withdrawal|prepaid task)\\b", Pattern.CASE_INSENSITIVE),
            "Legitimate companies never ask you to pay your own money to withdraw money you earned."
        ),
        Triple(
            "Digital Arrest / Fake Police Impersonation",
            Pattern.compile("\\b(skype|video call|cbi|narcotics|customs package|illegal drugs|arrest warrant|stay on call)\\b", Pattern.CASE_INSENSITIVE),
            "Indian law enforcement agencies (CBI, Police, Customs) never conduct investigations or arrest suspects over video calls."
        ),
        Triple(
            "Electricity Disconnection Trap",
            Pattern.compile("\\b(electricity|power|bill unpaid|disconnected tonight|contact officer)\\b", Pattern.CASE_INSENSITIVE),
            "Electricity disconnections are never scheduled for tonight without prior physical notices sent by postal mail."
        ),
        Triple(
            "Bank / KYC Block Extortion",
            Pattern.compile("\\b(kyc expired|account blocked|pan update|sbi-kyc|hdfc-kyc|pnb-kyc)\\b", Pattern.CASE_INSENSITIVE),
            "Banks never send short-code SMS with suspicious web links asking you to update PAN or Aadhaar online."
        )
    )

    private val HIGH_RISK_LINK_PATTERN = Pattern.compile("https?://[^\\s/$.?#].[^\\s]*\\.(top|xyz|club|click|vip|cc|tk|ml|ga|cf|gq|apk)\\b", Pattern.CASE_INSENSITIVE)

    fun scan(text: String, sender: String = ""): ScanResult {
        var score = 0
        val detected = mutableListOf<String>()

        for ((label, pattern) in LEVER_PATTERNS) {
            if (pattern.matcher(text).find()) {
                score += 15
                detected.add(label)
            }
        }

        var matchedPlaybook = "Unidentified Pattern"
        var truth = "Always verify independently through official numbers. Scammers use urgency to prevent consultation."

        for ((name, pattern, truthStr) in PLAYBOOKS) {
            if (pattern.matcher(text).find()) {
                score += 35
                matchedPlaybook = name
                truth = truthStr
                break
            }
        }

        val hasHighRiskLink = HIGH_RISK_LINK_PATTERN.matcher(text).find()
        if (hasHighRiskLink) {
            score += 40
        }

        // TRAI 1600 series vs 10-digit mobile detection
        if (sender.isNotBlank()) {
            val is10DigitMobile = sender.replace("\\D".toRegex(), "").length == 10
            if (is10DigitMobile && (detected.contains("Fake Authority") || detected.contains("Fear / Threat"))) {
                score += 20
            }
        }

        score = score.coerceIn(0, 100)
        val level = when {
            score >= 60 || hasHighRiskLink -> "danger"
            score >= 30 -> "suspicious"
            else -> "low"
        }

        val headline = when (level) {
            "danger" -> "STOP. High-confidence scam vector identified."
            "suspicious" -> "PAUSE. Suspicious psychological levers detected."
            else -> "Safe. No known scam levers found."
        }

        return ScanResult(
            score = score,
            level = level,
            headline = headline,
            playbookName = matchedPlaybook,
            truth = truth,
            detectedLevers = detected,
            containsHighRiskLink = hasHighRiskLink
        )
    }

    fun isTrai1600Series(phoneNumber: String): Boolean {
        val digits = phoneNumber.replace("\\D".toRegex(), "")
        return digits.startsWith("1600") || digits.startsWith("911600")
    }
}
