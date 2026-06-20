'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PriceState, HistoryData } from '@/website/types';

type DataSource = 'live' | 'mock';

interface ApiAssetResponse {
  price: number;
  changePercent: number;
  history: number[];
  labels: string[];
}

interface ApiResponse {
  usd: ApiAssetResponse;
  gold: ApiAssetResponse;
  silver: ApiAssetResponse;
  source: DataSource;
}

export function usePriceData() {
  const [prices, setPrices] = useState<PriceState | null>(null);
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [source, setSource] = useState<DataSource>('mock');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/prices');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiResponse = await res.json();

      setPrices({
        usd: { price: data.usd.price, changePercent: data.usd.changePercent },
        gold: { price: data.gold.price, changePercent: data.gold.changePercent },
        silver: { price: data.silver.price, changePercent: data.silver.changePercent },
      });
      setHistory({
        usd: { prices: data.usd.history, labels: data.usd.labels },
        gold: { prices: data.gold.history, labels: data.gold.labels },
        silver: { prices: data.silver.history, labels: data.silver.labels },
      });
      setSource(data.source);
    } catch {
      setSource('mock');
    } finally {
      setLastUpdate(new Date());
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { prices, history, lastUpdate, source, loading, refresh };
}
