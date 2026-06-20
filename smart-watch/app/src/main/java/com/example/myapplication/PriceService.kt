package com.example.myapplication.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.media.ToneGenerator
import androidx.core.app.NotificationCompat
import com.example.myapplication.R
import com.example.myapplication.utils.MarketApis
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request

class PriceService : Service() {

    private val client = OkHttpClient()
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val mainHandler = Handler(Looper.getMainLooper())
    private val NOTIFICATION_ID = 1
    private val CHANNEL_ID = "price_service_channel"
    private var fetchJob: kotlinx.coroutines.Job? = null

    companion object {
        const val ACTION_PRICE_UPDATE = "com.example.myapplication.PRICE_UPDATE"
        const val EXTRA_SILVER_PRICE = "extra_silver_price"
        const val EXTRA_GOLD_PRICE = "extra_gold_price"
        const val EXTRA_PRICE_CHANGE = "extra_price_change" // "up", "down", or null
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        android.util.Log.d("PriceService", "onStartCommand called")
        
        // Cancel existing job if any
        fetchJob?.cancel()
        
        val notification = createNotification()

        // Safe for Android 14+
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                startForeground(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE)
            } else {
                startForeground(NOTIFICATION_ID, notification)
            }
            android.util.Log.d("PriceService", "Service started in foreground")
        } catch (e: Exception) {
            android.util.Log.e("PriceService", "Error starting foreground", e)
        }

        val vibrator = getSystemService(VIBRATOR_SERVICE) as Vibrator

        fetchJob = scope.launch {
            android.util.Log.d("PriceService", "Starting price fetch loop")
            var lastSilverPrice: Double? = null

            // Fetch immediately on start, then every second
            while (true) {
                try {
                    val silverText = fetchPrice(MarketApis.silver)
                    val goldText = fetchPrice(MarketApis.gold)

                    android.util.Log.d("PriceService", "Fetched - Silver: $silverText, Gold: $goldText")

                    val silverNumber = silverText.toDoubleOrNull()
                    var priceChange: String? = null

                    if (silverNumber != null && lastSilverPrice != null && vibrator.hasVibrator()) {
                        if (silverNumber > lastSilverPrice) {
                            vibrate(vibrator, 1)
                            playSound(ToneGenerator.TONE_CDMA_ALERT_CALL_GUARD) // صدای بالا رفتن قیمت
                            priceChange = "up" // قیمت بالا رفت
                            android.util.Log.d("PriceService", "Silver price increased: $lastSilverPrice -> $silverNumber")
                        } else if (silverNumber < lastSilverPrice) {
                            vibrate(vibrator, 4)
                            playSound(ToneGenerator.TONE_CDMA_EMERGENCY_RINGBACK) // صدای پایین آمدن قیمت
                            priceChange = "down" // قیمت پایین آمد
                            android.util.Log.d("PriceService", "Silver price decreased: $lastSilverPrice -> $silverNumber")
                        }
                    }

                    // Send broadcast with latest prices so UI can update
                    sendPriceBroadcast(
                        silverPrice = silverText,
                        goldPrice = goldText,
                        priceChange = priceChange
                    )

                    lastSilverPrice = silverNumber
                } catch (e: Exception) {
                    android.util.Log.e("PriceService", "Error in price fetch loop", e)
                    e.printStackTrace()
                }

                delay(1000) // هر 1 ثانیه چک کن
            }
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        android.util.Log.d("PriceService", "onDestroy called")
        fetchJob?.cancel()
        scope.cancel()
    }

    private fun createNotification(): Notification {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Price Service",
                NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Price Service Running")
            .setContentText("Updating prices in background")
            .setSmallIcon(R.drawable.ic_notification)
            .build()
    }

    private suspend fun vibrate(vibrator: Vibrator, times: Int) {
        repeat(times) {
            vibrator.vibrate(
                VibrationEffect.createOneShot(
                    120,
                    VibrationEffect.DEFAULT_AMPLITUDE
                )
            )
            delay(200)
        }
    }

    private fun playSound(toneType: Int) {
        try {
            val toneGenerator = ToneGenerator(android.media.AudioManager.STREAM_NOTIFICATION, 100)
            toneGenerator.startTone(toneType, 200) // پخش صدا به مدت 200 میلی‌ثانیه
            android.util.Log.d("PriceService", "Sound played: $toneType")
        } catch (e: Exception) {
            android.util.Log.e("PriceService", "Error playing sound", e)
        }
    }

    private suspend fun fetchPrice(request: Request): String {
        return withContext(Dispatchers.IO) {
            try {
                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        android.util.Log.e("PriceService", "HTTP ${response.code} - ${response.message}")
                        return@withContext "نامشخص"
                    }
                    val bodyString = response.body?.string() ?: return@withContext "نامشخص"
                    android.util.Log.d("PriceService", "Response body: $bodyString")
                    
                    // Parse JSON to extract price field
                    try {
                        val json = org.json.JSONObject(bodyString)
                        val price = json.optString("price", null)
                        if (price.isNullOrEmpty()) {
                            // Try other possible field names
                            val priceValue = json.optDouble("price", Double.NaN)
                            if (!priceValue.isNaN()) {
                                return@withContext priceValue.toString()
                            }
                            android.util.Log.e("PriceService", "No price field found in JSON: $bodyString")
                            return@withContext "نامشخص"
                        }
                        return@withContext price
                    } catch (e: org.json.JSONException) {
                        android.util.Log.e("PriceService", "JSON parsing error: $bodyString", e)
                        // If it's not JSON, maybe it's just a number?
                        val number = bodyString.trim().toDoubleOrNull()
                        return@withContext number?.toString() ?: "نامشخص"
                    }
                }
            } catch (e: Exception) {
                android.util.Log.e("PriceService", "Error fetching price", e)
                e.printStackTrace()
                "نامشخص"
            }
        }
    }

    private fun sendPriceBroadcast(silverPrice: String, goldPrice: String, priceChange: String? = null) {
        try {
            val intent = Intent(ACTION_PRICE_UPDATE).apply {
                putExtra(EXTRA_SILVER_PRICE, silverPrice)
                putExtra(EXTRA_GOLD_PRICE, goldPrice)
                priceChange?.let { putExtra(EXTRA_PRICE_CHANGE, it) }
                // Use explicit package name for app-scoped broadcast
                setPackage(packageName)
            }
            
            // Send broadcast - Android will deliver it to registered receivers in our app
            sendBroadcast(intent)
            
            android.util.Log.d("PriceService", "Broadcast sent - Silver: $silverPrice, Gold: $goldPrice, Change: $priceChange")
        } catch (e: Exception) {
            android.util.Log.e("PriceService", "Error sending broadcast", e)
            e.printStackTrace()
        }
    }
}
