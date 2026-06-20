import { NextResponse } from 'next/server';

const PRICE_TIMEOUT_MS = 6000;
const HISTORY_DAYS = 7;
const FALLBACK_LABELS = ['-6 روز', '-5 روز', '-4 روز', '-3 روز', '-2 روز', 'دیروز', 'امروز'];

const MOCK = {
  usd: { price: 177910, changePercent: 0, history: [171000, 173000, 174500, 175800, 176500, 177200, 177910] },
  gold: { price: 20168000, changePercent: 3.23, history: [19400000, 19550000, 19700000, 19800000, 19920000, 20050000, 20168000] },
  silver: { price: 456000, changePercent: 3.63, history: [420000, 428000, 435000, 440000, 447000, 452000, 456000] },
  source: 'mock' as const,
};

function toNum(str: string): number {
  return parseFloat(str.replace(/,/g, ''));
}

async function fetchWithCookieRetry(url: string): Promise<Response> {
  const pre = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(PRICE_TIMEOUT_MS) });

  if (pre.status >= 300 && pre.status < 400) {
    const rawCookies: string[] =
      typeof (pre.headers as Headers & { getSetCookie?(): string[] }).getSetCookie === 'function'
        ? (pre.headers as Headers & { getSetCookie(): string[] }).getSetCookie()
        : (pre.headers.get('set-cookie') ?? '').split(/,(?=\s*\w+=)/);

    const cookieHeader = rawCookies.map(c => c.split(';')[0].trim()).filter(Boolean).join('; ');
    const location = pre.headers.get('location') ?? url;

    return fetch(location, {
      signal: AbortSignal.timeout(PRICE_TIMEOUT_MS),
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });
  }

  return pre;
}

type MarketApiJson = { price: string; change24h: string };
type TabdealAsset = { price_title: string; last_price: string; price_change: number };
type WeekPriceEntry = { price: number; date: string; fullData: string; createdAt: string };
type LiveQuote = { price: number; changePct: number };
type AssetHistory = { history: number[]; labels: string[] };

function parseMarketResponse(json: MarketApiJson): LiveQuote {
  return {
    price: Math.round(toNum(json.price) * 1000),
    changePct: parseFloat(parseFloat(json.change24h).toFixed(2)),
  };
}

function parseWeekHistory(entries: WeekPriceEntry[]): AssetHistory {
  const order: string[] = [];
  const daily = new Map<string, { price: number; label: string }>();

  for (const entry of entries) {
    if (!daily.has(entry.fullData)) order.push(entry.fullData);
    daily.set(entry.fullData, {
      price: Math.round(entry.price * 1000),
      label: entry.date,
    });
  }

  const lastDays = order.slice(-HISTORY_DAYS);
  return {
    history: lastDays.map(day => daily.get(day)!.price),
    labels: lastDays.map(day => daily.get(day)!.label),
  };
}

async function fetchMarketPrice(
  url: string,
  source: string,
  request: (url: string) => Promise<Response>,
): Promise<LiveQuote> {
  const res = await request(url);
  if (!res.ok) throw new Error(`${source} → ${res.status}`);
  return parseMarketResponse(await res.json() as MarketApiJson);
}

async function fetchWeekHistory(
  url: string,
  source: string,
  request: (url: string) => Promise<Response> = url =>
    fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(PRICE_TIMEOUT_MS) }),
): Promise<AssetHistory> {
  const res = await request(url);
  if (!res.ok) throw new Error(`${source} week → ${res.status}`);
  return parseWeekHistory(await res.json() as WeekPriceEntry[]);
}

async function fetchUsdPrice(): Promise<LiveQuote> {
  const res = await fetch(
    'https://api-web.tabdeal.org/r/festival/get-asset-prices/?asset_type=currency',
    { cache: 'no-store', signal: AbortSignal.timeout(PRICE_TIMEOUT_MS) },
  );
  if (!res.ok) throw new Error(`tabdeal → ${res.status}`);

  const json = await res.json() as TabdealAsset[];
  const usd = json.find(item => item.price_title === 'دلار');
  if (!usd) throw new Error('tabdeal → دلار not found');

  return {
    price: Math.round(toNum(usd.last_price)),
    changePct: parseFloat(Number(usd.price_change).toFixed(2)),
  };
}

const goldFetch = (url: string) =>
  fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(PRICE_TIMEOUT_MS) });

function settledValue<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === 'fulfilled' ? result.value : null;
}

function resolveQuote(
  live: LiveQuote | null,
  mock: typeof MOCK.gold,
  label: string,
): { price: number; changePercent: number } {
  if (!live) console.warn(`[/api/prices] ${label} failed — using mock price`);
  return {
    price: live?.price ?? mock.price,
    changePercent: live?.changePct ?? mock.changePercent,
  };
}

function resolveHistory(
  live: AssetHistory | null,
  mock: typeof MOCK.gold,
  label: string,
): AssetHistory {
  if (!live?.history.length) {
    console.warn(`[/api/prices] ${label} history failed — using mock`);
    return { history: mock.history, labels: FALLBACK_LABELS };
  }
  return live;
}

export async function GET() {
  const [usdResult, goldResult, silverResult, goldHistoryResult, silverHistoryResult] =
    await Promise.allSettled([
      fetchUsdPrice(),
      fetchMarketPrice('https://api.talasea.ir/api/market/getGoldPrice', 'talasea', goldFetch),
      fetchMarketPrice('https://api.noghresea.ir/api/market/getSilverPrice', 'noghresea', fetchWithCookieRetry),
      fetchWeekHistory('https://talasea.ir/api/goldPrice/week', 'talasea', fetchWithCookieRetry),
      fetchWeekHistory('https://noghresea.ir/api/silverPrice/week', 'noghresea', fetchWithCookieRetry),
    ]);

  const liveUsd = settledValue(usdResult);
  const liveGold = settledValue(goldResult);
  const liveSilver = settledValue(silverResult);
  const goldHistory = settledValue(goldHistoryResult);
  const silverHistory = settledValue(silverHistoryResult);

  return NextResponse.json({
    usd: {
      ...resolveQuote(liveUsd, MOCK.usd, 'tabdeal usd'),
      history: [],
      labels: [],
    },
    gold: {
      ...resolveQuote(liveGold, MOCK.gold, 'talasea gold'),
      ...resolveHistory(goldHistory, MOCK.gold, 'talasea gold'),
    },
    silver: {
      ...resolveQuote(liveSilver, MOCK.silver, 'noghresea silver'),
      ...resolveHistory(silverHistory, MOCK.silver, 'noghresea silver'),
    },
    source: (liveUsd || liveGold || liveSilver) ? 'live' : 'mock',
  });
}
