package org.pausepoint.app.shield.core

import java.util.regex.Pattern

data class DebitEvent(
    val isDebit: Boolean,
    val amount: Double?,
    val utr: String?,
    val payee: String?,
    val rawText: String,
    val timestamp: Long
)

object DebitSniffer {
    private val DEBIT_PATTERN = Pattern.compile(
        "\\b(?:debited|withdrawn|spent|paid|deducted|trf to|vpa)\\b.*?(?:rs\\.?|inr|₹)?\\s?([\\d,]+(?:\\.\\d{1,2})?)",
        Pattern.CASE_INSENSITIVE
    )

    private val UTR_PATTERN = Pattern.compile(
        "\\b(?:ref|utr|rrn|upi ref|txn id)[\\s:]*([0-9]{12})\\b",
        Pattern.CASE_INSENSITIVE
    )

    private val PAYEE_UPI_PATTERN = Pattern.compile(
        "[a-zA-Z0-9._-]+@[a-zA-Z]{2,}",
        Pattern.CASE_INSENSITIVE
    )

    fun inspect(text: String, timestamp: Long = System.currentTimeMillis()): DebitEvent {
        val debitMatcher = DEBIT_PATTERN.matcher(text)
        var amount: Double? = null
        if (debitMatcher.find()) {
            val amtStr = debitMatcher.group(1)?.replace(",", "")
            amount = amtStr?.toDoubleOrNull()
        }

        val utrMatcher = UTR_PATTERN.matcher(text)
        val utr = if (utrMatcher.find()) utrMatcher.group(1) else null

        val payeeMatcher = PAYEE_UPI_PATTERN.matcher(text)
        val payee = if (payeeMatcher.find()) payeeMatcher.group(0) else null

        val isDebit = amount != null || (text.contains("debited", ignoreCase = true) && text.contains("a/c", ignoreCase = true))

        return DebitEvent(
            isDebit = isDebit,
            amount = amount,
            utr = utr,
            payee = payee,
            rawText = text,
            timestamp = timestamp
        )
    }

    fun isWithinGoldenHourWindow(firstPaidAt: Long, currentTime: Long = System.currentTimeMillis()): Boolean {
        val elapsedMillis = currentTime - firstPaidAt
        return elapsedMillis in 0..(72 * 60 * 60 * 1000L) // 72 hours
    }
}
