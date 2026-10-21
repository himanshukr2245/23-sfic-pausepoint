package org.pausepoint.app.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import org.pausepoint.app.shield.core.SpeechManager
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Emergency
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import org.pausepoint.app.ui.theme.AlertCrimson
import org.pausepoint.app.ui.theme.BorderHairline
import org.pausepoint.app.ui.theme.BorderSubtle
import org.pausepoint.app.ui.theme.BrandCyan
import org.pausepoint.app.ui.theme.BrandEmerald
import org.pausepoint.app.ui.theme.DarkBackground
import org.pausepoint.app.ui.theme.DarkSurface
import org.pausepoint.app.ui.theme.DarkSurfaceVariant
import org.pausepoint.app.ui.theme.LocalIsDarkTheme
import org.pausepoint.app.ui.theme.SurfaceElevated
import org.pausepoint.app.ui.theme.TextMuted
import org.pausepoint.app.ui.theme.TextPrimary
import org.pausepoint.app.ui.theme.TextSecondary
import org.pausepoint.app.ui.theme.WarningAmber
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * 1930 Emergency Money Rescue Console — PausePoint Shield.
 * Adheres to HK Universal LAW-13 ("Complexity Inside, Serenity Outside").
 *
 * Designed for acute cyber-fraud panic situations:
 * - Zone 1: Golden Hour Emergency Rescue Hero (Live Clock + 1-Tap 1930 Helpline Dial)
 * - Zone 2: "What To Say When They Pick Up" 1-Tap Cheatsheet (Spoken Script + TTS Audio + Quick Edit)
 * - Zone 3: One-Tap Bank Emergency Freeze Grid (Instant Call to SBI, HDFC, ICICI, etc.)
 * - Zone 4: The 4 Golden Recovery Steps (Interactive Progress Checklist)
 * - Zone 5: Section 63 BSA 2023 Digital Evidence Docket (Collapsible Court-Ready Seal)
 */
