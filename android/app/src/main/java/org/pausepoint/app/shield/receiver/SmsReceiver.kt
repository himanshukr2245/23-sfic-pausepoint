package org.pausepoint.app.shield.receiver

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Telephony
import androidx.core.app.NotificationCompat
import org.pausepoint.app.MainActivity
import org.pausepoint.app.shield.core.AckParser
import org.pausepoint.app.shield.core.DebitSniffer
import org.pausepoint.app.shield.core.Scanner

class SmsReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        if (messages.isNullOrEmpty()) return

        val fullText = messages.joinToString("") { it.messageBody ?: "" }
        val sender = messages[0].displayOriginatingAddress ?: "Unknown"

        // 1. Check for NCRP 1930 Acknowledgement SMS
        val ack = AckParser.parse(fullText)
        if (ack.isValidNcrp && ack.ackNumber != null) {
            postAckNotification(context, ack.ackNumber)
            return
        }

        // 2. Check for Bank Debit SMS
        val debit = DebitSniffer.inspect(fullText)
        if (debit.isDebit && debit.amount != null) {
            postDebitNotification(context, debit.amount, sender)
        }

        // 3. Scan message for Scam Levers & Playbooks
        val scan = Scanner.scan(fullText, sender)
        if (scan.level == "danger" || scan.level == "suspicious") {
            postScamAlert(context, scan.headline, scan.truth, sender, fullText)
        }
    }

    private fun postScamAlert(context: Context, headline: String, truth: String, sender: String, fullText: String) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "pausepoint_shield_alerts"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "PausePoint Scam Firewall",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Immediate heads-up alerts when incoming messages contain scam levers"
            }
            nm.createNotificationChannel(channel)
        }

        val launchIntent = Intent(context, MainActivity::class.java).apply {
            putExtra("route", "/xray?sender=${sender}&text=${fullText.take(120)}")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            sender.hashCode(),
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("⚠️ PausePoint Alert: Suspicious Message")
            .setContentText(truth)
            .setStyle(NotificationCompat.BigTextStyle().bigText("From: $sender\n$truth\nTap to inspect forensics."))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        nm.notify(sender.hashCode(), notification)
    }

    private fun postAckNotification(context: Context, ackNumber: String) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "pausepoint_shield_ack"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "NCRP Acknowledgements", NotificationManager.IMPORTANCE_DEFAULT)
            nm.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("1930 Complaint Confirmed")
            .setContentText("Acknowledgement Number $ackNumber captured. Stored on device.")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        nm.notify(ackNumber.hashCode(), notification)
    }

    private fun postDebitNotification(context: Context, amount: Double, sender: String) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "pausepoint_shield_debit"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "PausePoint Money Watch", NotificationManager.IMPORTANCE_HIGH)
            nm.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentTitle("PausePoint Money Watch: Debit Detected")
            .setContentText("Rs $amount transferred. Did you pay a stranger under pressure? Golden Hour protection is active.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        nm.notify(amount.toInt(), notification)
    }
}
