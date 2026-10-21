package org.pausepoint.app.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import org.pausepoint.app.shield.core.SpeechManager
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PhoneDisabled
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.pausepoint.app.ui.theme.AlertCrimson
import org.pausepoint.app.ui.theme.BorderHairline
import org.pausepoint.app.ui.theme.BorderSubtle
import org.pausepoint.app.ui.theme.BrandCyan
import org.pausepoint.app.ui.theme.BrandEmerald
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
fun CallDefenseScreen(
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val haptic = LocalHapticFeedback.current
    val scrollState = rememberScrollState()

    var callerInput by remember { mutableStateOf("") }
    var callerVerdict by remember { mutableStateOf<CallerAnalysis?>(null) }
    // Audio Guidance
    var isSpeaking by remember { mutableStateOf(false) }

    val reassuranceSpeech = "Attention. Take a deep breath. No police officer or judge in India will ever arrest you on a video call. There is no legal digital arrest. Disconnect the call immediately. You have not broken any law."

    fun toggleSpeech() {
        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
        if (isSpeaking) {
            SpeechManager.stop()
            isSpeaking = false
        } else {
            SpeechManager.speak(reassuranceSpeech, "reassurance_tts")
            isSpeaking = true
        }
    }

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
                        text = "Digital Arrest & Call Defense",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Fake Police / CBI / Customs Protection",
                        fontSize = 11.sp,
                        color = WarningAmber
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
            // 1. REASSURANCE HERO BANNER (Instant calm for panicked citizens)
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, WarningAmber.copy(alpha = 0.4f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = WarningAmber.copy(alpha = 0.15f),
                            modifier = Modifier.size(44.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.Security,
                                    contentDescription = null,
                                    tint = WarningAmber,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                        }

                        // TTS Audio Button
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
                                tint = if (isSpeaking) Color.White else WarningAmber,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isSpeaking) "Stop Audio" else "Listen Aloud",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSpeaking) Color.White else WarningAmber
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "You Are Safe. Take a Deep Breath.",
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Black,
                        color = TextPrimary
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "There is NO legal concept called 'Digital Arrest' under Indian Law. Real police, CBI, ED, customs, or court judges NEVER interrogate citizens or issue arrest warrants over WhatsApp, Skype, or phone calls.",
                        fontSize = 13.sp,
                        color = TextSecondary,
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Emergency 1-tap call to 1930
                    Button(
                        onClick = {
                            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                            val intent = Intent(Intent.ACTION_DIAL).apply {
                                data = Uri.parse("tel:1930")
                            }
                            context.startActivity(intent)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AlertCrimson),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Call,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Call 1930 Cyber Police Now",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }

            // 2. THE 3 GOLDEN DEFENSE RULES
            Text(
                text = "THE 3 GOLDEN DEFENSE RULES",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = TextSecondary,
                letterSpacing = 1.sp
            )

            GoldenRuleCard(
                step = "1",
                title = "Hang Up Immediately",
                subtitle = "Cut the call and block them. You are NOT committing any crime by hanging up on an unauthorized video caller.",
                accentColor = BrandEmerald,
                icon = Icons.Default.PhoneDisabled
            )

            GoldenRuleCard(
                step = "2",
                title = "Demand a Physical Notice",
                subtitle = "Real police in India MUST issue notices under Section 41A CrPC / Section 35 BNSS in writing, delivered to your residence.",
                accentColor = BrandCyan,
                icon = Icons.Default.Info
            )

            GoldenRuleCard(
                step = "3",
                title = "Never Send 'Verification Money'",
                subtitle = "They will ask you to send funds to an 'RBI Escrow or Security Account' to prove innocence. No such account exists. It is 100% theft.",
                accentColor = AlertCrimson,
                icon = Icons.Default.Warning
            )

            // 3. SUSPICIOUS CALLER CHECKER
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(14.dp),
                border = BorderStroke(1.dp, BorderHairline),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = null,
                            tint = BrandCyan,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "CHECK SUSPICIOUS CALLER NUMBER",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = BrandCyan
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = callerInput,
                        onValueChange = { input ->
                            callerInput = input
                            callerVerdict = analyzeCallerNumber(input)
                        },
                        placeholder = {
                            Text("Enter phone number or country code (e.g. +92, +855)...", fontSize = 11.sp, color = TextMuted)
                        },
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Phone,
                            imeAction = ImeAction.Done
                        ),
                        keyboardActions = KeyboardActions(
                            onDone = {
                                callerVerdict = analyzeCallerNumber(callerInput)
                            }
                        ),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandCyan,
                            unfocusedBorderColor = BorderHairline,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedContainerColor = DarkBackground,
                            unfocusedContainerColor = DarkBackground
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    callerVerdict?.let { verdict ->
                        Spacer(modifier = Modifier.height(10.dp))
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (verdict.isHighRisk) AlertCrimson.copy(alpha = 0.12f) else BrandEmerald.copy(alpha = 0.12f),
                            border = BorderStroke(1.dp, if (verdict.isHighRisk) AlertCrimson.copy(alpha = 0.3f) else BrandEmerald.copy(alpha = 0.3f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = verdict.title,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (verdict.isHighRisk) AlertCrimson else BrandEmerald
                                    )
                                    Text(
                                        text = if (verdict.isHighRisk) "HIGH RISK" else "INFO",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace,
                                        color = if (verdict.isHighRisk) AlertCrimson else BrandEmerald
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = verdict.explanation,
                                    fontSize = 11.sp,
                                    color = Color(0xFFCBD5E1),
                                    lineHeight = 15.sp
                                )
                            }
                        }
                    }
                }
            }

            // 4. WHATSAPP FAMILY ALERT SHARE
            Button(
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    val shareText = "⚠️ CYBER ADVISORY: If anyone calls claiming to be Police, CBI, ED, or Customs threatening 'Digital Arrest' or parcel drugs over WhatsApp/Skype, DO NOT PANIC. Disconnect immediately. In India, there is NO such thing as Digital Arrest. Call 1930 to report scams. (Shared via PausePoint Shield)"
                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"
                        putExtra(Intent.EXTRA_TEXT, shareText)
                    }
                    context.startActivity(Intent.createChooser(shareIntent, "Share Cyber Advisory"))
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
                    tint = BrandEmerald,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Share Warning With Family on WhatsApp",
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
private fun GoldenRuleCard(
    step: String,
    title: String,
    subtitle: String,
    accentColor: Color,
    icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, BorderHairline),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.Top
        ) {
            Surface(
                shape = CircleShape,
                color = accentColor.copy(alpha = 0.15f),
                modifier = Modifier.size(36.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = accentColor,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column {
                Text(
                    text = "RULE $step: $title",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = accentColor
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = subtitle,
                    fontSize = 11.sp,
                    color = TextSecondary,
                    lineHeight = 15.sp
                )
            }
        }
    }
}

