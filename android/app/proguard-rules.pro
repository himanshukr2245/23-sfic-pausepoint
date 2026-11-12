# ==============================================================================
# PausePoint Shield — Production R8 Obfuscation & Bytecode Hardening Rules
# ==============================================================================

# 1. Bytecode Obfuscation & Repackaging (Flattens packages to conceal code structure)
-repackageclasses ''
-allowaccessmodification
-dontusemixedcaseclassnames

# 2. Keep Core Android Lifecycle Entry Points declared in AndroidManifest.xml
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# 3. Explicitly Protect Native Background Security Services
-keep class org.pausepoint.app.shield.service.ChatNotificationListener { *; }
-keep class org.pausepoint.app.shield.service.CallGuardService { *; }

# 4. Preserve Jetpack Compose Runtime and Composable Functions
-keep class androidx.compose.runtime.** { *; }
-keepclassmembers class * {
    @androidx.compose.runtime.Composable *;
}

# 5. ViewModel Reflection Compatibility
-keepclassmembers class * extends androidx.lifecycle.ViewModel {
    <init>(...);
}

# 6. Keep State Models & Threat Data Schemas
-keepclassmembers class org.pausepoint.app.viewmodel.** {
    *;
}
-keepclassmembers class org.pausepoint.app.shield.core.** {
    *;
}

# 7. Retain Critical Annotations and Generic Signatures for Coroutines / Serialization
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

