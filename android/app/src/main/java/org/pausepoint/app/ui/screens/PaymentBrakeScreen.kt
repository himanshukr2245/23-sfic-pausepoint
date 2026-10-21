package org.pausepoint.app.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PanTool
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.pausepoint.app.ui.theme.AlertCrimson
import org.pausepoint.app.ui.theme.BorderHairline
import org.pausepoint.app.ui.theme.BrandCyan
import org.pausepoint.app.ui.theme.BrandEmerald
import org.pausepoint.app.ui.theme.BrandViolet
import org.pausepoint.app.ui.theme.DarkBackground
import org.pausepoint.app.ui.theme.DarkSurface
import org.pausepoint.app.ui.theme.DarkSurfaceVariant
import org.pausepoint.app.ui.theme.SurfaceElevated
import org.pausepoint.app.ui.theme.TextMuted
import org.pausepoint.app.ui.theme.TextPrimary
import org.pausepoint.app.ui.theme.TextSecondary
import org.pausepoint.app.ui.theme.WarningAmber
import java.util.Locale

@Composable
fun PaymentBrakeScreen(
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val haptic = LocalHapticFeedback.current
    val scrollState = rememberScrollState()

    var expandedCardIndex by remember { mutableStateOf<Int?>(0) }
    var phraseUrgency by remember { mutableStateOf(false) }
    var phraseConfidential by remember { mutableStateOf(false) }
    var phraseRefund by remember { mutableStateOf(false) }

    // Audio Guidance
    var isSpeaking by remember { mutableStateOf(false) }

    val audioAdvice = "Stop. If someone is asking you to enter your UPI PIN to receive money, it is a scam. UPI PIN is only used to send money. Never deposit money to unlock part-time task earnings."

    fun toggleSpeech() {
        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
        if (isSpeaking) {
            SpeechManager.stop()
            isSpeaking = false
        } else {
            SpeechManager.speak(audioAdvice, "brake_tts")
            isSpeaking = true
        }
    }

    val redFlagsCount = listOf(phraseUrgency, phraseConfidential, phraseRefund).count { it }

    Scaffold(
        containerColor = DarkBackground,
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = TextPrimary
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                Column {
                    Text(
                        text = "10-Second Payment Brake",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Stop & Verify Before Sending Money",
                        fontSize = 11.sp,
                        color = BrandViolet
                    )
                }
            }
        },
        modifier = modifier.fillMaxSize()
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(scrollState)
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // 1. BRAKE HERO CARD
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, BrandViolet.copy(alpha = 0.5f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = BrandViolet.copy(alpha = 0.15f),
                            modifier = Modifier.size(44.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.PanTool,
                                    contentDescription = null,
                                    tint = BrandViolet,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                        }

                        Button(
                            onClick = { toggleSpeech() },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isSpeaking) AlertCrimson else SurfaceElevated
                            ),
                            shape = RoundedCornerShape(20.dp),
                            border = BorderStroke(1.dp, if (isSpeaking) AlertCrimson else BorderHairline),
                            modifier = Modifier.height(36.dp)
                        ) {
                            Icon(
                                imageVector = if (isSpeaking) Icons.Default.Stop else Icons.Default.PlayArrow,
                                contentDescription = null,
                                tint = if (isSpeaking) Color.White else BrandViolet,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isSpeaking) "Stop Audio" else "Listen",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSpeaking) Color.White else BrandViolet
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "STOP. Don't Press Send Just Yet.",
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Black,
                        color = TextPrimary
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Once money leaves your bank account or UPI app, recovering it is extremely hard. Most payment scams rely on rushing you into panic. Take 10 seconds to check below:",
                        fontSize = 13.sp,
                        color = TextSecondary,
                        lineHeight = 18.sp
                    )
                }
            }

            // 2. DID THEY SAY ANY OF THESE PHRASES? (Interactive red flag checklist)
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(14.dp),
                border = BorderStroke(1.dp, if (redFlagsCount > 0) AlertCrimson.copy(alpha = 0.5f) else BorderHairline),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "DID THEY USE ANY OF THESE 3 PHRASES?",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (redFlagsCount > 0) AlertCrimson else WarningAmber,
                        letterSpacing = 1.sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    PhraseCheckRow(
                        checked = phraseUrgency,
                        onCheckedChange = { phraseUrgency = it },
                        text = "\"You have only 15 minutes or your account/power will be blocked\""
                    )

                    PhraseCheckRow(
                        checked = phraseConfidential,
                        onCheckedChange = { phraseConfidential = it },
                        text = "\"Keep this call strictly confidential. Do not tell your family\""
                    )

                    PhraseCheckRow(
                        checked = phraseRefund,
                        onCheckedChange = { phraseRefund = it },
                        text = "\"Transfer funds to this safety account; it will be refunded in 30 minutes\""
                    )

                    if (redFlagsCount > 0) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = AlertCrimson.copy(alpha = 0.15f),
                            border = BorderStroke(1.dp, AlertCrimson.copy(alpha = 0.4f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Warning,
                                    contentDescription = null,
                                    tint = AlertCrimson,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "100% SCAM ALERT! These phrases are psychological coercion tricks used by cyber cartels. DO NOT SEND MONEY.",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AlertCrimson,
                                    lineHeight = 15.sp
                                )
                            }
                        }
                    }
                }
            }

            // 3. COMMON DANGEROUS SCENARIOS
            Text(
                text = "WHICH ONE MATCHES YOUR SITUATION?",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = TextSecondary,
                letterSpacing = 1.sp
            )

            ScenarioCard(
                index = 0,
                isExpanded = expandedCardIndex == 0,
                onToggle = {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    expandedCardIndex = if (expandedCardIndex == 0) null else 0
                },
                title = "1. \"Enter your UPI PIN to receive money / prize\"",
                verdict = "100% FRAUD TRAP",
                verdictColor = AlertCrimson,
                explanation = "A UPI PIN is ONLY entered when money leaves your bank account. You NEVER need to enter a PIN or scan a QR code to receive money. If you type your PIN, money will be deducted from you instantly.",
                rule = "Never enter your PIN to get paid."
            )

            ScenarioCard(
                index = 1,
                isExpanded = expandedCardIndex == 1,
                onToggle = {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    expandedCardIndex = if (expandedCardIndex == 1) null else 1
                },
                title = "2. \"Deposit money to unlock your part-time earnings\"",
                verdict = "100% TASK SCAM",
                verdictColor = AlertCrimson,
                explanation = "Any company or Telegram group asking you to pay a 'deposit', 'tax', or 'order level unlock fee' to withdraw earned commission is a criminal syndicate. You will NEVER get back any money you deposit.",
                rule = "Real jobs pay you; you never pay them."
            )

            ScenarioCard(
                index = 2,
                isExpanded = expandedCardIndex == 2,
                onToggle = {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    expandedCardIndex = if (expandedCardIndex == 2) null else 2
                },
                title = "3. \"Install AnyDesk or RustDesk to fix your account\"",
                verdict = "100% SCREEN TAKEOVER",
                verdictColor = AlertCrimson,
                explanation = "These are remote desktop apps. Once installed and you give them the code, the caller can see your screen, intercept your banking OTPs, and drain your savings while distracting you on call.",
                rule = "Uninstall AnyDesk/RustDesk immediately."
            )

            ScenarioCard(
                index = 3,
                isExpanded = expandedCardIndex == 3,
                onToggle = {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    expandedCardIndex = if (expandedCardIndex == 3) null else 3
                },
                title = "4. \"VIP WhatsApp Stock / Crypto Investment Group\"",
                verdict = "100% FAKE TRADING APP",
                verdictColor = AlertCrimson,
                explanation = "The profits and balances shown in the group or on their custom APK/website are completely fake numbers typed by scammers. Once you deposit your savings, you will never be allowed to withdraw.",
                rule = "Only invest through SEBI-registered brokers."
            )

            // 4. ACTION BUTTONS
            Button(
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    val shareText = "⚠️ WARNING FOR FAMILY & FRIENDS:\n1. Never enter your UPI PIN to receive money (PIN is ONLY used to send money).\n2. Never deposit money to withdraw 'task earnings' on Telegram.\n3. Never install AnyDesk/RustDesk on anyone's instructions.\n\nProtect your savings! (Shared via PausePoint Shield)"
                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"
                        putExtra(Intent.EXTRA_TEXT, shareText)
                    }
                    context.startActivity(Intent.createChooser(shareIntent, "Share Payment Safety Advice"))
                },
                colors = ButtonDefaults.buttonColors(containerColor = DarkSurfaceVariant),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, BorderHairline),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Share,
                    contentDescription = null,
                    tint = BrandViolet,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Share Safety Rules on WhatsApp",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextPrimary
                )
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
private fun PhraseCheckRow(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    text: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!checked) }
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = CheckboxDefaults.colors(
                checkedColor = AlertCrimson,
                uncheckedColor = TextMuted,
                checkmarkColor = Color.White
            )
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = text,
            fontSize = 12.sp,
            color = if (checked) TextPrimary else TextSecondary,
            lineHeight = 16.sp
        )
    }
}

