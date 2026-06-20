"use client";

import dynamic from "next/dynamic";
import Header from "./Header";
import PricesGrid from "./PricesGrid";
import AdBox from "./AdBox";
import ShopsBox from "./ShopsBox";
import Footer from "./Footer";
import { usePriceData } from "@/website/hooks/usePriceData";

const TrendChart = dynamic(() => import("./TrendChart"), { ssr: false });

export default function HomeClient() {
  const { prices, history, lastUpdate, source, loading, refresh } =
    usePriceData();

  return (
    <div className="max-w-[1400px] mx-auto px-3 py-4 sm:px-6 sm:py-6 pb-safe">
      <Header lastUpdate={lastUpdate} onRefresh={refresh} />

      {/* In RTL the first grid column renders on the RIGHT, second on the LEFT.
          So main content (1fr) goes first → RIGHT, sidebar (280px) goes second → LEFT. */}
      <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_280px] gap-4 mb-4">
        {/* Right: price cards + chart */}
        <div className="flex flex-col gap-4">
          <PricesGrid prices={prices} loading={loading} />
          <TrendChart history={history} loading={loading} />
        </div>

        {/* Left: AdBox + ShopsBox */}
        <div className="flex flex-col gap-4">
          <AdBox />
          <ShopsBox />
        </div>
      </div>

      <Footer source={source} />
    </div>
  );
}
