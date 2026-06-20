import PriceCard from "./PriceCard";
import type { PriceState } from "@/website/types";

function SkeletonCard() {
  return (
    <div className="bg-[rgba(245,248,250,0.9)] dark:bg-[rgba(18,25,45,0.7)] backdrop-blur-md rounded-2xl border border-black/[0.08] dark:border-white/[0.08] p-3 animate-pulse">
      <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-white/10 mb-1" />
      <div className="h-3 w-28 rounded-full bg-gray-300 dark:bg-white/10 mb-2" />
      <div className="h-6 w-40 rounded-lg bg-gray-300 dark:bg-white/10 mb-1" />
      <div className="h-3 w-36 rounded-full bg-gray-300 dark:bg-white/10 mt-1.5" />
    </div>
  );
}

interface PricesGridProps {
  prices: PriceState | null;
  loading: boolean;
}

export default function PricesGrid({ prices, loading }: PricesGridProps) {
  const gridClass =
    "grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3 sm:gap-4 mb-4";

  if (loading || !prices) {
    return (
      <div className={gridClass}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className={gridClass}>
      <PriceCard
        icon="fas fa-dollar-sign"
        iconColor="#F5B041"
        title="دلار آمریکا (USD)"
        price={prices.usd.price}
        changePercent={prices.usd.changePercent}
        detail="💰 بازار آزاد • هر دلار"
      />
      <PriceCard
        icon="fas fa-coins"
        iconColor="#FFD966"
        title="طلای ۱۸ عیار"
        price={prices.gold.price}
        changePercent={prices.gold.changePercent}
        detail="🏅 هر گرم • بر اساس بازار تهران"
      />
      <PriceCard
        icon="fas fa-gem"
        iconColor="#B0C4DE"
        title="نقره (Silver)"
        price={prices.silver.price}
        changePercent={prices.silver.changePercent}
        detail="⚪ هر گرم نقره • جهانی و داخلی"
      />
    </div>
  );
}
