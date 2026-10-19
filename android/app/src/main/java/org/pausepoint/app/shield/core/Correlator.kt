package org.pausepoint.app.shield.core

data class IncidentCorrelation(
    val caseId: String,
    val initialThreatTimestamp: Long,
    val debitEvents: List<DebitEvent>,
    val totalAmountLost: Double,
    val primarySuspect: String,
    val primaryPlaybook: String,
    val ncrpAckNumber: String? = null
)

object Correlator {
    fun correlate(
        flaggedEvent: ScanResult,
        sender: String,
        threatTimestamp: Long,
        debits: List<DebitEvent>,
        ackNumber: String? = null
    ): IncidentCorrelation {
        val total = debits.mapNotNull { it.amount }.sum()
        val generatedId = "case-" + (threatTimestamp % 10000)

        return IncidentCorrelation(
            caseId = generatedId,
            initialThreatTimestamp = threatTimestamp,
            debitEvents = debits,
            totalAmountLost = total,
            primarySuspect = sender,
            primaryPlaybook = flaggedEvent.playbookName,
            ncrpAckNumber = ackNumber
        )
    }
}
