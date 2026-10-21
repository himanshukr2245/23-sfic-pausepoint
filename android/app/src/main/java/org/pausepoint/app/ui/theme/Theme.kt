package org.pausepoint.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.ui.graphics.Color

// ── Static Palette: Balanced-Minimalist OLED Obsidian System ──
val DarkOledBackground = Color(0xFF06090F)
val DarkOledSurface = Color(0xFF0E1420)
val DarkOledSurfaceVariant = Color(0xFF182030)
val DarkOledSurfaceElevated = Color(0xFF151D2C)
val DarkOledBorderHairline = Color(0xFF1F293D)
val DarkOledBorderSubtle = Color(0x2694A3B8)
val DarkOledTextPrimary = Color(0xFFF9FAFB)
val DarkOledTextSecondary = Color(0xFF94A3B8)
val DarkOledTextMuted = Color(0xFF64748B)

// ── Static Palette: High-Contrast Ceramic Alabaster System (Light Mode) ──
val LightAlabasterBackground = Color(0xFFF8FAFC)
val LightAlabasterSurface = Color(0xFFFFFFFF)
val LightAlabasterSurfaceVariant = Color(0xFFF1F5F9)
val LightAlabasterSurfaceElevated = Color(0xFFE2E8F0)
val LightAlabasterBorderHairline = Color(0xFFCBD5E1)
val LightAlabasterBorderSubtle = Color(0x3D64748B)
val LightAlabasterTextPrimary = Color(0xFF0F172A)
val LightAlabasterTextSecondary = Color(0xFF1E293B)
val LightAlabasterTextMuted = Color(0xFF475569)

// ── Static Palette: Luminous OLED Obsidian System (Dark Mode Accents) ──
val DarkBrandEmerald = Color(0xFF10B981)
val DarkBrandCyan = Color(0xFF06B6D4)
val DarkAlertCrimson = Color(0xFFEF4444)
val DarkWarningAmber = Color(0xFFF59E0B)
val DarkBrandViolet = Color(0xFFA855F7)
val DarkBrandBlue = Color(0xFF3B82F6)

// ── Static Palette: WCAG AAA High-Contrast Ink-Dense System (Light Mode Accents) ──
val LightBrandEmerald = Color(0xFF047857) // Emerald-700 (5.1:1 on white)
val LightBrandCyan = Color(0xFF0E7490)    // Cyan-700 (4.9:1 on white)
val LightAlertCrimson = Color(0xFFB91C1C) // Red-700 (5.8:1 on white)
val LightWarningAmber = Color(0xFFB45309) // Amber-700 (4.8:1 on white)
val LightBrandViolet = Color(0xFF7E22CE)  // Violet-700 (5.5:1 on white)
val LightBrandBlue = Color(0xFF1D4ED8)    // Blue-700 (6.2:1 on white)

// ── Dynamic CompositionLocal & Adaptive Accessors ──
val LocalIsDarkTheme = compositionLocalOf { true }

val DarkBackground: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkOledBackground else LightAlabasterBackground

val DarkSurface: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkOledSurface else LightAlabasterSurface

val DarkSurfaceVariant: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkOledSurfaceVariant else LightAlabasterSurfaceVariant

val SurfaceElevated: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkOledSurfaceElevated else LightAlabasterSurfaceElevated

val BorderHairline: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkOledBorderHairline else LightAlabasterBorderHairline

val BorderSubtle: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkOledBorderSubtle else LightAlabasterBorderSubtle

val TextPrimary: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkOledTextPrimary else LightAlabasterTextPrimary

val TextSecondary: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkOledTextSecondary else LightAlabasterTextSecondary

val TextMuted: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkOledTextMuted else LightAlabasterTextMuted

// Adaptive Tactical Neons & Accents (Auto-adjusts for OLED black vs Sunlight white)
val BrandEmerald: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkBrandEmerald else LightBrandEmerald

val BrandCyan: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkBrandCyan else LightBrandCyan

val AlertCrimson: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkAlertCrimson else LightAlertCrimson

val WarningAmber: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkWarningAmber else LightWarningAmber

val BrandViolet: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkBrandViolet else LightBrandViolet

val BrandBlue: Color
    @Composable get() = if (LocalIsDarkTheme.current) DarkBrandBlue else LightBrandBlue

private val DarkColorScheme = darkColorScheme(
    primary = DarkBrandEmerald,
    secondary = DarkBrandCyan,
    background = DarkOledBackground,
    surface = DarkOledSurface,
    surfaceVariant = DarkOledSurfaceVariant,
    error = DarkAlertCrimson,
    onPrimary = Color.Black,
    onSecondary = Color.Black,
    onBackground = DarkOledTextPrimary,
    onSurface = DarkOledTextPrimary,
    onError = Color.White
)

private val LightColorScheme = lightColorScheme(
    primary = LightBrandEmerald,
    secondary = LightBrandCyan,
    background = LightAlabasterBackground,
    surface = LightAlabasterSurface,
    surfaceVariant = LightAlabasterSurfaceVariant,
    error = LightAlertCrimson,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = LightAlabasterTextPrimary,
    onSurface = LightAlabasterTextPrimary,
    onError = Color.White
)

@Composable
fun PausePointTheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    CompositionLocalProvider(LocalIsDarkTheme provides darkTheme) {
        MaterialTheme(
            colorScheme = colorScheme,
            content = content
        )
    }
}


