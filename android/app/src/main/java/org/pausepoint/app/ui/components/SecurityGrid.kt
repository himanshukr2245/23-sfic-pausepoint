package org.pausepoint.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.pausepoint.app.ui.theme.BorderHairline
import org.pausepoint.app.ui.theme.BrandCyan
import org.pausepoint.app.ui.theme.BrandEmerald
import org.pausepoint.app.ui.theme.DarkSurface
import org.pausepoint.app.ui.theme.TextMuted
import org.pausepoint.app.ui.theme.TextPrimary
import org.pausepoint.app.ui.theme.TextSecondary
import org.pausepoint.app.ui.theme.WarningAmber

data class SecurityModuleItem(
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val statusColor: Color,
    val statusText: String,
    val route: String
)

@Composable
fun SecurityGrid(
    callScreeningActive: Boolean,
    notificationAccessActive: Boolean,
    activeThreatsCount: Int,
    debitsCount: Int,
    onModuleClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current

    val items = listOf(
        SecurityModuleItem(
            title = "Message Shield",
            subtitle = if (notificationAccessActive) "WhatsApp & SMS Monitored" else "Permission Required",
            icon = Icons.AutoMirrored.Filled.Chat,
            statusColor = if (notificationAccessActive) BrandEmerald else WarningAmber,
            statusText = if (notificationAccessActive) "ARMED" else "SETUP",
            route = "settings"
        ),
        SecurityModuleItem(
            title = "Call Guard",
            subtitle = if (callScreeningActive) "Digital Arrests Blocked" else "Role Unassigned",
            icon = Icons.Default.Phone,
            statusColor = if (callScreeningActive) BrandEmerald else WarningAmber,
            statusText = if (callScreeningActive) "SCREENING" else "ENABLE",
            route = "settings"
        ),
        SecurityModuleItem(
            title = "Money Watch",
            subtitle = if (debitsCount > 0) "$debitsCount Unchecked Debits" else "UPI Limits Normal",
            icon = Icons.Default.AccountBalanceWallet,
            statusColor = if (debitsCount > 0) WarningAmber else BrandEmerald,
            statusText = if (debitsCount > 0) "REVIEW" else "SAFE",
            route = "xray"
        ),
        SecurityModuleItem(
            title = "Scam Decoder",
            subtitle = "BSA 2023 Rules Engine",
            icon = Icons.Default.Psychology,
            statusColor = BrandCyan,
            statusText = "BSA READY",
            route = "xray"
        )
    )

    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "ACTIVE DEFENSE MODULES",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = TextSecondary,
                letterSpacing = 1.sp
            )
            Text(
                text = "4 ACTIVE",
                fontSize = 9.sp,
                fontWeight = FontWeight.SemiBold,
                color = BrandEmerald,
                fontFamily = FontFamily.Monospace
            )
        }

        for (i in items.indices step 2) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SecurityTile(
                    item = items[i],
                    onClick = {
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        onModuleClick(items[i].route)
                    },
                    modifier = Modifier.weight(1f)
                )
                if (i + 1 < items.size) {
                    SecurityTile(
                        item = items[i + 1],
                        onClick = {
                            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                            onModuleClick(items[i + 1].route)
                        },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }
}

@Composable
private fun SecurityTile(
    item: SecurityModuleItem,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .height(106.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = BorderStroke(1.dp, BorderHairline)
    ) {
        Column(
            modifier = Modifier
                .padding(12.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = item.statusColor.copy(alpha = 0.12f),
                    modifier = Modifier.size(32.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = item.icon,
                            contentDescription = null,
                            tint = item.statusColor,
                            modifier = Modifier.size(17.dp)
                        )
                    }
                }

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = item.statusColor.copy(alpha = 0.12f),
                    border = BorderStroke(0.5.dp, item.statusColor.copy(alpha = 0.25f))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(4.dp)
                                .background(item.statusColor, shape = CircleShape)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = item.statusText,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = item.statusColor,
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 0.5.sp
                        )
                    }
                }
            }

            Column {
                Text(
                    text = item.title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = item.subtitle,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Normal,
                    color = TextSecondary,
                    maxLines = 1
                )
            }
        }
    }
}

