package com.example.myapplication.presentation

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class PriceViewModel : ViewModel() {

    private val _silver = MutableStateFlow("—")
    val silver: StateFlow<String> = _silver.asStateFlow()

    private val _gold = MutableStateFlow("—")
    val gold: StateFlow<String> = _gold.asStateFlow()

    fun updatePrices(silverPrice: String, goldPrice: String) {
        android.util.Log.d("PriceViewModel", "updatePrices called - Silver: $silverPrice, Gold: $goldPrice")
        android.util.Log.d("PriceViewModel", "Current state before update - Silver: ${_silver.value}, Gold: ${_gold.value}")
        
        // Update on current thread (should be main thread)
        _silver.value = silverPrice
        _gold.value = goldPrice
        
        android.util.Log.d("PriceViewModel", "State updated - Silver: ${_silver.value}, Gold: ${_gold.value}")
    }
}

