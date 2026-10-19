package org.pausepoint.app.shield.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import androidx.core.app.NotificationCompat
import org.pausepoint.app.MainActivity
import org.pausepoint.app.shield.core.Scanner

class ChatNotificationListener : NotificationListenerService() {

    private val MONITORED_PACKAGES = setOf(
        "com.whatsapp",
        "com.whatsapp.w4b",
        "org.telegram.messenger",
        "org.telegram.plus"
    )

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null) return
        val packageName = sbn.packageName ?: return

        if (!MONITORED_PACKAGES.contains(packageName)) return

        val extras = sbn.notification.extras ?: return
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: "Chat Contact"
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""

        if (text.isBlank()) return

        val scan = Scanner.scan(text, title)
        if (scan.level == "danger" || scan.level == "suspicious") {
            postFirewallIntervention(title, text, scan.truth, packageName)
        }
    }

    private fun postFirewallIntervention(sender: String, messageSnippet: String, truth: String, sourcePkg: String) {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "pausepoint_chat_shield"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "PausePoint Chat Firewall",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Real-time scam lever intervention for incoming WhatsApp & Telegram messages"
            }
            nm.createNotificationChannel(channel)
        }

        val appLabel = if (sourcePkg.contains("whatsapp")) "WhatsApp" else "Telegram"

        val launchIntent = Intent(this, MainActivity::class.java).apply {
            putExtra("route", "/xray?sender=${sender}&text=${messageSnippet.take(120)}")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            sender.hashCode(),
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("🛑 PausePoint: Suspicious $appLabel Message")
            .setContentText(truth)
            .setStyle(NotificationCompat.BigTextStyle().bigText("Sender: $sender\n$truth\nDo not send money or unlock fees."))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        nm.notify((sender + appLabel).hashCode(), notification)
    }
}
