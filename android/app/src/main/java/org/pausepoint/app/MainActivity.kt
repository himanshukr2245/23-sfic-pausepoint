package org.pausepoint.app

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ZoomIn
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat
import org.pausepoint.app.shield.core.SpeechManager
import org.pausepoint.app.ui.components.BottomNavBar
import org.pausepoint.app.ui.screens.CallDefenseScreen
import org.pausepoint.app.ui.screens.CrisisScreen
import org.pausepoint.app.ui.screens.PaymentBrakeScreen
import org.pausepoint.app.ui.screens.SecurityDashboardScreen
import org.pausepoint.app.ui.screens.SettingsScreen
import org.pausepoint.app.ui.screens.XRayScreen
import org.pausepoint.app.ui.theme.BrandCyan
import org.pausepoint.app.ui.theme.DarkBackground
import org.pausepoint.app.ui.theme.PausePointTheme
import org.pausepoint.app.ui.theme.SurfaceElevated
import org.pausepoint.app.ui.theme.TextPrimary
import org.pausepoint.app.viewmodel.ShieldViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: ShieldViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        SpeechManager.init(this)

        setContent {
            val uiState by viewModel.uiState.collectAsState()
            val view = LocalView.current
            if (!view.isInEditMode) {
                SideEffect {
                    val window = (view.context as ComponentActivity).window
                    WindowCompat.getInsetsController(window, view).apply {
                        isAppearanceLightStatusBars = !uiState.isDarkMode
                        isAppearanceLightNavigationBars = !uiState.isDarkMode
                    }
                }
            }

            PausePointTheme(darkTheme = uiState.isDarkMode) {
                MainAppHost(
                    viewModel = viewModel,
                    onExitApp = { finish() }
                )
            }
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.checkPermissions()
    }

    override fun onDestroy() {
        super.onDestroy()
        SpeechManager.destroy()
    }
}

@Composable
fun MainAppHost(
    viewModel: ShieldViewModel,
    onExitApp: () -> Unit
) {
    var currentRoute by remember { mutableStateOf("security") }
    var lastBackAt by remember { mutableLongStateOf(0L) }
    val uiState by viewModel.uiState.collectAsState()

    // 2-Finger Force Zoom State (Chrome-Style)
    var zoomScale by remember { mutableFloatStateOf(1f) }
    var zoomOffset by remember { mutableStateOf(Offset.Zero) }

    val context = androidx.compose.ui.platform.LocalContext.current

    // Double-back to exit guard
    BackHandler(enabled = true) {
        if (zoomScale > 1.05f) {
            // First back resets zoom if currently magnified
            zoomScale = 1f
            zoomOffset = Offset.Zero
        } else if (currentRoute != "security") {
            SpeechManager.stop()
            currentRoute = "security"
        } else {
            val now = System.currentTimeMillis()
            if (now - lastBackAt < 2000L) {
                onExitApp()
            } else {
                lastBackAt = now
                Toast.makeText(context, "Press back again to exit PausePoint Shield", Toast.LENGTH_SHORT).show()
            }
        }
    }

    Scaffold(
        containerColor = DarkBackground,
        bottomBar = {
            if (currentRoute in listOf("security", "xray", "crisis")) {
                BottomNavBar(
                    currentRoute = currentRoute,
                    onTabSelected = { newRoute ->
                        if (currentRoute != newRoute) {
                            SpeechManager.stop()
                            currentRoute = newRoute
                            zoomScale = 1f
                            zoomOffset = Offset.Zero
                        }
                    }
                )
            }
        },
        modifier = Modifier.fillMaxSize()
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            val zoomModifier = if (uiState.forceZoomEnabled) {
                Modifier
                    .pointerInput(Unit) {
                        detectTransformGestures { _, pan, zoom, _ ->
                            if (zoom != 1f || pan != Offset.Zero) {
                                val newScale = (zoomScale * zoom).coerceIn(1f, 3.5f)
                                zoomScale = newScale
                                if (newScale > 1f) {
                                    val maxPan = 600f * (newScale - 1f)
                                    val newOffset = zoomOffset + pan
                                    zoomOffset = Offset(
                                        newOffset.x.coerceIn(-maxPan, maxPan),
                                        newOffset.y.coerceIn(-maxPan, maxPan)
                                    )
                                } else {
                                    zoomOffset = Offset.Zero
                                }
                            }
                        }
                    }
                    .graphicsLayer {
                        scaleX = zoomScale
                        scaleY = zoomScale
                        translationX = zoomOffset.x
                        translationY = zoomOffset.y
                    }
            } else Modifier

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .then(zoomModifier)
            ) {
                when (currentRoute) {
                    "security" -> SecurityDashboardScreen(
                        viewModel = viewModel,
                        onNavigate = { target ->
                            SpeechManager.stop()
                            currentRoute = target
                            zoomScale = 1f
                            zoomOffset = Offset.Zero
                        }
                    )
                    "xray" -> XRayScreen(
                        viewModel = viewModel,
                        onBack = {
                            SpeechManager.stop()
                            currentRoute = "security"
                            zoomScale = 1f
                            zoomOffset = Offset.Zero
                        }
                    )
                    "crisis" -> CrisisScreen(
                        onBack = {
                            SpeechManager.stop()
                            currentRoute = "security"
                            zoomScale = 1f
                            zoomOffset = Offset.Zero
                        }
                    )
                    "calls" -> CallDefenseScreen(
                        onBack = {
                            SpeechManager.stop()
                            currentRoute = "security"
                            zoomScale = 1f
                            zoomOffset = Offset.Zero
                        }
                    )
                    "brake" -> PaymentBrakeScreen(
                        onBack = {
                            SpeechManager.stop()
                            currentRoute = "security"
                            zoomScale = 1f
                            zoomOffset = Offset.Zero
                        }
                    )
                    "settings" -> SettingsScreen(
                        viewModel = viewModel,
                        onBack = {
                            SpeechManager.stop()
                            currentRoute = "security"
                            zoomScale = 1f
                            zoomOffset = Offset.Zero
                        }
                    )
                }
            }

            // Floating Zoom Magnifier HUD Chip (Active when scaled up)
            if (uiState.forceZoomEnabled && zoomScale > 1.05f) {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = SurfaceElevated,
                    border = BorderStroke(1.dp, BrandCyan.copy(alpha = 0.6f)),
                    shadowElevation = 8.dp,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(top = 16.dp, end = 16.dp)
                        .clickable {
                            zoomScale = 1f
                            zoomOffset = Offset.Zero
                        }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.ZoomIn,
                            contentDescription = null,
                            tint = BrandCyan,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "${String.format(java.util.Locale.US, "%.1f", zoomScale)}x",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = BrandCyan.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = "Reset",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                color = BrandCyan,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
