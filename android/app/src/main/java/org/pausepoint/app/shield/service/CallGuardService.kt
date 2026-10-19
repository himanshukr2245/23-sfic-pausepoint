package org.pausepoint.app.shield.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.telecom.Call
import android.telecom.CallScreeningService
import androidx.core.app.NotificationCompat
import org.pausepoint.app.shield.core.Scanner

class CallGuardService : CallScreeningService() {

    override fun onScreenCall(callDetails: Call.Details) {
        val handle = callDetails.handle
        val phoneNumber = handle?.schemeSpecificPart ?: ""

        val response = CallResponse.Builder()

        if (phoneNumber.isNotBlank()) {
            val isTraiOfficial = Scanner.isTrai1600Series(phoneNumber)
            if (isTraiOfficial) {
                // Official TRAI 1600 series service/transactional call: Allow through cleanly
                response.setDisallowCall(false)
            } else {
                // Regular or unknown call: check if it claims authority or is from an unverified 10-digit number
                val cleanDigits = phoneNumber.replace("\\D".toRegex(), "")
                if (cleanDigits.length == 10 && (cleanDigits.startsWith("9") || cleanDigits.startsWith("8") || cleanDigits.startsWith("7") || cleanDigits.startsWith("6"))) {
                    // Regular Indian mobile number. Scammers posing as CBI/Police/Customs always use personal mobiles.
                    notifyPotentialScamCall(phoneNumber)
                }
                response.setDisallowCall(false)
            }
        }

        respondToCall(callDetails, response.build())
    }

    private fun notifyPotentialScamCall(number: String) {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "pausepoint_call_guard"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "PausePoint Call Guard",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Heads-up alert for unverified phone callers claiming authority"
            }
            nm.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("PausePoint Call Guard Active")
            .setContentText("Incoming call from personal mobile ($number). Remember: Police and CBI NEVER investigate via phone or WhatsApp calls.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        nm.notify(number.hashCode(), notification)
    }
}
