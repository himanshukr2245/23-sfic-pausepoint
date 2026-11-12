package org.pausepoint.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Image
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
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Emergency
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PanTool
import androidx.compose.material.icons.filled.PhoneInTalk
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.pausepoint.app.R
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
import org.pausepoint.app.viewmodel.ShieldViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SecurityDashboardScreen(
    viewModel: ShieldViewModel,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val haptic = LocalHapticFeedback.current
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    var showQuickMenuDrawer by remember { mutableStateOf(false) }
    var showAirGapDialog by remember { mutableStateOf(false) }
    var showBsaDialog by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    Scaffold(
        containerColor = DarkBackground,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp)
            ) {
                // ROW 1: Dual Brand Logos (Left) + Quick Menu Button (Right)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Dual Logo Lockup (Left): Custom Emblem + Horizontal Brandmark
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Image(
                            painter = painterResource(R.drawable.logo_pausepoint_app),
                            contentDescription = "PausePoint Emblem",
                            modifier = Modifier
                                .size(38.dp)
                                .clip(RoundedCornerShape(8.dp))
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Image(
                            painter = painterResource(if (uiState.isDarkMode) R.drawable.logo_pausepoint_dark else R.drawable.logo_pausepoint_light),
                            contentDescription = "PausePoint Brand",
                            modifier = Modifier.height(38.dp),
                            contentScale = ContentScale.Fit
                        )
                    }

                    // Open Drawer Chevron Button (Right)
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = DarkSurfaceVariant,
                        border = BorderStroke(0.5.dp, BorderHairline),
                        modifier = Modifier.clickable {
                            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                            showQuickMenuDrawer = true
                        }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.KeyboardArrowDown,
                                contentDescription = "Open Drawer Menu",
                                tint = BrandCyan,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Menu",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // ROW 2: Dedicated Quotation Banner ("Check before you get scammed.")
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = DarkSurfaceVariant,
                    border = BorderStroke(0.5.dp, BorderHairline),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "“Check before you get scammed.”",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary,
                            letterSpacing = 0.3.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // ROW 3: Status Pills: [ Shield ON ], [ 100% OFFLINE ], [ AIR-GAPPED ]
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Pill 1: Shield ON
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = BrandEmerald.copy(alpha = 0.12f),
                        border = BorderStroke(0.5.dp, BrandEmerald.copy(alpha = 0.35f))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .background(BrandEmerald, CircleShape)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Shield ON",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = BrandEmerald,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    // Pill 2: 100% OFFLINE
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = BrandCyan.copy(alpha = 0.12f),
                        border = BorderStroke(0.5.dp, BrandCyan.copy(alpha = 0.35f))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = null,
                                tint = BrandCyan,
                                modifier = Modifier.size(10.dp)
                            )
                            Spacer(modifier = Modifier.width(5.dp))
                            Text(
                                text = "100% OFFLINE",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = BrandCyan,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    // Pill 3: Air-Gapped Sovereign
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = DarkSurfaceVariant,
                        border = BorderStroke(0.5.dp, BorderHairline)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "AIR-GAPPED",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextSecondary,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }
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
                .padding(horizontal = 16.dp, vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // 0. SIFC JURY DEMO ARENA (Collapsible Card - Default Expanded)
            JuryDemoArenaCard(
                viewModel = viewModel,
                onNavigate = onNavigate
            )

            // 1. HERO SCANNER CHAMBER (Live Forensics)
            HeroScannerCard(
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    onNavigate("xray")
                }
            )

            // 2. 1930 GOLDEN HOUR EMERGENCY RESCUE
            GoldenHourEmergencyCard(
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    onNavigate("crisis")
                }
            )

            // 3. BALANCED 2-COLUMN TACTICAL BENTO DUO
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                TacticalBentoTile(
                    badge = "DIGITAL ARREST",
                    title = "Fake Police Call?",
                    subtitle = "CBI or video call threats. See 3 legal rules & verify.",
                    ctaText = "Verify Caller",
                    accentColor = WarningAmber,
                    icon = Icons.Default.PhoneInTalk,
                    onClick = {
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        onNavigate("calls")
                    },
                    modifier = Modifier.weight(1f)
                )

                TacticalBentoTile(
                    badge = "PAYMENT BRAKE",
                    title = "Told to Pay Money?",
                    subtitle = "UPI PIN trap, task deposit, remote screen app.",
                    ctaText = "Take 10s Check",
                    accentColor = BrandViolet,
                    icon = Icons.Default.PanTool,
                    onClick = {
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        onNavigate("brake")
                    },
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            // PRIVACY GUARANTEE STRIP
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = DarkSurface,
                border = BorderStroke(0.5.dp, BorderHairline),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Security,
                        contentDescription = null,
                        tint = BrandEmerald,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "100% On-Device • Zero Cloud Storage • No Ads",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextMuted
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // INSTITUTIONAL FOOTER CREDITS (SFIC 2026 IISc Bengaluru · Team DELTA)
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = DarkSurfaceVariant,
                border = BorderStroke(0.5.dp, BorderHairline),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = BrandEmerald.copy(alpha = 0.12f),
                            border = BorderStroke(0.5.dp, BrandEmerald.copy(alpha = 0.35f))
                        ) {
                            Text(
                                text = "SFIC 2026",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = BrandEmerald,
                                fontFamily = FontFamily.Monospace,
                                modifier = Modifier.padding(horizontal = 7.dp, vertical = 2.dp)
                            )
                        }
                        Text(
                            text = "IISc Bengaluru",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextSecondary
                        )
                        Text(
                            text = "·",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextMuted
                        )
                        Text(
                            text = "Team DELTA",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = BrandCyan
                        )
                    }

                    Text(
                        text = "Seva-First Innovation Challenge 2026",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextPrimary,
                        textAlign = TextAlign.Center
                    )

                    Text(
                        text = "Section 63 BSA 2023 Digital Proof · 100% Air-Gapped",
                        fontSize = 10.sp,
                        color = TextMuted,
                        textAlign = TextAlign.Center
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }

    // ── QUICK MENU DRAWER (ModalBottomSheet) ──
    if (showQuickMenuDrawer) {
        ModalBottomSheet(
            onDismissRequest = { showQuickMenuDrawer = false },
            sheetState = sheetState,
            containerColor = DarkSurface,
            dragHandle = {
                Box(
                    modifier = Modifier
                        .padding(vertical = 12.dp)
                        .width(36.dp)
                        .height(4.dp)
                        .background(TextMuted.copy(alpha = 0.4f), RoundedCornerShape(2.dp))
                )
            }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp)
                    .padding(bottom = 28.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Clean Sovereign Drawer Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = CircleShape,
                        color = BrandCyan.copy(alpha = 0.15f),
                        modifier = Modifier.size(34.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.Security,
                                contentDescription = null,
                                tint = BrandCyan,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Quick Controls & Sovereign Attestation",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Local offline parameters & statutory proof",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    }
                }

                // Theme Switch Bento Row
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = DarkSurfaceVariant,
                    border = BorderStroke(0.5.dp, BorderHairline),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { viewModel.setDarkMode(!uiState.isDarkMode) }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            modifier = Modifier.weight(1f),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = if (uiState.isDarkMode) BrandViolet.copy(alpha = 0.2f) else WarningAmber.copy(alpha = 0.2f),
                                modifier = Modifier.size(36.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        imageVector = if (uiState.isDarkMode) Icons.Default.DarkMode else Icons.Default.LightMode,
                                        contentDescription = null,
                                        tint = if (uiState.isDarkMode) BrandViolet else WarningAmber,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = if (uiState.isDarkMode) "Dark Cockpit" else "Light Daylight",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = if (uiState.isDarkMode) "OLED battery saver contrast" else "Crisp ceramic daylight readability",
                                    fontSize = 11.sp,
                                    color = TextMuted
                                )
                            }
                        }

                        Switch(
                            checked = uiState.isDarkMode,
                            onCheckedChange = { viewModel.setDarkMode(it) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = BrandEmerald,
                                checkedTrackColor = BrandEmerald.copy(alpha = 0.35f),
                                uncheckedThumbColor = WarningAmber,
                                uncheckedTrackColor = WarningAmber.copy(alpha = 0.35f)
                            )
                        )
                    }
                }

                // Quick Menu Actions
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    // Option 1: Settings
                    MenuActionRow(
                        icon = Icons.Default.Settings,
                        accentColor = BrandCyan,
                        title = "App Settings & Defense Sensitivity",
                        subtitle = "Firewall permissions, Force Zoom, and heuristic rules",
                        onClick = {
                            showQuickMenuDrawer = false
                            onNavigate("settings")
                        }
                    )

                    // Option 2: Air-Gap Verification
                    MenuActionRow(
                        icon = Icons.Default.Security,
                        accentColor = BrandEmerald,
                        title = "Zero-Internet Guarantee (Attestation)",
                        subtitle = "100% offline air-gap · INTERNET permission permanently removed",
                        onClick = {
                            showAirGapDialog = true
                        }
                    )

                    // Option 3: About BSA 2023
                    MenuActionRow(
                        icon = Icons.Default.Info,
                        accentColor = BrandViolet,
                        title = "Section 63 BSA 2023 Digital Proof",
                        subtitle = "Court-admissible tamper-proof cryptographic evidence",
                        onClick = {
                            showBsaDialog = true
                        }
                    )

                    // Option 4: Cyber Helpline 1930
                    MenuActionRow(
                        icon = Icons.Default.Emergency,
                        accentColor = AlertCrimson,
                        title = "Emergency Cyber Hotline: 1930",
                        subtitle = "Indian Cyber Crime Coordination Centre (I4C / MHA)",
                        onClick = {
                            showQuickMenuDrawer = false
                            onNavigate("crisis")
                        }
                    )
                }
            }
        }
    }

    // ── AIR-GAP ATTESTATION DIALOG ──
    if (showAirGapDialog) {
        AlertDialog(
            onDismissRequest = { showAirGapDialog = false },
            containerColor = DarkSurface,
            icon = {
                Icon(
                    imageVector = Icons.Default.VerifiedUser,
                    contentDescription = null,
                    tint = BrandEmerald,
                    modifier = Modifier.size(32.dp)
                )
            },
            title = {
                Text(
                    text = "100% Air-Gapped Verification",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "PausePoint Shield is architecturally incapable of transmitting your data to any remote server.",
                        fontSize = 13.sp,
                        color = TextSecondary,
                        lineHeight = 18.sp
                    )
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = DarkSurfaceVariant,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "AndroidManifest.xml:\n<uses-permission android:name=\"android.permission.INTERNET\" tools:node=\"remove\"/>",
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            color = BrandEmerald,
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                    Text(
                        text = "• All scans run on local CPU via regex & heuristic weights.\n• Zero telemetry, zero analytics, zero data harvesting.",
                        fontSize = 12.sp,
                        color = TextMuted,
                        lineHeight = 16.sp
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { showAirGapDialog = false },
                    colors = ButtonDefaults.buttonColors(containerColor = BrandEmerald)
                ) {
                    Text("Understood", fontWeight = FontWeight.Bold)
                }
            }
        )
    }

    // ── BSA 2023 STATUTORY PROOF DIALOG ──
    if (showBsaDialog) {
        AlertDialog(
            onDismissRequest = { showBsaDialog = false },
            containerColor = DarkSurface,
            icon = {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = null,
                    tint = BrandViolet,
                    modifier = Modifier.size(32.dp)
                )
            },
            title = {
                Text(
                    text = "Section 63 BSA 2023 Digital Proof",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Under Bharatiya Sakshya Adhiniyam 2023 (BSA Section 63), electronic records generated with a verifiable cryptographic hash and device environment attestation are admissible as primary evidence in Indian Courts.",
                        fontSize = 13.sp,
                        color = TextSecondary,
                        lineHeight = 18.sp
                    )
                    Text(
                        text = "When you generate a complaint in Crisis Triage (1930 Help), PausePoint cryptographically stamps your incident particulars with SHA-256 for instant submission to Cyber Crime Police Stations.",
                        fontSize = 12.sp,
                        color = TextMuted,
                        lineHeight = 16.sp
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { showBsaDialog = false },
                    colors = ButtonDefaults.buttonColors(containerColor = BrandViolet)
                ) {
                    Text("OK", fontWeight = FontWeight.Bold)
                }
            }
        )
    }
}

