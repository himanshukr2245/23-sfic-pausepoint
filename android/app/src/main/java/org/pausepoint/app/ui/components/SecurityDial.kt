package org.pausepoint.app.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.cos
import kotlin.math.sin
import org.pausepoint.app.ui.theme.AlertCrimson
import org.pausepoint.app.ui.theme.BorderHairline
import org.pausepoint.app.ui.theme.BrandCyan
import org.pausepoint.app.ui.theme.BrandEmerald
import org.pausepoint.app.ui.theme.DarkSurface
import org.pausepoint.app.ui.theme.DarkSurfaceVariant
import org.pausepoint.app.ui.theme.TextMuted
import org.pausepoint.app.ui.theme.TextPrimary
import org.pausepoint.app.ui.theme.TextSecondary
import org.pausepoint.app.ui.theme.WarningAmber

@Composable
fun SecurityDial(
    score: Int,
    statusText: String,
    isOptimizing: Boolean,
    onOptimizeClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current

    val animatedScore by animateFloatAsState(
        targetValue = score.toFloat(),
        animationSpec = tween(durationMillis = 800, easing = FastOutSlowInEasing),
        label = "scoreAnimation"
    )

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )

    val dialColor = when {
        score >= 90 -> BrandEmerald
        score >= 70 -> WarningAmber
        else -> AlertCrimson
    }

    Column(
        modifier = modifier.padding(vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Balanced 180dp Cyber Instrument Box
        val inactiveTickColor = BorderHairline
        val trackBgColor = DarkSurfaceVariant.copy(alpha = 0.5f)
        val arcCyan = BrandCyan
        val arcEmerald = BrandEmerald

        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.size(184.dp)
        ) {
            Canvas(modifier = Modifier.size(174.dp)) {
                val strokeWidth = 9.dp.toPx()
                val radius = (size.minDimension - strokeWidth) / 2
                val center = Offset(size.width / 2, size.height / 2)
                val topLeft = Offset(strokeWidth / 2, strokeWidth / 2)
                val arcSize = Size(radius * 2, radius * 2)

                // 1. Physical Calibration Ticks (Outer Ring)
                val tickCount = 36
                val tickStartAngle = 135.0
                val tickSweepAngle = 270.0
                val outerTickRadius = radius + 6.dp.toPx()
                val innerTickRadius = outerTickRadius - 4.dp.toPx()

                for (i in 0..tickCount) {
                    val angleDeg = tickStartAngle + (i.toDouble() / tickCount) * tickSweepAngle
                    val angleRad = Math.toRadians(angleDeg)
                    val p1 = Offset(
                        x = (center.x + innerTickRadius * cos(angleRad)).toFloat(),
                        y = (center.y + innerTickRadius * sin(angleRad)).toFloat()
                    )
                    val p2 = Offset(
                        x = (center.x + outerTickRadius * cos(angleRad)).toFloat(),
                        y = (center.y + outerTickRadius * sin(angleRad)).toFloat()
                    )

                    val isTickActive = (i.toFloat() / tickCount) <= (animatedScore / 100f)
                    val tickColor = if (isTickActive) dialColor.copy(alpha = 0.8f) else inactiveTickColor

                    drawLine(
                        color = tickColor,
                        start = p1,
                        end = p2,
                        strokeWidth = 1.5.dp.toPx(),
                        cap = StrokeCap.Round
                    )
                }

                // 2. Track Background Arc
                drawArc(
                    color = trackBgColor,
                    startAngle = 135f,
                    sweepAngle = 270f,
                    useCenter = false,
                    topLeft = topLeft,
                    size = arcSize,
                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                )

                // 3. Active Foreground Gradient Arc
                val sweep = (animatedScore / 100f) * 270f
                if (sweep > 0f) {
                    drawArc(
                        brush = Brush.sweepGradient(
                            listOf(arcCyan, dialColor, arcEmerald)
                        ),
                        startAngle = 135f,
                        sweepAngle = sweep,
                        useCenter = false,
                        topLeft = topLeft,
                        size = arcSize,
                        style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                    )
                }
            }

            if (isOptimizing) {
                // Radar sweep beam
                Box(
                    modifier = Modifier
                        .size(136.dp)
                        .rotate(rotation)
                ) {
                    Canvas(modifier = Modifier.size(136.dp)) {
                        drawCircle(
                            brush = Brush.radialGradient(
                                colors = listOf(arcEmerald.copy(alpha = 0.25f), Color.Transparent)
                            )
                        )
                    }
                }
            }

            // Dial Center Telemetry Column
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Surface(
                    shape = CircleShape,
                    color = dialColor.copy(alpha = 0.12f),
                    modifier = Modifier.size(26.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.Shield,
                            contentDescription = null,
                            tint = dialColor,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(2.dp))

                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = animatedScore.toInt().toString(),
                        fontSize = 44.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        letterSpacing = (-1).sp
                    )
                    Text(
                        text = "/100",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextMuted,
                        modifier = Modifier.padding(bottom = 7.dp, start = 2.dp)
                    )
                }

                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (isOptimizing) BrandCyan.copy(alpha = 0.15f) else dialColor.copy(alpha = 0.12f),
                    border = androidx.compose.foundation.BorderStroke(
                        0.5.dp,
                        if (isOptimizing) BrandCyan.copy(alpha = 0.3f) else dialColor.copy(alpha = 0.3f)
                    )
                ) {
                    Text(
                        text = if (isOptimizing) "SCANNING..." else statusText.uppercase(),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isOptimizing) BrandCyan else dialColor,
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 0.5.sp,
                        modifier = Modifier.padding(horizontal = 7.dp, vertical = 2.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Precision Optimize Action Pill
        Button(
            onClick = {
                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                onOptimizeClick()
            },
            enabled = !isOptimizing,
            shape = RoundedCornerShape(20.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = BrandEmerald,
                disabledContainerColor = DarkSurfaceVariant
            ),
            contentPadding = PaddingValues(horizontal = 18.dp, vertical = 8.dp),
            modifier = Modifier.height(38.dp)
        ) {
            Icon(
                imageVector = if (isOptimizing) Icons.Default.Refresh else Icons.Default.Bolt,
                contentDescription = null,
                tint = if (isOptimizing) TextMuted else Color(0xFF042F2E),
                modifier = Modifier
                    .size(15.dp)
                    .then(if (isOptimizing) Modifier.rotate(rotation) else Modifier)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = if (isOptimizing) "Optimizing Shield..." else "Optimize Protection",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = if (isOptimizing) TextMuted else Color(0xFF042F2E),
                letterSpacing = 0.3.sp
            )
        }
    }
}

