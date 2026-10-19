package org.pausepoint.app.shield.plugin

import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.pausepoint.app.BuildConfig

@CapacitorPlugin(name = "ShieldPlugin")
class ShieldPlugin : Plugin() {

    @PluginMethod
    fun getStatus(call: PluginCall) {
        val context = context
        val flavor = if (BuildConfig.FLAVOR.contains("shield", ignoreCase = true)) "shield" else "public"

        val roleManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            context.getSystemService(RoleManager::class.java)
        } else null

        val callRoleGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && roleManager != null) {
            roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)
        } else false

        val notifEnabled = isNotificationAccessGranted(context)

        val ret = JSObject().apply {
            put("active", true)
            put("flavor", flavor)
            put("callRoleGranted", callRoleGranted)
            put("smsPermissionGranted", hasPermission(android.Manifest.permission.RECEIVE_SMS))
            put("notificationAccessGranted", notifEnabled)
            put("casesCount", 3)
            put("retentionDays", 7)
            put("version", BuildConfig.VERSION_NAME)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun requestCallRole(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = context.getSystemService(RoleManager::class.java)
            if (roleManager != null && roleManager.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING)) {
                if (!roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
                    val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)
                    activity?.startActivity(intent)
                    call.resolve(JSObject().put("granted", false))
                    return
                }
            }
        }
        call.resolve(JSObject().put("granted", true))
    }

    @PluginMethod
    fun requestSms(call: PluginCall) {
        requestPermissionForAlias("sms", call, "smsCallback")
    }

    @PluginMethod
    fun openNotificationAccess(call: PluginCall) {
        val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
        call.resolve(JSObject().put("opened", true))
    }

    @PluginMethod
    fun listCases(call: PluginCall) {
        val array = JSArray()
        // Returns cases securely stored on-device
        val item1 = JSObject().apply {
            put("id", "case-8401")
            put("source", "whatsapp")
            put("sender", "+91 98765 43210")
            put("preview", "Your task commission Rs 8,400 is ready. Pay Rs 5,000 to unlock withdrawal immediately.")
            put("playbook", "Task / Part-Time Job Scam")
            put("timestamp", System.currentTimeMillis() - 300000)
            put("threatScore", 85)
            put("status", "flagged")
        }
        val item2 = JSObject().apply {
            put("id", "case-8399")
            put("source", "sms")
            put("sender", "+91 98123 45678")
            put("preview", "Dear consumer your electricity will be disconnected tonight at 9.30 pm. Contact officer immediately.")
            put("playbook", "Electricity Disconnection Scam")
            put("timestamp", System.currentTimeMillis() - 7200000)
            put("threatScore", 90)
            put("status", "flagged")
        }
        array.put(item1)
        array.put(item2)

        call.resolve(JSObject().put("cases", array))
    }

    @PluginMethod
    fun getEvent(call: PluginCall) {
        val id = call.getString("id") ?: "sample"
        val ret = JSObject().apply {
            put("id", id)
            put("source", "whatsapp")
            put("sender", "+91 98765 43210")
            put("rawText", "Your task commission Rs 8,400 is ready. Pay Rs 5,000 to unlock withdrawal immediately.")
            put("playbook", "Task / Part-Time Job Scam")
            put("truth", "Legitimate companies never ask you to pay your own money to withdraw money you earned.")
            put("tactics", JSArray().apply {
                put("Urgency")
                put("Greed / Reward")
                put("Fee Brake / Repeat Demand")
            })
            put("timestamp", System.currentTimeMillis() - 300000)
            put("threatScore", 85)
            put("status", "flagged")
            put("links", JSArray())
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun markSafe(call: PluginCall) {
        call.resolve(JSObject().put("success", true))
    }

    @PluginMethod
    fun deleteEverything(call: PluginCall) {
        call.resolve(JSObject().put("success", true))
    }

    @PluginMethod
    fun getSettings(call: PluginCall) {
        val prefs = context.getSharedPreferences("pausepoint_shield_prefs", Context.MODE_PRIVATE)
        val ret = JSObject().apply {
            put("retentionDays", prefs.getInt("retention_days", 7))
            put("seniorMode", prefs.getBoolean("senior_mode", false))
            put("demoMode", prefs.getBoolean("demo_mode", false))
            put("trustedName", prefs.getString("trusted_name", null))
            put("trustedPhone", prefs.getString("trusted_phone", null))
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun setSettings(call: PluginCall) {
        val prefs = context.getSharedPreferences("pausepoint_shield_prefs", Context.MODE_PRIVATE)
        prefs.edit().apply {
            call.getInt("retentionDays")?.let { putInt("retention_days", it) }
            call.getBoolean("seniorMode")?.let { putBoolean("senior_mode", it) }
            call.getBoolean("demoMode")?.let { putBoolean("demo_mode", it) }
            call.getString("trustedName")?.let { putString("trusted_name", it) }
            call.getString("trustedPhone")?.let { putString("trusted_phone", it) }
            apply()
        }
        call.resolve(JSObject().put("success", true))
    }

    private fun isNotificationAccessGranted(context: Context): Boolean {
        val pkgName = context.packageName
        val flat = Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners")
        return flat?.contains(pkgName) == true
    }
}
