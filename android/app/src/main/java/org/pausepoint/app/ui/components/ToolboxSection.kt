package org.pausepoint.app.ui.components

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Android
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.pausepoint.app.ui.theme.BorderHairline
import org.pausepoint.app.ui.theme.BrandCyan
import org.pausepoint.app.ui.theme.DarkSurface
import org.pausepoint.app.ui.theme.TextMuted
import org.pausepoint.app.ui.theme.TextPrimary
import org.pausepoint.app.ui.theme.TextSecondary

data class ToolTile(
    val title: String,
    val description: String,
    val icon: ImageVector,
    val route: String
)

@Composable
fun ToolboxSection(
    onToolClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current

    val tools = listOf(
        ToolTile("Link X-Ray", "Detect spoof domains", Icons.Default.Link, "xray"),
        ToolTile("APK Sniffer", "Side-loaded malware", Icons.Default.Android, "xray"),
        ToolTile("BSA 2023", "Sec 63 legal vault", Icons.AutoMirrored.Filled.MenuBook, "crisis"),
        ToolTile("Simulator", "Scam attack drills", Icons.Default.Speed, "xray")
    )

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = "FORENSIC TOOLBOX",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = TextSecondary,
            letterSpacing = 1.sp,
            modifier = Modifier.padding(bottom = 8.dp)
        )

        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            for (i in tools.indices step 2) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    ToolCard(
                        tool = tools[i],
                        onClick = {
                            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                            onToolClick(tools[i].route)
                        },
                        modifier = Modifier.weight(1f)
                    )
                    if (i + 1 < tools.size) {
                        ToolCard(
                            tool = tools[i + 1],
                            onClick = {
                                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                onToolClick(tools[i + 1].route)
                            },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ToolCard(
    tool: ToolTile,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .height(58.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = BorderStroke(1.dp, BorderHairline)
    ) {
        Row(
            modifier = Modifier
                .padding(horizontal = 10.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = BrandCyan.copy(alpha = 0.12f),
                modifier = Modifier.size(32.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = tool.icon,
                        contentDescription = null,
                        tint = BrandCyan,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            Column {
                Text(
                    text = tool.title,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary,
                    maxLines = 1
                )
                Text(
                    text = tool.description,
                    fontSize = 10.sp,
                    color = TextSecondary,
                    maxLines = 1
                )
            }
        }
    }
}

