package org.pausepoint.app.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.ContentPaste
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Psychology
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
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.pausepoint.app.shield.core.DetailedScanResult
import org.pausepoint.app.shield.core.LinkDissection
import org.pausepoint.app.shield.core.Scanner
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
import org.pausepoint.app.viewmodel.ShieldViewModel
import java.util.Locale

/**
 * PausePoint Shield — Check Scam Screen (X-Ray Citizen Scanner)
 *
 * Implements HK Universal LAW-13: "Complexity Inside, Serenity Outside".
 * - 0ms On-Device Forensics
 * - Harmful Link & URL Dissector
 * - 12 Canonical Psychological Levers
 * - 11 Real Indian Cybercrime Playbooks
 * - 3 Pillars of Truth Verdict (Trap, Truth, Action)
 * - 1-Tap TTS Audio & WhatsApp Family Broadcast
 * - Section 63 BSA 2023 Digital Evidence Stamp
 */

private data class ScannedHistoryItem(
    val id: Long,
    val text: String,
    val result: DetailedScanResult
)

@Composable
fun XRayScreen(
    viewModel: ShieldViewModel,
    onBack: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current
    val context = LocalContext.current
    val clipboard = LocalClipboardManager.current

    var scannerInput by remember { mutableStateOf("") }
    var scanResult by remember { mutableStateOf<DetailedScanResult?>(null) }
    var isSpeaking by remember { mutableStateOf(false) }
    var showLegalDocket by remember { mutableStateOf(false) }

    // Session History
    val sessionHistory = remember { mutableStateListOf<ScannedHistoryItem>() }

    fun executeScan(textToScan: String) {
        if (textToScan.isBlank()) return
        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
        val result = Scanner.scan(textToScan)
        scanResult = result
        scannerInput = textToScan

        // Push to history if unique
        if (sessionHistory.none { it.text == textToScan }) {
            sessionHistory.add(0, ScannedHistoryItem(System.currentTimeMillis(), textToScan, result))
            if (sessionHistory.size > 8) sessionHistory.removeLast()
        }
    }

    fun toggleSpeech(text: String) {
        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
        if (isSpeaking) {
            org.pausepoint.app.shield.core.SpeechManager.stop()
            isSpeaking = false
        } else {
            org.pausepoint.app.shield.core.SpeechManager.speak(text, "xray_speech")
            isSpeaking = true
        }
    }

    fun shareOnWhatsApp(warningMessage: String) {
        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
        try {
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, warningMessage)
                setPackage("com.whatsapp")
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            val genericIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, warningMessage)
            }
            context.startActivity(Intent.createChooser(genericIntent, "Share Cyber Alert"))
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // ── TOP BAR HEADER ──
            item(key = "header") {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (onBack != null) {
                        IconButton(
                            onClick = {
                                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                onBack()
                            },
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
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Check a Message or Link",
                            fontSize = 19.sp,
                            fontWeight = FontWeight.Black,
                            color = TextPrimary,
                            maxLines = 1,
                            softWrap = false,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = "Instant On-Device Forensics",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = BrandCyan,
                            maxLines = 1,
                            softWrap = false,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }

            // ── ZONE 1: SCANNER HERO COMMAND INPUT CARD ──
            item(key = "scanner_input_card") {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    border = BorderStroke(1.dp, if (scanResult != null && scanResult!!.isScam) AlertCrimson.copy(alpha = 0.4f) else BorderHairline)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Security,
                                    contentDescription = null,
                                    tint = BrandCyan,
                                    modifier = Modifier.size(15.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "LIVE CITIZEN SCANNER",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Black,
                                    color = BrandCyan,
                                    letterSpacing = 0.6.sp
                                )
                            }

                            if (scannerInput.isNotBlank()) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = AlertCrimson.copy(alpha = 0.15f),
                                    modifier = Modifier.clickable {
                                        scannerInput = ""
                                        scanResult = null
                                        org.pausepoint.app.shield.core.SpeechManager.stop()
                                        isSpeaking = false
                                    }
                                ) {
                                    Text(
                                        text = "✕ Clear",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = AlertCrimson,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                        softWrap = false
                                    )
                                }
                            } else {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = BrandCyan.copy(alpha = 0.15f),
                                    border = BorderStroke(0.5.dp, BrandCyan.copy(alpha = 0.4f)),
                                    modifier = Modifier.clickable {
                                        val clip = clipboard.getText()?.text
                                        if (!clip.isNullOrBlank()) {
                                            scannerInput = clip
                                            executeScan(clip)
                                        } else {
                                            Toast.makeText(context, "Clipboard is empty! Copy a message first.", Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.ContentPaste,
                                            contentDescription = "Paste",
                                            tint = BrandCyan,
                                            modifier = Modifier.size(11.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "Paste",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = BrandCyan,
                                            softWrap = false
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Text Field Input: Clean, Unobstructed Multi-line Text Area
                        OutlinedTextField(
                            value = scannerInput,
                            onValueChange = { scannerInput = it },
                            placeholder = {
                                Text(
                                    text = "Paste suspicious SMS, WhatsApp message, or link to inspect...",
                                    fontSize = 13.sp,
                                    lineHeight = 18.sp,
                                    color = TextMuted
                                )
                            },
                            textStyle = androidx.compose.ui.text.TextStyle(
                                fontSize = 14.sp,
                                lineHeight = 20.sp,
                                color = TextPrimary
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(min = 105.dp, max = 150.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = DarkBackground,
                                unfocusedContainerColor = DarkBackground,
                                focusedBorderColor = BrandCyan,
                                unfocusedBorderColor = BorderSubtle,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            ),
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                            keyboardActions = KeyboardActions(onDone = { executeScan(scannerInput) })
                        )

                        // ── Dedicated Metadata Sub-Bar (Outside & Below Input Box) ──
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 2.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            if (scannerInput.isNotBlank()) {
                                val hasLink = remember(scannerInput) {
                                    scannerInput.contains("http://", ignoreCase = true) ||
                                    scannerInput.contains("https://", ignoreCase = true) ||
                                    scannerInput.contains(".xyz", ignoreCase = true) ||
                                    scannerInput.contains(".apk", ignoreCase = true) ||
                                    scannerInput.contains(".top", ignoreCase = true) ||
                                    scannerInput.contains(".site", ignoreCase = true)
                                }
                                if (hasLink) {
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = WarningAmber.copy(alpha = 0.15f),
                                        border = BorderStroke(0.5.dp, WarningAmber.copy(alpha = 0.4f))
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Link,
                                                contentDescription = null,
                                                tint = WarningAmber,
                                                modifier = Modifier.size(11.dp)
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(
                                                text = "Link detected",
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = WarningAmber,
                                                fontFamily = FontFamily.Monospace
                                            )
                                        }
                                    }
                                } else {
                                    Text(
                                        text = "⚡ Instant on-device analysis",
                                        fontSize = 11.sp,
                                        color = TextMuted
                                    )
                                }

                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = DarkSurfaceVariant,
                                    border = BorderStroke(0.5.dp, BorderHairline)
                                ) {
                                    Text(
                                        text = "${scannerInput.length} chars",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        fontFamily = FontFamily.Monospace,
                                        color = TextSecondary,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            } else {
                                Text(
                                    text = "Supports SMS, WhatsApp texts, & APK links",
                                    fontSize = 11.sp,
                                    color = TextMuted
                                )
                                Text(
                                    text = "0 chars",
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace,
                                    color = TextMuted
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        // 1-Tap CTA Action Button
                        val isDark = LocalIsDarkTheme.current
                        val isInputPresent = scannerInput.isNotBlank()
                        val ctaBgColor = if (isInputPresent) {
                            BrandCyan
                        } else {
                            if (isDark) Color(0xFF0F1B2E) else Color(0xFF0F172A)
                        }
                        val ctaTextColor = if (isInputPresent) {
                            if (isDark) Color.Black else Color.White
                        } else {
                            Color.White
                        }
                        val ctaIconColor = if (isInputPresent) {
                            if (isDark) Color.Black else Color.White
                        } else {
                            BrandCyan
                        }
                        val ctaBorder = if (isInputPresent) {
                            null
                        } else {
                            BorderStroke(1.dp, BrandCyan.copy(alpha = 0.45f))
                        }

                        Button(
                            onClick = {
                                val clip = clipboard.getText()?.text
                                if (scannerInput.isNotBlank()) {
                                    executeScan(scannerInput)
                                } else if (!clip.isNullOrBlank()) {
                                    scannerInput = clip
                                    executeScan(clip)
                                } else {
                                    Toast.makeText(context, "Clipboard is empty! Copy a message first.", Toast.LENGTH_SHORT).show()
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(46.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = ctaBgColor),
                            border = ctaBorder
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = if (isInputPresent) Icons.Default.Security else Icons.Default.ContentPaste,
                                    contentDescription = null,
                                    tint = ctaIconColor,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = if (isInputPresent) "Analyze Message & Links Now" else "Paste from Clipboard & Scan",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ctaTextColor,
                                    letterSpacing = 0.3.sp,
                                    softWrap = false
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Quick Test Chips
                        Text(
                            text = "Or tap a real scam sample to test on-device:",
                            fontSize = 10.sp,
                            color = TextSecondary
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        val samples = listOf(
                            Pair("⚡ Electricity Cut", "Dear consumer, your electricity power will be disconnected tonight at 9:30 PM because your bill was not updated. Please call our power officer immediately at 9821045920 or install http://bescom-bill.xyz/update.apk to avoid disconnection."),
                            Pair("👮 Digital Arrest (CBI)", "CBI HQ New Delhi Notice: An arrest warrant has been issued against you under Narcotics Act. Narcotics seized in FedEx parcel sent from Mumbai to Taiwan in your name. Connect on Skype video call immediately for asset verification or face instant arrest."),
                            Pair("💼 Telegram Task Job", "Part-Time Job Offer: Earn ₹3,000 to ₹8,000 daily working from home! Simply like YouTube videos and write reviews. Telegram group: https://t.me/vip_tasks_daily. Pay ₹500 prepaid deposit to unlock your withdrawal commission."),
                            Pair("🏦 Bank KYC Phishing", "Dear SBI customer, your YONO NetBanking account has been suspended today due to pending PAN card update. Update your details within 24 hours to avoid permanent block: http://bit.ly/sbi-yono-update"),
                            Pair("🚗 e-Challan APK Link", "Traffic Police Notice: Pending e-Challan of ₹1,500 detected on vehicle DL-01-AB-1234. Pay immediately or vehicle will be seized. Download official e-Challan app: http://traffic-police.top/challan.apk"),
                            Pair("💸 UPI Cashback Trap", "Congratulations! You won ₹2,499 PhonePe cashback in Google Pay Lucky Draw. Scan this QR code or enter your UPI PIN to claim and credit the cashback directly to your bank account."),
                            Pair("📦 Customs Parcel Trap", "Customs Department Mumbai: Your courier parcel contains passport and MDMA narcotics drugs. Mumbai Cyber Crime branch is initiating money laundering case. Pay clearance fee of ₹25,000 to avoid arrest.")
                        )

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            for ((label, sampleText) in samples) {
                                SampleScamChip(label = label) {
                                    executeScan(sampleText)
                                }
                            }
                        }
                    }
                }
            }

            // ── ZONE 2: HARMFUL LINK & DOMAIN SAFETY CAPSULE ──
            scanResult?.let { res ->
                if (res.entities.links.isNotEmpty()) {
                    item(key = "link_safety_capsule") {
                        LinkSafetyCapsule(links = res.entities.links, context = context)
                    }
                }
            }

            // ── ZONE 3: DECISIVE 3-PILLARS VERDICT CARD ──
            scanResult?.let { res ->
                item(key = "verdict_card") {
                    VerdictCard(
                        result = res,
                        isSpeaking = isSpeaking,
                        onToggleSpeech = {
                            val speechText = "${res.headline}. The trap: ${res.trap}. The truth: ${res.truth}. What to do: ${res.whatToDo}"
                            toggleSpeech(speechText)
                        },
                        onShareWhatsApp = { shareOnWhatsApp(res.whatsappWarning) },
                        showLegalDocket = showLegalDocket,
                        onToggleDocket = { showLegalDocket = !showLegalDocket },
                        context = context
                    )
                }
            }

            // ── ZONE 6: RECENT SCANNED SESSION HISTORY ──
            item(key = "history_header") {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.History,
                            contentDescription = null,
                            tint = TextSecondary,
                            modifier = Modifier.size(15.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "RECENT SCANNED MESSAGES (${sessionHistory.size})",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextSecondary,
                            letterSpacing = 0.8.sp
                        )
                    }

                    if (sessionHistory.isNotEmpty()) {
                        Text(
                            text = "Clear All",
                            fontSize = 11.sp,
                            color = TextMuted,
                            modifier = Modifier.clickable {
                                sessionHistory.clear()
                                Toast.makeText(context, "Scan history cleared", Toast.LENGTH_SHORT).show()
                            }
                        )
                    }
                }
            }

            if (sessionHistory.isEmpty()) {
                item(key = "history_empty") {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        border = BorderStroke(0.5.dp, BorderHairline)
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Psychology,
                                contentDescription = null,
                                tint = BrandCyan,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "Ready to Inspect Incoming Traffic",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "Paste any message, SMS, or link above to run forensics.",
                                    fontSize = 10.sp,
                                    color = TextMuted
                                )
                            }
                        }
                    }
                }
            } else {
                items(sessionHistory, key = { "scan_hist_${it.id}" }) { item ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                scannerInput = item.text
                                scanResult = item.result
                            },
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        border = BorderStroke(1.dp, if (item.result.isScam) AlertCrimson.copy(alpha = 0.35f) else BrandEmerald.copy(alpha = 0.35f))
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = if (item.result.isScam) AlertCrimson.copy(alpha = 0.15f) else BrandEmerald.copy(alpha = 0.15f)
                                ) {
                                    Text(
                                        text = if (item.result.isScam) "SCAM (${item.result.score}%)" else "SAFE",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (item.result.isScam) AlertCrimson else BrandEmerald,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                        fontFamily = FontFamily.Monospace
                                    )
                                }

                                Text(
                                    text = item.result.timestamp,
                                    fontSize = 9.sp,
                                    color = TextMuted,
                                    fontFamily = FontFamily.Monospace
                                )
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            Text(
                                text = item.text,
                                fontSize = 12.sp,
                                color = TextPrimary,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }

            item(key = "bottom_spacer") {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: SAMPLE QUICK TEST CHIP
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun SampleScamChip(
    label: String,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = DarkSurfaceVariant,
        border = BorderStroke(0.5.dp, BorderSubtle),
        modifier = Modifier.clickable { onClick() }
    ) {
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = TextSecondary,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            softWrap = false
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: ZONE 2 — HARMFUL LINK & DOMAIN SAFETY CAPSULE
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun LinkSafetyCapsule(
    links: List<LinkDissection>,
    context: Context
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = BorderStroke(1.dp, AlertCrimson.copy(alpha = 0.5f))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
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
                        imageVector = Icons.Default.Link,
                        contentDescription = null,
                        tint = AlertCrimson,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "HARMFUL LINK DETECTED",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = AlertCrimson,
                        letterSpacing = 0.6.sp,
                        maxLines = 1,
                        softWrap = false,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = AlertCrimson.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = "DO NOT OPEN",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Black,
                        color = AlertCrimson,
                        softWrap = false,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            for (link in links) {
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = DarkBackground,
                    border = BorderStroke(0.5.dp, BorderSubtle),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = link.domain,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black,
                                color = TextPrimary,
                                fontFamily = FontFamily.Monospace,
                                modifier = Modifier.weight(1f, fill = false),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )

                            Spacer(modifier = Modifier.width(6.dp))

                            // Red Flag Badges
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                for (flag in link.redFlags.take(2)) {
                                    Surface(
                                        shape = RoundedCornerShape(4.dp),
                                        color = AlertCrimson.copy(alpha = 0.2f)
                                    ) {
                                        Text(
                                            text = flag,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = AlertCrimson,
                                            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp),
                                            softWrap = false
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = link.rawUrl,
                            fontSize = 10.sp,
                            color = TextMuted,
                            fontFamily = FontFamily.Monospace,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = "⚠️ ${link.riskSummary}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = WarningAmber
                        )
                    }
                }
                Spacer(modifier = Modifier.height(6.dp))
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: ZONE 3 — DECISIVE 3-PILLARS VERDICT CARD
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun VerdictCard(
    result: DetailedScanResult,
    isSpeaking: Boolean,
    onToggleSpeech: () -> Unit,
    onShareWhatsApp: () -> Unit,
    showLegalDocket: Boolean,
    onToggleDocket: () -> Unit,
    context: Context
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .animateContentSize(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = BorderStroke(1.5.dp, if (result.isScam) AlertCrimson.copy(alpha = 0.6f) else BrandEmerald.copy(alpha = 0.6f))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            // Header: Threat Status + Score
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (result.isScam) AlertCrimson.copy(alpha = 0.15f) else BrandEmerald.copy(alpha = 0.15f),
                    border = BorderStroke(0.5.dp, if (result.isScam) AlertCrimson.copy(alpha = 0.4f) else BrandEmerald.copy(alpha = 0.4f))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 9.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = if (result.isScam) AlertCrimson else BrandEmerald,
                            modifier = Modifier.size(7.dp)
                        ) {}
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (result.isScam) "SCAM DETECTED" else "CLEAN / SAFE",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            color = if (result.isScam) AlertCrimson else BrandEmerald,
                            letterSpacing = 0.5.sp,
                            softWrap = false
                        )
                    }
                }

                Text(
                    text = "${result.score}% RISK",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Black,
                    color = if (result.isScam) AlertCrimson else BrandEmerald,
                    fontFamily = FontFamily.Monospace
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Progress Risk Meter
            LinearProgressIndicator(
                progress = { result.score / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(5.dp),
                color = if (result.isScam) AlertCrimson else BrandEmerald,
                trackColor = SurfaceElevated
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Headline
            Text(
                text = result.headline,
                fontSize = 17.sp,
                fontWeight = FontWeight.Black,
                color = TextPrimary,
                lineHeight = 22.sp
            )

            // Detected Psychological Levers Pill Bar
            if (result.detectedLevers.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    for (lever in result.detectedLevers) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = DarkBackground,
                            border = BorderStroke(0.5.dp, WarningAmber.copy(alpha = 0.4f))
                        ) {
                            Text(
                                text = lever,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = WarningAmber,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                softWrap = false
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // ── THE 3 PILLARS OF TRUTH (HIGH-LEGIBILITY BENTO CAPSULES) ──
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Pillar 1: The Trap
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = AlertCrimson.copy(alpha = 0.12f),
                    border = BorderStroke(1.dp, AlertCrimson.copy(alpha = 0.45f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Text(text = "🛑", fontSize = 18.sp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "THE TRAP",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black,
                                color = AlertCrimson,
                                letterSpacing = 0.8.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = result.trap,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary,
                                lineHeight = 21.sp
                            )
                        }
                    }
                }

                // Pillar 2: The Truth
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = BrandCyan.copy(alpha = 0.12f),
                    border = BorderStroke(1.dp, BrandCyan.copy(alpha = 0.45f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Text(text = "💡", fontSize = 18.sp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "WHY IT IS FAKE",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black,
                                color = BrandCyan,
                                letterSpacing = 0.8.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = result.truth,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary,
                                lineHeight = 21.sp
                            )
                        }
                    }
                }

                // Pillar 3: What You Must Do
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = BrandEmerald.copy(alpha = 0.12f),
                    border = BorderStroke(1.dp, BrandEmerald.copy(alpha = 0.45f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Text(text = "👉", fontSize = 18.sp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "WHAT YOU MUST DO",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black,
                                color = BrandEmerald,
                                letterSpacing = 0.8.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = result.whatToDo,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary,
                                lineHeight = 21.sp
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // ── ZONE 4: ACTION CONSOLE ──
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Listen Aloud TTS
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (isSpeaking) AlertCrimson.copy(alpha = 0.15f) else SurfaceElevated,
                    border = BorderStroke(1.dp, if (isSpeaking) AlertCrimson else BorderSubtle),
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onToggleSpeech() }
                ) {
                    Row(
                        modifier = Modifier.padding(vertical = 10.dp),
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
                            color = if (isSpeaking) AlertCrimson else BrandCyan,
                            softWrap = false
                        )
                    }
                }

                // WhatsApp Family Broadcast
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = SurfaceElevated,
                    border = BorderStroke(1.dp, BorderSubtle),
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onShareWhatsApp() }
                ) {
                    Row(
                        modifier = Modifier.padding(vertical = 10.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = null,
                            tint = BrandEmerald,
                            modifier = Modifier.size(15.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "WhatsApp Share",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = BrandEmerald,
                            softWrap = false
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // ── ZONE 5: SECTION 63 BSA 2023 EVIDENCE STAMP (Collapsible Drawer) ──
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = SurfaceElevated,
                border = BorderStroke(1.dp, BorderSubtle),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onToggleDocket() }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 9.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = null,
                            tint = TextSecondary,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Section 63 BSA 2023 Legal Evidence Docket",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextSecondary
                        )
                    }

                    Icon(
                        imageVector = if (showLegalDocket) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = null,
                        tint = TextSecondary,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            AnimatedVisibility(visible = showLegalDocket) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = DarkBackground,
                        border = BorderStroke(0.5.dp, BorderSubtle),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text(
                                text = "FORENSIC DIGITAL EVIDENCE CERTIFICATE",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                color = BrandCyan,
                                letterSpacing = 0.6.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "SHA-256: ${result.sha256}",
                                fontSize = 9.sp,
                                color = TextSecondary,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                text = "TIMESTAMP: ${result.timestamp}",
                                fontSize = 9.sp,
                                color = TextSecondary,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                text = "ENGINE: PausePoint Sovereign Sentry v2026.11",
                                fontSize = 9.sp,
                                color = TextMuted,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                text = "JURISDICTION: Sec 63 Bharatiya Sakshya Adhiniyam 2023",
                                fontSize = 9.sp,
                                color = TextMuted
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            // Copy Docket Action
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = SurfaceElevated,
                                border = BorderStroke(0.5.dp, BorderSubtle),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        val clipboardMgr = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                        val docketText = "PAUSEPOINT SECTION 63 BSA 2023 DOCKET\n" +
                                                "SHA-256: ${result.sha256}\n" +
                                                "TIMESTAMP: ${result.timestamp}\n" +
                                                "THREAT: ${result.category} (${result.score}% Risk)\n" +
                                                "HEADLINE: ${result.headline}\n" +
                                                "TRUTH: ${result.truth}\n" +
                                                "ACTION: ${result.whatToDo}"
                                        clipboardMgr.setPrimaryClip(ClipData.newPlainText("BSA Evidence Docket", docketText))
                                        Toast.makeText(context, "Legal docket copied to clipboard!", Toast.LENGTH_SHORT).show()
                                    }
                            ) {
                                Row(
                                    modifier = Modifier.padding(vertical = 6.dp),
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.ContentCopy,
                                        contentDescription = null,
                                        tint = BrandCyan,
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "Copy Legal Docket for Police FIR",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = BrandCyan
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
