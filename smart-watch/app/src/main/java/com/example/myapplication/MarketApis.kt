package com.example.myapplication.utils

import okhttp3.Request

object MarketApis {

    val silver: Request = Request.Builder()
        .url("https://api.noghresea.ir/api/market/getSilverPrice")
        .addHeader("Host", "api.noghresea.ir")
        .addHeader("Referer", "https://noghresea.ir/")
        .addHeader("Origin", "https://noghresea.ir")
        .addHeader("platform", "webClient")
        .addHeader("User-Agent", "Mozilla/5.0")
        .build()

    val gold: Request = Request.Builder()
        .url("https://api.talasea.ir/api/market/getGoldPrice")
        .addHeader("Host", "api.talasea.ir")
        .addHeader("Referer", "https://talasea.ir")
        .addHeader("Origin", "https://talasea.ir")
        .addHeader("platform", "webClient")
        .addHeader("User-Agent", "Mozilla/5.0")
        .build()
}
