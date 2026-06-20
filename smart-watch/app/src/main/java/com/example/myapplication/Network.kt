package com.example.myapplication.presentation

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject

suspend fun fetchPrice(request: Request): String {
    val client = OkHttpClient()

    return withContext(Dispatchers.IO) {
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) return@withContext "نامشخص"
            val json = JSONObject(response.body!!.string())
            json.optString("price", "نامشخص")
        }
    }
}