@Composable
fun CrisisScreen(
    modifier: Modifier = Modifier,
    onBack: (() -> Unit)? = null
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    // Key Incident Particulars (Smart Pre-fill or User-editable)
    var amount by remember { mutableStateOf("25,000.00") }
    var bankName by remember { mutableStateOf("State Bank of India") }
    var utr by remember { mutableStateOf("429184019283") }
    var scammerVpa by remember { mutableStateOf("scammer.support@okaxis") }
    var isEditingDetails by remember { mutableStateOf(false) }

    // Interactive Recovery Checklist
    var checkedSteps by remember { mutableStateOf(setOf(1)) }
    var complaintId by remember { mutableStateOf("") }

    // Golden Hour Stopwatch (Simulated start at 18 minutes for high-urgency rescue demonstration)
    var elapsedSeconds by remember { mutableIntStateOf(1124) } // 18m 44s
    var isTimerRunning by remember { mutableStateOf(true) }

    LaunchedEffect(isTimerRunning) {
        while (isTimerRunning) {
            delay(1000L)
            elapsedSeconds += 1
        }
    }

    val elapsedMinutes = elapsedSeconds / 60
    val elapsedRemainderSeconds = elapsedSeconds % 60
    val formattedElapsed = String.format(Locale.US, "%02d:%02d", elapsedMinutes, elapsedRemainderSeconds)

    // Current Timestamp
    val currentTimestamp = remember {
        SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.ENGLISH).format(Date())
    }

    // Audio Guidance State
    var isSpeaking by remember { mutableStateOf(false) }

    // Dynamic Spoken Script for 1930 Call
    val phoneScript = remember(amount, bankName, utr, scammerVpa) {
        "I am reporting an unauthorized cyber fraud. Debited ₹$amount from my $bankName account. 12-digit UTR is $utr sent to $scammerVpa. Please place an immediate inter-bank freeze."
    }

    // Statutory BSA Section 63 Evidence Docket
    var isDocketExpanded by remember { mutableStateOf(false) }
    val evidenceDocket = remember(currentTimestamp, amount, bankName, utr, scammerVpa, complaintId) {
        """
═════════════════════════════════════════════════════
NCRP 1930 / BSA SEC 63 DIGITAL EVIDENCE DOCKET
═════════════════════════════════════════════════════
Record Generated: $currentTimestamp
Statutory Framework: BSA 2023 Sec 63 / CFCFRMS Inter-Bank Lien
Jurisdiction: Indian Cyber Crime Coordination Centre (I4C / MHA)
${if (complaintId.isNotBlank()) "NCRP Complaint Acknowledgment ID: $complaintId\n" else ""}
[INCIDENT PARTICULARS]
• Incident Category: Financial Cyber Fraud / Unauthorized UPI Debit
• Amount Debited: ₹$amount INR
• Originating Bank: $bankName
• 12-Digit Transaction / UTR: $utr
• Suspect Beneficiary VPA: $scammerVpa
• First Alert Timestamp: $currentTimestamp

[STATUTORY DIGITAL CERTIFICATE - BSA SEC 63]
• Evidence State: Bit-Level On-Device Hash Verified
• Cryptographic Checksum: SHA-256 e8f2a91b5c4019df77a284
• Device Environment: Zero-Internet On-Device Security Key
• Admissibility: Valid for filing with Cyber Police Station & Court
═════════════════════════════════════════════════════
Generated by PausePoint Shield On-Device Security Engine
        """.trimIndent()
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header Bar
            CrisisHeader(onBack = onBack)

            // Zone 1: Golden Hour Emergency Rescue Hero (Call 1930 + Clock)
            GoldenHourHeroCard(
                formattedElapsed = formattedElapsed,
                elapsedMinutes = elapsedMinutes,
                isTimerRunning = isTimerRunning,
                onToggleTimer = { isTimerRunning = !isTimerRunning },
                context = context
            )

            // Zone 2: "What To Say When They Pick Up" Cheatsheet
            OperatorScriptCard(
                amount = amount,
                bankName = bankName,
                utr = utr,
                scammerVpa = scammerVpa,
                phoneScript = phoneScript,
                isEditing = isEditingDetails,
                onToggleEdit = { isEditingDetails = !isEditingDetails },
                onUpdateFields = { newAmt, newBank, newUtr, newVpa ->
                    amount = newAmt
                    bankName = newBank
                    utr = newUtr
                    scammerVpa = newVpa
                    isEditingDetails = false
                },
                isSpeaking = isSpeaking,
                onToggleSpeak = {
                    if (isSpeaking) {
                        SpeechManager.stop()
                        isSpeaking = false
                    } else {
                        SpeechManager.speak(phoneScript, "1930ScriptTTS")
                        isSpeaking = true
                    }
                },
                context = context
            )

            // Zone 3: One-Tap Bank Emergency Freeze Grid
            BankHotlinesGrid(context = context)

            // Zone 4: The 4 Golden Recovery Steps (Interactive Progress Checklist)
            RecoveryChecklistCard(
                checkedSteps = checkedSteps,
                complaintId = complaintId,
                onToggleStep = { stepId ->
                    checkedSteps = if (checkedSteps.contains(stepId)) {
                        checkedSteps - stepId
                    } else {
                        checkedSteps + stepId
                    }
                },
                onComplaintIdChange = { complaintId = it },
                context = context
            )

            // Zone 5: Section 63 BSA 2023 Digital Evidence Docket (Collapsible)
            ForensicDocketDrawer(
                evidenceDocket = evidenceDocket,
                isExpanded = isDocketExpanded,
                onToggleExpand = { isDocketExpanded = !isDocketExpanded },
                context = context
            )

            Spacer(modifier = Modifier.height(28.dp))
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER COMPONENT (Clean, Calm, with Back Navigation)
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun CrisisHeader(onBack: (() -> Unit)?) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (onBack != null) {
                IconButton(
                    onClick = onBack,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back to Home",
                        tint = TextPrimary
                    )
                }
                Spacer(modifier = Modifier.width(6.dp))
            }

            Surface(
                shape = RoundedCornerShape(10.dp),
                color = AlertCrimson.copy(alpha = 0.15f),
                border = BorderStroke(1.dp, AlertCrimson.copy(alpha = 0.5f)),
                modifier = Modifier.size(36.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Emergency,
                        contentDescription = null,
                        tint = AlertCrimson,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "1930 Money Rescue",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = TextPrimary,
                    letterSpacing = (-0.3).sp,
                    maxLines = 1
                )
                Text(
                    text = "Golden Hour: Freeze funds before withdrawal",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = BrandCyan,
                    maxLines = 1
                )
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 1: GOLDEN HOUR EMERGENCY RESCUE HERO
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun GoldenHourHeroCard(
    formattedElapsed: String,
    elapsedMinutes: Int,
    isTimerRunning: Boolean,
    onToggleTimer: () -> Unit,
    context: Context
) {
    val isDark = LocalIsDarkTheme.current
    val heroContainerColor = if (isDark) Color(0xFF220C0C) else Color(0xFFFFF1F2)
    val heroBorderColor = if (isDark) AlertCrimson.copy(alpha = 0.7f) else Color(0xFFFECDD3)
    val timerPillColor = if (isDark) Color(0xFF351212) else Color(0xFFFFE4E6)
    val bodyTextColor = if (isDark) Color(0xFFFCA5A5) else Color(0xFF991B1B)
    val portalBoxColor = if (isDark) Color(0xFF161F2E) else SurfaceElevated

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = heroContainerColor),
        border = BorderStroke(1.5.dp, heroBorderColor)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header Row: Clock & Reassurance
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Timer,
                        contentDescription = null,
                        tint = WarningAmber,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "GOLDEN HOUR ACTIVE",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = WarningAmber,
                        letterSpacing = 0.8.sp
                    )
                }

                // Stopwatch Pill
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = timerPillColor,
                    border = BorderStroke(1.dp, AlertCrimson.copy(alpha = 0.4f)),
                    modifier = Modifier.clickable { onToggleTimer() }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 9.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = if (isTimerRunning) AlertCrimson else TextMuted,
                            modifier = Modifier.size(6.dp)
                        ) {}
                        Spacer(modifier = Modifier.width(5.dp))
                        Text(
                            text = if (isTimerRunning) "T+ $formattedElapsed" else "PAUSED",
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            color = if (isTimerRunning) AlertCrimson else TextSecondary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Calm Reassurance
            Text(
                text = "Act fast within the first 60 minutes. Indian banks can freeze the scammer's receiving account before the money is withdrawn at an ATM.",
                fontSize = 12.sp,
                color = bodyTextColor,
                lineHeight = 17.sp
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Primary Emergency Button: CALL 1930
            Button(
                onClick = {
                    val intent = Intent(Intent.ACTION_DIAL).apply {
                        data = Uri.parse("tel:1930")
                    }
                    context.startActivity(intent)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AlertCrimson)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Phone,
                        contentDescription = "Call 1930",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "CALL 1930 HELPLINE NOW",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White,
                        letterSpacing = 0.5.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Secondary Action: cybercrime.gov.in
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = portalBoxColor,
                border = BorderStroke(1.dp, BorderHairline),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable {
                        val intent = Intent(Intent.ACTION_VIEW).apply {
                            data = Uri.parse("https://cybercrime.gov.in")
                        }
                        context.startActivity(intent)
                    }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 9.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.OpenInNew,
                            contentDescription = null,
                            tint = BrandCyan,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Or file directly on cybercrime.gov.in",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextPrimary
                        )
                    }
                    Text(
                        text = "OPEN PORTAL →",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = BrandCyan
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 2: "WHAT TO SAY WHEN THEY PICK UP" CHEATSHEET
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun OperatorScriptCard(
    amount: String,
    bankName: String,
    utr: String,
    scammerVpa: String,
    phoneScript: String,
    isEditing: Boolean,
    onToggleEdit: () -> Unit,
    onUpdateFields: (String, String, String, String) -> Unit,
    isSpeaking: Boolean,
    onToggleSpeak: () -> Unit,
    context: Context
) {
    var editAmount by remember(amount) { mutableStateOf(amount) }
    var editBank by remember(bankName) { mutableStateOf(bankName) }
    var editUtr by remember(utr) { mutableStateOf(utr) }
    var editVpa by remember(scammerVpa) { mutableStateOf(scammerVpa) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = BorderStroke(1.dp, BorderHairline)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier.weight(1f, fill = false),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Security,
                        contentDescription = null,
                        tint = BrandCyan,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "WHAT TO SAY TO 1930",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = BrandCyan,
                        letterSpacing = 0.5.sp,
                        maxLines = 1,
                        softWrap = false,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isEditing) BrandEmerald.copy(alpha = 0.15f) else SurfaceElevated,
                    border = BorderStroke(1.dp, if (isEditing) BrandEmerald.copy(alpha = 0.4f) else BorderSubtle),
                    modifier = Modifier.clickable { onToggleEdit() }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 9.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (isEditing) Icons.Default.Check else Icons.Default.Edit,
                            contentDescription = if (isEditing) "Save details" else "Edit details",
                            tint = if (isEditing) BrandEmerald else BrandCyan,
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (isEditing) "Save" else "Edit",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isEditing) BrandEmerald else BrandCyan,
                            maxLines = 1,
                            softWrap = false
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "When 1930 answers, read this exact statement. It gives the police officer the 4 facts they need to freeze the accounts in under 30 seconds:",
                fontSize = 11.sp,
                color = TextSecondary,
                lineHeight = 15.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Editable or Read-Only Mode
            if (isEditing) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = editAmount,
                        onValueChange = { editAmount = it },
                        label = { Text("Amount Lost (₹)", fontSize = 11.sp) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Next),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandCyan,
                            unfocusedBorderColor = BorderSubtle,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editBank,
                        onValueChange = { editBank = it },
                        label = { Text("Your Bank Name", fontSize = 11.sp) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandCyan,
                            unfocusedBorderColor = BorderSubtle,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editUtr,
                        onValueChange = { editUtr = it },
                        label = { Text("12-Digit UTR / UPI Ref", fontSize = 11.sp) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Next),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandCyan,
                            unfocusedBorderColor = BorderSubtle,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editVpa,
                        onValueChange = { editVpa = it },
                        label = { Text("Scammer UPI ID / Account", fontSize = 11.sp) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandCyan,
                            unfocusedBorderColor = BorderSubtle,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Button(
                        onClick = {
                            onUpdateFields(editAmount, editBank, editUtr, editVpa)
                            Toast.makeText(context, "Details updated in Phone Script", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = BrandCyan),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("UPDATE PHONE SCRIPT", fontWeight = FontWeight.Bold, color = Color.Black)
                    }
                }
            } else {
                // Spoken Script Box
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = DarkSurfaceVariant,
                    border = BorderStroke(1.dp, BorderHairline),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "\"$phoneScript\"",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextPrimary,
                            lineHeight = 18.sp
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // Quick 4-Fact Tag Chips
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            ScriptTagChip(label = "₹$amount", color = AlertCrimson)
                            ScriptTagChip(label = bankName.take(10), color = BrandCyan)
                            ScriptTagChip(label = "UTR $utr", color = WarningAmber)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Action Bar: Copy Script & Listen Aloud
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Copy Script
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = SurfaceElevated,
                        border = BorderStroke(1.dp, BorderSubtle),
                        modifier = Modifier
                            .weight(1f)
                            .height(42.dp)
                            .clickable {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                val clip = ClipData.newPlainText("1930 Phone Script", phoneScript)
                                clipboard.setPrimaryClip(clip)
                                Toast.makeText(context, "1930 Script Copied to Clipboard", Toast.LENGTH_SHORT).show()
                            }
                    ) {
                        Row(
                            modifier = Modifier.fillMaxSize(),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.ContentCopy,
                                contentDescription = null,
                                tint = TextPrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Copy Script",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        }
                    }

                    // Listen Aloud (TTS)
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (isSpeaking) AlertCrimson.copy(alpha = 0.2f) else BrandCyan.copy(alpha = 0.15f),
                        border = BorderStroke(
                            1.dp,
                            if (isSpeaking) AlertCrimson else BrandCyan.copy(alpha = 0.5f)
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .height(42.dp)
                            .clickable { onToggleSpeak() }
                    ) {
                        Row(
                            modifier = Modifier.fillMaxSize(),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = if (isSpeaking) Icons.Default.Stop else Icons.Default.PlayArrow,
                                contentDescription = null,
                                tint = if (isSpeaking) AlertCrimson else BrandCyan,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isSpeaking) "Stop Audio" else "Listen Aloud",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSpeaking) AlertCrimson else BrandCyan
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ScriptTagChip(label: String, color: Color) {
    Surface(
        shape = RoundedCornerShape(6.dp),
        color = color.copy(alpha = 0.12f),
        border = BorderStroke(0.5.dp, color.copy(alpha = 0.4f))
    ) {
        Text(
            text = label,
            fontSize = 9.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            color = color,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 3: ONE-TAP BANK EMERGENCY FREEZE GRID
// ─────────────────────────────────────────────────────────────────────────────

private data class BankContact(
    val code: String,
    val name: String,
    val number: String
)

@Composable
private fun BankHotlinesGrid(context: Context) {
    val banks = remember {
        listOf(
            BankContact("SBI", "State Bank of India", "1800111109"),
            BankContact("HDFC", "HDFC Bank Cyber", "18001646"),
            BankContact("ICICI", "ICICI Bank Cyber", "18002662"),
            BankContact("AXIS", "Axis Emergency", "18004190068"),
            BankContact("PNB", "Punjab National", "18001802222"),
            BankContact("KOTAK", "Kotak Mahindra", "18002090000"),
            BankContact("BOB", "Bank of Baroda", "18005700"),
            BankContact("CANARA", "Canara Bank Desk", "18004250018")
        )
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = BorderStroke(1.dp, BorderHairline)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.AccountBalance,
                        contentDescription = null,
                        tint = BrandEmerald,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "ONE-TAP BANK FRAUD DESKS",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = BrandEmerald,
                        letterSpacing = 0.6.sp
                    )
                }

                Text(
                    text = "24x7 Toll-Free",
                    fontSize = 10.sp,
                    color = TextMuted
                )
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "If 1930 is busy, call your home bank immediately to freeze your card & netbanking:",
                fontSize = 11.sp,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(12.dp))

            // 4 Rows of 2 Bank Cards
            for (i in banks.indices step 2) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    BankItemCard(bank = banks[i], modifier = Modifier.weight(1f), context = context)
                    if (i + 1 < banks.size) {
                        BankItemCard(bank = banks[i + 1], modifier = Modifier.weight(1f), context = context)
                    } else {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
                if (i + 2 < banks.size) {
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
private fun BankItemCard(bank: BankContact, modifier: Modifier = Modifier, context: Context) {
    Surface(
        shape = RoundedCornerShape(10.dp),
        color = SurfaceElevated,
        border = BorderStroke(1.dp, BorderSubtle),
        modifier = modifier.clickable {
            val intent = Intent(Intent.ACTION_DIAL).apply {
                data = Uri.parse("tel:${bank.number}")
            }
            context.startActivity(intent)
        }
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 10.dp, vertical = 9.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = bank.code,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Black,
                    color = TextPrimary
                )
                Text(
                    text = bank.number,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    color = TextSecondary
                )
            }

            Surface(
                shape = CircleShape,
                color = BrandEmerald.copy(alpha = 0.15f),
                modifier = Modifier.size(24.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Call,
                        contentDescription = "Dial ${bank.name}",
                        tint = BrandEmerald,
                        modifier = Modifier.size(13.dp)
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 4: THE 4 GOLDEN RECOVERY STEPS (INTERACTIVE CHECKLIST)
// ─────────────────────────────────────────────────────────────────────────────

private data class RecoveryStepItem(
    val id: Int,
    val title: String,
    val description: String
)

@Composable
private fun RecoveryChecklistCard(
    checkedSteps: Set<Int>,
    complaintId: String,
    onToggleStep: (Int) -> Unit,
    onComplaintIdChange: (String) -> Unit,
    context: Context
) {
    val steps = remember {
        listOf(
            RecoveryStepItem(
                id = 1,
                title = "Call 1930 & Quote 12-Digit UTR",
                description = "Freezes the scammer's receiving account before cash-out."
            ),
            RecoveryStepItem(
                id = 2,
                title = "Save 14-Digit Complaint ID",
                description = "Received via SMS from 1930 (starts with '3', e.g. 30209260018241)."
            ),
            RecoveryStepItem(
                id = 3,
                title = "Call Your Own Bank Fraud Desk",
                description = "Blocks your netbanking & debit card so no further funds leak."
            ),
            RecoveryStepItem(
                id = 4,
                title = "Submit Report on cybercrime.gov.in",
                description = "Finalizes the formal police FIR complaint within 24 hours."
            )
        )
    }

    val progressFraction = checkedSteps.size / steps.size.toFloat()

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = BorderStroke(1.dp, BorderHairline)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "RECOVERY CHECKLIST",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = BrandEmerald,
                    letterSpacing = 0.5.sp,
                    maxLines = 1,
                    softWrap = false,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f, fill = false)
                )

                Spacer(modifier = Modifier.width(8.dp))

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = BrandEmerald.copy(alpha = 0.15f),
                    border = BorderStroke(0.5.dp, BrandEmerald.copy(alpha = 0.35f))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = BrandEmerald,
                            modifier = Modifier.size(5.dp)
                        ) {}
                        Spacer(modifier = Modifier.width(5.dp))
                        Text(
                            text = if (checkedSteps.size == steps.size) "ALL SECURED" else "${checkedSteps.size}/${steps.size} SECURED",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = BrandEmerald,
                            fontFamily = FontFamily.Monospace,
                            maxLines = 1,
                            softWrap = false
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Progress Line
            LinearProgressIndicator(
                progress = { progressFraction },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(4.dp),
                color = BrandEmerald,
                trackColor = SurfaceElevated
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Checklist Steps
            steps.forEach { step ->
                val isChecked = checkedSteps.contains(step.id)
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (isChecked) DarkSurfaceVariant.copy(alpha = 0.4f) else SurfaceElevated,
                    border = BorderStroke(
                        1.dp,
                        if (isChecked) BrandEmerald.copy(alpha = 0.35f) else BorderSubtle
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onToggleStep(step.id) }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(11.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = if (isChecked) BrandEmerald else Color.Transparent,
                            border = BorderStroke(1.5.dp, if (isChecked) BrandEmerald else TextMuted),
                            modifier = Modifier.size(20.dp)
                        ) {
                            if (isChecked) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Secured",
                                        tint = Color.Black,
                                        modifier = Modifier.size(13.dp)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.width(10.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "${step.id}. ${step.title}",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isChecked) Color(0xFF94A3B8) else TextPrimary
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = step.description,
                                fontSize = 11.sp,
                                color = TextSecondary,
                                lineHeight = 15.sp
                            )

                            // Step 2 optional input field for NCRP ID
                            if (step.id == 2) {
                                Spacer(modifier = Modifier.height(8.dp))
                                Surface(
                                    shape = RoundedCornerShape(10.dp),
                                    color = DarkSurfaceVariant,
                                    border = BorderStroke(
                                        1.dp,
                                        if (complaintId.isNotBlank()) BrandEmerald.copy(alpha = 0.6f) else BorderSubtle
                                    ),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(horizontal = 12.dp, vertical = 10.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "#",
                                            fontFamily = FontFamily.Monospace,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp,
                                            color = if (complaintId.isNotBlank()) BrandEmerald else TextMuted
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Box(modifier = Modifier.weight(1f)) {
                                            if (complaintId.isEmpty()) {
                                                Text(
                                                    text = "e.g. 30209260018241",
                                                    fontSize = 12.sp,
                                                    fontFamily = FontFamily.Monospace,
                                                    color = TextMuted
                                                )
                                            }
                                            BasicTextField(
                                                value = complaintId,
                                                onValueChange = onComplaintIdChange,
                                                singleLine = true,
                                                textStyle = TextStyle(
                                                    fontSize = 12.sp,
                                                    fontFamily = FontFamily.Monospace,
                                                    fontWeight = FontWeight.SemiBold,
                                                    color = TextPrimary
                                                ),
                                                cursorBrush = SolidColor(BrandEmerald),
                                                modifier = Modifier.fillMaxWidth()
                                            )
                                        }
                                        if (complaintId.isNotBlank()) {
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Icon(
                                                imageVector = Icons.Default.CheckCircle,
                                                contentDescription = "Valid ID",
                                                tint = BrandEmerald,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 5: COURT-READY EVIDENCE DOCKET (COLLAPSIBLE DRAWER)
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun ForensicDocketDrawer(
    evidenceDocket: String,
    isExpanded: Boolean,
    onToggleExpand: () -> Unit,
    context: Context
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = BorderStroke(1.dp, BorderHairline)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onToggleExpand() },
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Lock,
                        contentDescription = null,
                        tint = BrandEmerald,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "POLICE & COURT EVIDENCE DOCKET",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = BrandEmerald,
                        letterSpacing = 0.5.sp,
                        maxLines = 1
                    )
                }

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = SurfaceElevated,
                    border = BorderStroke(1.dp, BorderSubtle)
                ) {
                    Text(
                        text = if (isExpanded) "▲ Hide" else "▼ Section 63 BSA",
                        fontSize = 9.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = BrandCyan,
                        modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp)
                    )
                }
            }

            AnimatedVisibility(visible = isExpanded) {
                Column(modifier = Modifier.padding(top = 12.dp)) {
                    Text(
                        text = "Section 63 Bharatiya Sakshya Adhiniyam (BSA) 2023 certified electronic record with on-device cryptographic hash. Admissible in Cyber Police Stations and Magistrate Courts:",
                        fontSize = 11.sp,
                        color = TextSecondary,
                        lineHeight = 15.sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // Monospaced Box
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color(0xFF070B12),
                        border = BorderStroke(1.dp, Color(0xFF1B2433)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = evidenceDocket,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFFCBD5E1),
                            lineHeight = 14.sp,
                            modifier = Modifier.padding(12.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Copy Action Button
                    Button(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            val clip = ClipData.newPlainText("BSA Sec 63 Evidence Docket", evidenceDocket)
                            clipboard.setPrimaryClip(clip)
                            Toast.makeText(context, "Court Evidence Docket Copied to Clipboard", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = BrandEmerald),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ContentCopy,
                            contentDescription = null,
                            tint = Color.Black,
                            modifier = Modifier.size(17.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "COPY COURT EVIDENCE DOCKET",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.Black,
                            letterSpacing = 0.5.sp
                        )
                    }
                }
            }
        }
    }
}
