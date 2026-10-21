package org.pausepoint.app.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.pausepoint.app.ui.theme.BorderHairline
import org.pausepoint.app.ui.theme.BrandEmerald
import org.pausepoint.app.ui.theme.DarkSurface
import org.pausepoint.app.ui.theme.TextMuted
import org.pausepoint.app.ui.theme.TextPrimary

sealed class NavTab(val route: String, val title: String, val icon: ImageVector) {
    object Security : NavTab("security", "Home", Icons.Default.Shield)
    object XRay : NavTab("xray", "Check Scam", Icons.Default.Search)
    object Crisis : NavTab("crisis", "1930 Help", Icons.Default.Warning)
}

@Composable
fun BottomNavBar(
    currentRoute: String,
    onTabSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val tabs = listOf(NavTab.Security, NavTab.XRay, NavTab.Crisis)
    val navBorderColor = BorderHairline

    Surface(
        color = DarkSurface,
        modifier = modifier
            .fillMaxWidth()
            .drawBehind {
                drawLine(
                    color = navBorderColor,
                    start = Offset(0f, 0f),
                    end = Offset(size.width, 0f),
                    strokeWidth = 1.dp.toPx()
                )
            }
            .navigationBarsPadding()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(62.dp)
                .padding(horizontal = 12.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            for (tab in tabs) {
                NavTabItem(
                    tab = tab,
                    isSelected = currentRoute == tab.route,
                    onClick = { onTabSelected(tab.route) }
                )
            }
        }
    }
}

@Composable
private fun RowScope.NavTabItem(
    tab: NavTab,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val haptic = LocalHapticFeedback.current

    val iconTint by animateColorAsState(
        targetValue = if (isSelected) BrandEmerald else TextMuted,
        animationSpec = tween(durationMillis = 150),
        label = "iconTint"
    )
    val textColor by animateColorAsState(
        targetValue = if (isSelected) TextPrimary else TextMuted,
        animationSpec = tween(durationMillis = 150),
        label = "textColor"
    )
    val iconScale by animateFloatAsState(
        targetValue = if (isSelected) 1.10f else 1.0f,
        animationSpec = tween(durationMillis = 150),
        label = "iconScale"
    )

    Box(
        modifier = Modifier
            .weight(1f)
            .fillMaxHeight()
            .clip(RoundedCornerShape(14.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) {
                if (!isSelected) {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    onClick()
                }
            },
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
                .clip(RoundedCornerShape(12.dp))
                .background(if (isSelected) BrandEmerald.copy(alpha = 0.12f) else Color.Transparent)
                .padding(horizontal = 16.dp, vertical = 6.dp)
        ) {
            Icon(
                imageVector = tab.icon,
                contentDescription = tab.title,
                tint = iconTint,
                modifier = Modifier
                    .size(20.dp)
                    .graphicsLayer {
                        scaleX = iconScale
                        scaleY = iconScale
                    }
            )
            Spacer(modifier = Modifier.height(3.dp))
            Text(
                text = tab.title,
                fontSize = 11.sp,
                fontWeight = if (isSelected) FontWeight.Black else FontWeight.Medium,
                color = textColor,
                letterSpacing = 0.2.sp
            )
            if (isSelected) {
                Spacer(modifier = Modifier.height(2.dp))
                Box(
                    modifier = Modifier
                        .size(4.dp)
                        .background(BrandEmerald, CircleShape)
                )
            }
        }
    }
}
