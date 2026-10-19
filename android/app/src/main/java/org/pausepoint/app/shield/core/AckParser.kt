package org.pausepoint.app.shield.core

import java.util.regex.Pattern

data class AckResult(
    val ackNumber: String?,
    val isValidNcrp: Boolean,
    val rawText: String
)

object AckParser {
    // 14-digit acknowledgement number starting with 3 (NCRP standard)
    private val NCRP_ACK_PATTERN = Pattern.compile(
        "\\b(?:ack(?:nowledgement)?\\s*(?:no\\.?|number)?[:\\s]*)(3\\d{13})\\b",
        Pattern.CASE_INSENSITIVE
    )

    private val GENERIC_ACK_PATTERN = Pattern.compile(
        "\\b(3\\d{13})\\b"
    )

    fun parse(text: String): AckResult {
        val specificMatcher = NCRP_ACK_PATTERN.matcher(text)
        if (specificMatcher.find()) {
            val num = specificMatcher.group(1)
            return AckResult(ackNumber = num, isValidNcrp = true, rawText = text)
        }

        val genericMatcher = GENERIC_ACK_PATTERN.matcher(text)
        if (genericMatcher.find()) {
            val num = genericMatcher.group(1)
            return AckResult(ackNumber = num, isValidNcrp = true, rawText = text)
        }

        return AckResult(ackNumber = null, isValidNcrp = false, rawText = text)
    }
}