data class CallerAnalysis(
    val title: String,
    val explanation: String,
    val isHighRisk: Boolean
)

private fun analyzeCallerNumber(raw: String): CallerAnalysis? {
    val clean = raw.trim().replace(" ", "").replace("-", "")
    if (clean.length < 3) return null

    return when {
        clean.startsWith("+92") || clean.startsWith("92") -> {
            CallerAnalysis(
                title = "Pakistan Country Code (+92)",
                explanation = "Extremely high incidence of impersonation syndicates. Real Indian police will never call you from an international number.",
                isHighRisk = true
            )
        }
        clean.startsWith("+855") || clean.startsWith("855") -> {
            CallerAnalysis(
                title = "Cambodia Country Code (+855)",
                explanation = "Identified as a major hub for cyber scam call centers targeting Indian citizens. Block immediately.",
                isHighRisk = true
            )
        }
        clean.startsWith("+95") || clean.startsWith("95") -> {
            CallerAnalysis(
                title = "Myanmar Country Code (+95)",
                explanation = "Known Southeast Asian cyber-fraud compound corridor. High-risk syndicate indicator.",
                isHighRisk = true
            )
        }
        clean.startsWith("+1") || clean.startsWith("1") -> {
            CallerAnalysis(
                title = "US/Canada Number or VoIP Spoof",
                explanation = "Often generated through virtual burner VoIP apps (TextNow, Skype). Indian authorities never operate over foreign VoIP lines.",
                isHighRisk = true
            )
        }
        clean.startsWith("+91") || clean.length == 10 -> {
            CallerAnalysis(
                title = "Domestic Indian Number",
                explanation = "Real police never conduct arrests or investigations via phone or WhatsApp calls. Always request an official physical summons.",
                isHighRisk = true
            )
        }
        else -> {
            CallerAnalysis(
                title = "Foreign / Unknown Prefix",
                explanation = "International numbers calling about Indian legal affairs are almost universally fraudulent.",
                isHighRisk = true
            )
        }
    }
}
