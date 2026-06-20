export interface AssetPrice {
  price: number;
  changePercent: number;
}

export interface PriceState {
  usd: AssetPrice;
  gold: AssetPrice;
  silver: AssetPrice;
}

export type AssetKey = 'usd' | 'gold' | 'silver';

export interface AssetHistory {
  prices: number[];
  labels: string[];
}

export interface HistoryData {
  usd: AssetHistory;
  gold: AssetHistory;
  silver: AssetHistory;
}

export interface PriceCardProps {
  icon: string;
  iconColor: string;
  title: string;
  price: number;
  changePercent: number;
  detail: string;
}