@Composable
private fun MenuActionRow(
    icon: ImageVector,
    accentColor: Color,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = DarkSurfaceVariant,
        border = BorderStroke(0.5.dp, BorderHairline),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = CircleShape,
                color = accentColor.copy(alpha = 0.15f),
                modifier = Modifier.size(32.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = accentColor,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = subtitle,
                    fontSize = 11.sp,
                    color = TextSecondary,
                    lineHeight = 14.sp
                )
            }
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                tint = TextMuted,
                modifier = Modifier.size(14.dp)
            )
        }
    }
}

@Composable
private fun JuryDemoArenaCard(
    viewModel: ShieldViewModel,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var isExpanded by rememberSaveable { mutableStateOf(true) }
    val haptic = LocalHapticFeedback.current

    Surface(
        shape = RoundedCornerShape(16.dp),
        color = DarkSurfaceVariant,
        border = BorderStroke(1.dp, BrandCyan.copy(alpha = 0.45f)),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Collapsible Header Row (Tap anywhere to expand / collapse)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable {
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        isExpanded = !isExpanded
                    }
                    .padding(horizontal = 14.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Surface(
                        shape = CircleShape,
                        color = BrandCyan.copy(alpha = 0.15f),
                        modifier = Modifier.size(28.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = null,
                                tint = BrandCyan,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "SIFC Jury Demo Arena",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Black,
                                color = TextPrimary
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = BrandEmerald.copy(alpha = 0.15f),
                                border = BorderStroke(0.5.dp, BrandEmerald.copy(alpha = 0.35f))
                            ) {
                                Text(
                                    text = "OFFLINE",
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Black,
                                    color = BrandEmerald,
                                    fontFamily = FontFamily.Monospace,
                                    modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = if (isExpanded) "1-Tap Threat Simulation for Live Evaluation" else "Tap to expand 3 live simulation triggers",
                            fontSize = 10.sp,
                            color = TextSecondary
                        )
                    }
                }

                // Expand/Collapse Chevron Indicator
                Surface(
                    shape = CircleShape,
                    color = DarkSurface,
                    border = BorderStroke(0.5.dp, BorderHairline),
                    modifier = Modifier.size(26.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = if (isExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                            contentDescription = if (isExpanded) "Collapse" else "Expand",
                            tint = BrandCyan,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            // Expandable Content Body
            AnimatedVisibility(
                visible = isExpanded,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(start = 14.dp, end = 14.dp, bottom = 14.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Thin Separator Hairline
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(0.5.dp)
                            .background(BorderHairline)
                    )

                    // Simulation 1: Task Scam Advance Fee Trap
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = DarkSurface,
                        border = BorderStroke(0.5.dp, WarningAmber.copy(alpha = 0.35f)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                viewModel.injectSimulatedTaskScam()
                                viewModel.setPendingScanText(
                                    "Telegram Task: Your part-time commission ₹8,400 is ready. Transfer ₹5,000 security deposit immediately to unlock withdrawal."
                                )
                                onNavigate("xray")
                            }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 9.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "1. Simulate Task Scam SMS (₹8,400)",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = WarningAmber
                                )
                                Text(
                                    text = "Triggers Advance-Fee Trap & Money Watch Correlation",
                                    fontSize = 10.sp,
                                    color = TextMuted
                                )
                            }
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = null,
                                tint = WarningAmber,
                                modifier = Modifier.size(14.dp)
                            )
                        }
                    }

                    // Simulation 2: Fake CBI Digital Arrest Call
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = DarkSurface,
                        border = BorderStroke(0.5.dp, AlertCrimson.copy(alpha = 0.35f)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                onNavigate("calls")
                            }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 9.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "2. Simulate Fake Police / CBI Call",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AlertCrimson
                                )
                                Text(
                                    text = "Triggers Call Guard 1600 verification rules",
                                    fontSize = 10.sp,
                                    color = TextMuted
                                )
                            }
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = null,
                                tint = AlertCrimson,
                                modifier = Modifier.size(14.dp)
                            )
                        }
                    }

                    // Simulation 3: Electricity Dropper Malware APK
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = DarkSurface,
                        border = BorderStroke(0.5.dp, BrandCyan.copy(alpha = 0.35f)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                viewModel.injectSimulatedElectricityApk()
                                viewModel.setPendingScanText(
                                    "URGENT: Electricity bill unpaid. Power will be disconnected tonight 9:30 PM. Download & update via http://power-update.org/bill.apk"
                                )
                                onNavigate("xray")
                            }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 9.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "3. Simulate Electricity Dropper APK",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = BrandCyan
                                )
                                Text(
                                    text = "Triggers malware dissection & reverse-engineering link warnings",
                                    fontSize = 10.sp,
                                    color = TextMuted
                                )
                            }
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = null,
                                tint = BrandCyan,
                                modifier = Modifier.size(14.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun HeroScannerCard(
    onClick: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, BrandCyan.copy(alpha = 0.4f)),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = BrandCyan.copy(alpha = 0.12f),
                    border = BorderStroke(0.5.dp, BrandCyan.copy(alpha = 0.35f))
                ) {
                    Text(
                        text = "LIVE SCAM SCANNER",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = BrandCyan,
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                Surface(
                    shape = CircleShape,
                    color = BrandCyan.copy(alpha = 0.15f),
                    modifier = Modifier.size(32.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Chat,
                            contentDescription = null,
                            tint = BrandCyan,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Check SMS, WhatsApp or Link",
                fontSize = 16.sp,
                fontWeight = FontWeight.Black,
                color = TextPrimary,
                letterSpacing = (-0.2).sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "Got a suspicious message, APK link, electricity bill, or bank alert? Paste to scan instantly.",
                fontSize = 12.sp,
                color = TextSecondary,
                lineHeight = 16.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = BrandCyan.copy(alpha = 0.12f),
                    border = BorderStroke(0.5.dp, BrandCyan.copy(alpha = 0.3f))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Scan Message Now",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = BrandCyan
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = null,
                            tint = BrandCyan,
                            modifier = Modifier.size(12.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun GoldenHourEmergencyCard(
    onClick: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, AlertCrimson.copy(alpha = 0.45f)),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = AlertCrimson.copy(alpha = 0.12f),
                    border = BorderStroke(0.5.dp, AlertCrimson.copy(alpha = 0.35f))
                ) {
                    Text(
                        text = "🚨 GOLDEN HOUR RESCUE",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = AlertCrimson,
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                Surface(
                    shape = CircleShape,
                    color = AlertCrimson.copy(alpha = 0.15f),
                    modifier = Modifier.size(32.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.Emergency,
                            contentDescription = null,
                            tint = AlertCrimson,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "I Paid Money — What To Do Now?",
                fontSize = 16.sp,
                fontWeight = FontWeight.Black,
                color = AlertCrimson,
                letterSpacing = (-0.2).sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "Act within the first hour. 1-tap call 1930 & notify bank fraud desk to freeze transactions.",
                fontSize = 12.sp,
                color = TextSecondary,
                lineHeight = 16.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = AlertCrimson.copy(alpha = 0.12f),
                    border = BorderStroke(0.5.dp, AlertCrimson.copy(alpha = 0.3f))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Launch 1930 Recovery Kit",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = AlertCrimson
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = null,
                            tint = AlertCrimson,
                            modifier = Modifier.size(12.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun TacticalBentoTile(
    badge: String,
    title: String,
    subtitle: String,
    ctaText: String,
    accentColor: Color,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, accentColor.copy(alpha = 0.35f)),
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(5.dp),
                    color = accentColor.copy(alpha = 0.12f),
                    border = BorderStroke(0.5.dp, accentColor.copy(alpha = 0.3f))
                ) {
                    Text(
                        text = badge,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Black,
                        color = accentColor,
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }

                Surface(
                    shape = CircleShape,
                    color = accentColor.copy(alpha = 0.15f),
                    modifier = Modifier.size(28.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = icon,
                            contentDescription = null,
                            tint = accentColor,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = subtitle,
                fontSize = 11.sp,
                color = TextSecondary,
                lineHeight = 15.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = ctaText,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = accentColor
                )
                Spacer(modifier = Modifier.width(3.dp))
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    tint = accentColor,
                    modifier = Modifier.size(11.dp)
                )
            }
        }
    }
}
