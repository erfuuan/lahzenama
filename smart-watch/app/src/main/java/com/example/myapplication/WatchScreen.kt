package com.example.myapplication.presentation

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.view.WindowManager
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color
import kotlinx.coroutines.delay
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.myapplication.service.PriceService

@Composable
fun WatchScreen(
    viewModel: PriceViewModel = viewModel()
) {
    val context = LocalContext.current
    val currentViewModel by rememberUpdatedState(viewModel)
    
    // State for flash effect
    var flashColor by remember { mutableStateOf<Color?>(null) }
    var flashOpacity by remember { mutableStateOf(0f) }
    val animatedOpacity by animateFloatAsState(
        targetValue = flashOpacity,
        animationSpec = tween(durationMillis = 150),
        label = "flashOpacity"
    )

    // Keep screen on (optional)
    (context as? Activity)?.window?.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

    // Start foreground service only once
    LaunchedEffect(Unit) {
        android.util.Log.d("WatchScreen", "Starting PriceService")
        try {
            val intent = Intent(context, PriceService::class.java)
            // Safe for Android O+ (including Android 14)
            ContextCompat.startForegroundService(context, intent)
            android.util.Log.d("WatchScreen", "PriceService startForegroundService called")
        } catch (e: Exception) {
            android.util.Log.e("WatchScreen", "Error starting service", e)
        }
    }

    // Register BroadcastReceiver tied to the composable lifecycle
    DisposableEffect(context) {
        android.util.Log.d("WatchScreen", "Registering BroadcastReceiver")
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context?, intent: Intent?) {
                android.util.Log.d("WatchScreen", "Broadcast received: ${intent?.action}")
                if (intent?.action != PriceService.ACTION_PRICE_UPDATE) {
                    android.util.Log.d("WatchScreen", "Ignoring broadcast with action: ${intent?.action}")
                    return
                }

                val silver = intent.getStringExtra(PriceService.EXTRA_SILVER_PRICE)
                val gold = intent.getStringExtra(PriceService.EXTRA_GOLD_PRICE)
                val priceChange = intent.getStringExtra(PriceService.EXTRA_PRICE_CHANGE)
                
                android.util.Log.d("WatchScreen", "Received data - Silver: $silver, Gold: $gold, Change: $priceChange")
                
                if (silver == null || gold == null) {
                    android.util.Log.e("WatchScreen", "Missing price data - Silver: $silver, Gold: $gold")
                    return
                }

                // Update ViewModel and trigger flash on main thread
                android.os.Handler(android.os.Looper.getMainLooper()).post {
                    android.util.Log.d("WatchScreen", "Updating prices on main thread - Silver: $silver, Gold: $gold")
                    currentViewModel.updatePrices(silver, gold)
                    
                    // Trigger flash effect based on price change
                    when (priceChange) {
                        "up" -> {
                            flashColor = Color(0xFF4CAF50) // سبز
                            android.util.Log.d("WatchScreen", "Triggering green flash")
                        }
                        "down" -> {
                            flashColor = Color(0xFFF44336) // قرمز
                            android.util.Log.d("WatchScreen", "Triggering red flash")
                        }
                    }
                }
            }
        }

        val filter = IntentFilter(PriceService.ACTION_PRICE_UPDATE)
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                context.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
            } else {
                @Suppress("DEPRECATION")
                context.registerReceiver(receiver, filter)
            }
            android.util.Log.d("WatchScreen", "BroadcastReceiver registered successfully for action: ${PriceService.ACTION_PRICE_UPDATE}")
        } catch (e: Exception) {
            android.util.Log.e("WatchScreen", "Error registering receiver", e)
            e.printStackTrace()
        }

        onDispose {
            try {
                context.unregisterReceiver(receiver)
                android.util.Log.d("WatchScreen", "BroadcastReceiver unregistered")
            } catch (e: Exception) {
                android.util.Log.e("WatchScreen", "Error unregistering receiver", e)
            }
        }
    }

    // Flash effect animation
    LaunchedEffect(flashColor) {
        if (flashColor != null) {
            // Flash 3 times
            repeat(3) {
                flashOpacity = 0.6f
                delay(100)
                flashOpacity = 0f
                delay(100)
            }
            // Reset color after animation
            delay(100)
            flashColor = null
        }
    }

    // Observe state from viewModel
    val silver by viewModel.silver.collectAsState()
    val gold by viewModel.gold.collectAsState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(10.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {

                PriceCard(
                    title = "Silver",
                    value = silver,
                    emoji = "🥈"
                )

                Spacer(Modifier.height(10.dp))

                PriceCard(
                    title = "Gold",
                    value = gold,
                    emoji = "🥇"
                )
            }
            
            // Flash overlay
            if (flashColor != null && animatedOpacity > 0f) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(flashColor!!.copy(alpha = animatedOpacity))
                )
            }
        }
    }
}

@Composable
private fun PriceCard(
    title: String,
    value: String,
    emoji: String
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                MaterialTheme.colorScheme.surfaceVariant,
                RoundedCornerShape(14.dp)
            )
            .padding(vertical = 10.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {

        Text(
            "$emoji  $title",
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(Modifier.height(4.dp))

        Text(
            value,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
