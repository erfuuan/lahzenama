<div align="center">

<img src="logo.png" alt="لوگوی لحظه‌نما — نمودار خطی طلایی با روند صعودی روی پس‌زمینه آبی تیره" width="128" />

# لحظه‌نما

**لحظه‌نما** — قیمت لحظه‌ای طلا، نقره و دلار ایران با نمودار ۷ روزه

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Wear OS](https://img.shields.io/badge/Wear%20OS-3%2B-green?logo=wear-os)](https://wearos.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Kotlin](https://img.shields.io/badge/Kotlin-Compose-purple?logo=kotlin)](https://kotlinlang.org/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE.md)

_قیمت لحظه‌ای طلا، نقره و دلار در وب و ساعت هوشمند_

**[English](README.md)** · فارسی

</div>

---

## نمای کلی

لحظه‌نما یک مونورپو با دو کلاینت است که از همان منابع داده بازار استفاده می‌کنند:

| اپلیکیشن                        | پشته فنی                                      | کاربرد                                                              |
| ------------------------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| [`website/`](website/)          | Next.js 14 · TypeScript · Tailwind · Chart.js | PWA قابل نصب با کارت قیمت، نمودار ۷ روزه و حالت تاریک                |
| [`smart-watch/`](smart-watch/)  | Kotlin · Jetpack Compose · OkHttp             | همراه Wear OS با سرویس پیش‌زمینه برای به‌روز نگه‌داشتن قیمت‌ها      |

وقتی APIهای بالادستی در دسترس نباشند، هر دو کلاینت به دادهٔ mock داخلی برمی‌گردند تا رابط کاربری از کار نیفتد.

> وقتی منابع آنلاین در دسترس نباشند، قیمت‌ها به دادهٔ mock داخلی برمی‌گردند تا اپلیکیشن همچنان کار کند.

---

## ویژگی‌ها

- **قیمت لحظه‌ای** — دلار، طلا (۱۸ عیار) و نقره با تغییر ۲۴ ساعته
- **روند ۷ روزه** — نمودارهای تعاملی با Chart.js
- **دریافت مقاوم** — تلاش مجدد با کوکی/ری‌دایرکت، تایم‌اوت کوتاه، بازگشت خودکار به mock
- **PWA** — قابل نصب روی موبایل و دسکتاپ با `@ducanh2912/next-pwa`
- **چیدمان RTL** — فونت وزیرمتن و برچسب‌های فارسی در سراسر اپ
- **Wear OS** — جریان همیشه‌روشن قیمت از طریق سرویس پیش‌زمینه (API 30+)

---

## شروع سریع

### وب‌سایت

```bash
cd website
cp .env.local.example .env.local   # اختیاری — فعلاً کلید API لازم نیست
npm install
npm run dev                        # → http://localhost:3000
```

### ساعت هوشمند

```bash
cd smart-watch
./gradlew assembleDebug
```

یا پوشهٔ `smart-watch/` را در Android Studio باز کنید، Gradle را sync کنید و روی شبیه‌ساز یا دستگاه Wear OS (API 30+) اجرا کنید.

---

## ساختار مخزن

```
lahzenama/
├── website/                    # PWA با Next.js
│   ├── app/
│   │   ├── api/prices/         # تجمیع APIهای بازار بالادستی
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/             # PriceCard, TrendChart, PricesGrid, Header, …
│   ├── hooks/usePriceData.ts   # polling سمت کلاینت
│   ├── public/                 # آیکون‌ها، manifest، service worker، وزیرمتن
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── smart-watch/                # اپ Wear OS
    └── app/src/main/java/com/example/myapplication/
        ├── presentation/       # MainActivity, PriceViewModel, theme
        ├── MarketApis.kt       # کلاینت API قیمت بالادستی
        ├── Network.kt          # کلاینت OkHttp
        ├── PriceService.kt     # سرویس پیش‌زمینه قیمت
        └── WatchScreen.kt      # رابط Compose
```

---

## وب‌سایت

**Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS** · **chart.js** / **react-chartjs-2** · **next-themes**

### پیش‌نیازها

- Node.js ≥ 18
- npm

### اسکریپت‌ها

| دستور           | توضیح                  |
| --------------- | ---------------------- |
| `npm run dev`   | سرور توسعه             |
| `npm run build` | بیلد production        |
| `npm run start` | سرو production build   |
| `npm run lint`  | ESLint                 |

### جریان دریافت قیمت

```
مرورگر  →  GET /api/prices  →  APIهای بازار بالادستی
                                    ↓ (در صورت خطا)
                               مجموعه MOCK
```

مسیر API ([`website/app/api/prices/route.ts`](website/app/api/prices/route.ts)) از منابع بالادستی با تلاش مجدد کوکی/ری‌دایرکت و تایم‌اوت ۶ ثانیه‌ای دریافت می‌کند. کلاینت از طریق [`hooks/usePriceData.ts`](website/hooks/usePriceData.ts) polling می‌کند.

کلید API لازم نیست — [`website/.env.local.example`](website/.env.local.example) را ببینید.

### Docker

```bash
cd website
docker compose up --build
```

---

## ساعت هوشمند

**Kotlin** · **Jetpack Compose (Material 3)** · **OkHttp** · **kotlinx-coroutines**

| تنظیم        | مقدار           |
| ------------ | --------------- |
| `minSdk`     | 30 (Wear OS 3+) |
| `compileSdk` | 35              |

### پیش‌نیازها

- Android Studio (Ladybug یا جدیدتر)
- JDK 11+
- Android SDK 35

### Android Studio

1. پوشهٔ `smart-watch/` را باز کنید.
2. Gradle را sync کنید — `local.properties` به‌صورت خودکار ساخته می‌شود و در git نادیده گرفته می‌شود.
3. یک دستگاه Wear OS وصل کنید یا شبیه‌ساز (API 30+) راه بیندازید.
4. پیکربندی **app** را اجرا کنید.

<div align="center">

<img src="photo.jpg" alt="لحظه‌نما روی ساعت Wear OS — قیمت طلا و نقره در Android Studio" width="500" />

</div>

> `local.properties` یا keystore امضا (`*.jks`, `*.keystore`) را commit نکنید.

---

## نکات توسعه

`.gitignore` در ریشهٔ مخزن، خروجی بیلد و اطلاعات حساس را نادیده می‌گیرد:

| دسته      | مسیرهای نادیده‌گرفته‌شده                                                  |
| --------- | ------------------------------------------------------------------------- |
| Next.js   | `.next/`, `node_modules/`, `*.tsbuildinfo`, `next-env.d.ts`               |
| Android   | `.gradle/`, `.kotlin/`, `**/build/`, `local.properties`, `*.apk`, `*.jks` |
| Secrets   | `.env`, `.env*.local` (فایل‌های `.example` نگه داشته می‌شوند)             |

---

## مجوز

این پروژه تحت مجوز [GNU General Public License نسخهٔ ۳](LICENSE.md) (GPL-3.0) منتشر شده است.
