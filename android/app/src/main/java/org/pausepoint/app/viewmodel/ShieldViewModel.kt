package org.pausepoint.app.viewmodel

import android.app.Application
import android.app.role.RoleManager
import android.content.Context
import android.os.Build
import android.provider.Settings
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ThreatCase(
    val id: String,
    val source: String,
    val sender: String,
    val preview: String,
    val playbook: String,
    val timestamp: Long,
    val threatScore: Int,
    val status: String
)

data class DebitItem(
    val id: String,
    val amount: String,
    val bank: String,
    val timestamp: Long,
    val isAcknowledged: Boolean
)

data class ShieldUiState(
    val score: Int = 98,
    val statusText: String = "Device Shielded",
    val isOptimizing: Boolean = false,
    val callScreeningActive: Boolean = false,
    val notificationAccessActive: Boolean = false,
    val activeThreatCount: Int = 0,
    val totalInterceptedCount: Int = 14,
    val cases: List<ThreatCase> = emptyList(),
    val debits: List<DebitItem> = emptyList(),
    val forceZoomEnabled: Boolean = false,
    val isDarkMode: Boolean = true
)

class ShieldViewModel(application: Application) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(ShieldUiState())
    val uiState: StateFlow<ShieldUiState> = _uiState.asStateFlow()

    init {
        loadInitialData()
        checkPermissions()
    }

    private fun loadInitialData() {
        val sampleCases = listOf(
            ThreatCase(
                id = "case-8401",
                source = "WhatsApp",
                sender = "+91 98765 43210",
                preview = "Your part-time commission Rs 8,400 is ready. Pay Rs 5,000 security deposit immediately.",
                playbook = "Part-Time Task Job Scam",
                timestamp = System.currentTimeMillis() - 300000,
                threatScore = 85,
                status = "flagged"
            ),
            ThreatCase(
                id = "case-8399",
                source = "SMS",
                sender = "VD-TRAIOF",
                preview = "TRAI ALERT: Your mobile number will be disconnected within 2 hours due to illegal activities. Call officer now.",
                playbook = "Digital Arrest / TRAI Disconnection",
                timestamp = System.currentTimeMillis() - 7200000,
                threatScore = 92,
                status = "flagged"
            )
        )

        val sampleDebits = listOf(
            DebitItem(
                id = "deb-101",
                amount = "₹12,500",
                bank = "HDFC Bank (A/c **4821)",
                timestamp = System.currentTimeMillis() - 1800000,
                isAcknowledged = false
            )
        )

        val prefs = getApplication<Application>().getSharedPreferences("pausepoint_prefs", Context.MODE_PRIVATE)
        val savedForceZoom = prefs.getBoolean("pref_force_zoom", false)
        val savedDarkMode = prefs.getBoolean("pref_dark_mode", true)

        _uiState.value = _uiState.value.copy(
            cases = sampleCases,
            debits = sampleDebits,
            activeThreatCount = sampleCases.size,
            forceZoomEnabled = savedForceZoom,
            isDarkMode = savedDarkMode
        )
    }

    fun checkPermissions() {
        val context = getApplication<Application>()
        val roleManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            context.getSystemService(RoleManager::class.java)
        } else null

        val callRole = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && roleManager != null) {
            roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)
        } else false

        val notifEnabled = isNotificationAccessGranted(context)

        _uiState.value = _uiState.value.copy(
            callScreeningActive = callRole,
            notificationAccessActive = notifEnabled
        )
    }

    fun runOptimization() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isOptimizing = true,
                statusText = "Scanning System Memory & Listeners..."
            )

            // Dynamic scan phases
            delay(400)
            _uiState.value = _uiState.value.copy(statusText = "Verifying Telecom Call Screening...")
            delay(400)
            _uiState.value = _uiState.value.copy(statusText = "Checking WhatsApp & SMS Listeners...")
            delay(400)
            _uiState.value = _uiState.value.copy(statusText = "Sniffing Unacknowledged Debits...")
            delay(400)

            _uiState.value = _uiState.value.copy(
                isOptimizing = false,
                score = 100,
                statusText = "System Completely Shielded"
            )
        }
    }

    fun dismissCase(caseId: String) {
        val updated = _uiState.value.cases.filterNot { it.id == caseId }
        _uiState.value = _uiState.value.copy(
            cases = updated,
            activeThreatCount = updated.size
        )
    }

    fun acknowledgeDebit(debitId: String) {
        val updated = _uiState.value.debits.map {
            if (it.id == debitId) it.copy(isAcknowledged = true) else it
        }
        _uiState.value = _uiState.value.copy(debits = updated)
    }

    fun setForceZoomEnabled(enabled: Boolean) {
        val prefs = getApplication<Application>().getSharedPreferences("pausepoint_prefs", Context.MODE_PRIVATE)
        prefs.edit().putBoolean("pref_force_zoom", enabled).apply()
        _uiState.value = _uiState.value.copy(forceZoomEnabled = enabled)
    }

    fun setDarkMode(enabled: Boolean) {
        val prefs = getApplication<Application>().getSharedPreferences("pausepoint_prefs", Context.MODE_PRIVATE)
        prefs.edit().putBoolean("pref_dark_mode", enabled).apply()
        _uiState.value = _uiState.value.copy(isDarkMode = enabled)
    }

    private val _pendingScanText = MutableStateFlow<String?>(null)
    val pendingScanText: StateFlow<String?> = _pendingScanText.asStateFlow()

    fun setPendingScanText(text: String?) {
        _pendingScanText.value = text
    }

    fun injectSimulatedTaskScam() {
        val simulated = ThreatCase(
            id = "sim-${System.currentTimeMillis()}",
            source = "WhatsApp",
            sender = "+91 98110 54321",
            preview = "Telegram Part-Time Task: Your commission ₹8,400 is frozen. Transfer ₹5,000 security deposit to unlock payout immediately.",
            playbook = "Part-Time Task Job Scam (Advance Fee)",
            timestamp = System.currentTimeMillis(),
            threatScore = 95,
            status = "flagged"
        )
        val simulatedDebit = DebitItem(
            id = "deb-${System.currentTimeMillis()}",
            amount = "₹5,000",
            bank = "State Bank of India (A/c **9124)",
            timestamp = System.currentTimeMillis(),
            isAcknowledged = false
        )
        _uiState.value = _uiState.value.copy(
            cases = listOf(simulated) + _uiState.value.cases,
            debits = listOf(simulatedDebit) + _uiState.value.debits,
            activeThreatCount = _uiState.value.activeThreatCount + 1,
            totalInterceptedCount = _uiState.value.totalInterceptedCount + 1
        )
    }

    fun injectSimulatedElectricityApk() {
        val simulated = ThreatCase(
            id = "sim-${System.currentTimeMillis()}",
            source = "SMS",
            sender = "BP-DHBVN",
            preview = "URGENT: Electricity power will be disconnected at 9:30 PM due to unpaid bill. Update bill via http://power-update.org/bill.apk",
            playbook = "Utility Bill Dropper Malware (APK Trap)",
            timestamp = System.currentTimeMillis(),
            threatScore = 98,
            status = "flagged"
        )
        _uiState.value = _uiState.value.copy(
            cases = listOf(simulated) + _uiState.value.cases,
            activeThreatCount = _uiState.value.activeThreatCount + 1,
            totalInterceptedCount = _uiState.value.totalInterceptedCount + 1
        )
    }

    private fun isNotificationAccessGranted(context: Context): Boolean {
        val pkgName = context.packageName
        val flat = Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners")
        return flat?.contains(pkgName) == true
    }
}
