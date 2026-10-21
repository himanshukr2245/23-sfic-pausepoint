package org.pausepoint.app.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.pausepoint.app.R
import org.pausepoint.app.ui.theme.BorderHairline
import org.pausepoint.app.ui.theme.BorderSubtle
import org.pausepoint.app.ui.theme.BrandEmerald
import org.pausepoint.app.ui.theme.DarkSurface
import org.pausepoint.app.ui.theme.TextMuted
import org.pausepoint.app.ui.theme.TextPrimary
import org.pausepoint.app.ui.theme.TextSecondary

@Composable
fun SecurityTopBar(
    onSettingsClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current

    Row(
        modifier = modifier
            .fillMaxWidth()
            .height(56.dp)
            .background(Color.Transparent)
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Brand Identity
        Row(verticalAlignment = Alignment.CenterVertically) {
            Image(
                painter = painterResource(id = R.drawable.ic_pausepoint_logo),
                contentDescription = "PausePoint Logo",
                modifier = Modifier
                    .size(30.dp)
                    .clip(RoundedCornerShape(8.dp))
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = "PausePoint",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                letterSpacing = (-0.3).sp
            )
            Spacer(modifier = Modifier.width(6.dp))
            Surface(
                shape = RoundedCornerShape(4.dp),
                color = BrandEmerald.copy(alpha = 0.15f),
                border = androidx.compose.foundation.BorderStroke(0.5.dp, BrandEmerald.copy(alpha = 0.4f))
            ) {
                Text(
                    text = "SHIELD",
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Black,
                    color = BrandEmerald,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                )
            }
        }

        // Telemetry Badge & Action
        Row(verticalAlignment = Alignment.CenterVertically) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = DarkSurface,
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderHairline)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 9.dp, vertical = 5.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .background(BrandEmerald, shape = CircleShape)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "100% OFFLINE",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = BrandEmerald,
                        letterSpacing = 0.5.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            Spacer(modifier = Modifier.width(6.dp))

            IconButton(
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    onSettingsClick()
                },
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = "Settings",
                    tint = TextSecondary,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