@Composable
private fun ScenarioCard(
    index: Int,
    isExpanded: Boolean,
    onToggle: () -> Unit,
    title: String,
    verdict: String,
    verdictColor: Color,
    explanation: String,
    rule: String
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, if (isExpanded) verdictColor.copy(alpha = 0.5f) else BorderHairline),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onToggle() }
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary,
                    modifier = Modifier.weight(1f)
                )
                Icon(
                    imageVector = if (isExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                    contentDescription = null,
                    tint = TextSecondary,
                    modifier = Modifier.size(20.dp)
                )
            }

            AnimatedVisibility(visible = isExpanded) {
                Column(modifier = Modifier.padding(top = 10.dp)) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = verdictColor.copy(alpha = 0.15f),
                        border = BorderStroke(1.dp, verdictColor.copy(alpha = 0.3f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                tint = verdictColor,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "VERDICT: $verdict",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                color = verdictColor,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = explanation,
                        fontSize = 12.sp,
                        color = Color(0xFFCBD5E1),
                        lineHeight = 16.sp
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = SurfaceElevated,
                        border = BorderStroke(0.5.dp, BorderHairline),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "💡 GOLDEN RULE: $rule",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = BrandEmerald,
                            modifier = Modifier.padding(8.dp)
                        )
                    }
                }
            }
        }
    }
}
