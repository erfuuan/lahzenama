"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "next-themes";
import type { HistoryData, AssetKey } from "@/website/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

const FALLBACK_LABELS = [
  "-6 روز",
  "-5 روز",
  "-4 روز",
  "-3 روز",
  "-2 روز",
  "دیروز",
  "امروز",
];

type ChartAssetKey = Exclude<AssetKey, "usd">;

const ASSET_LABELS: Record<ChartAssetKey, string> = {
  gold: "طلای ۱۸ عیار (تومان)",
  silver: "نقره (تومان)",
};

const ASSET_OPTIONS: { value: ChartAssetKey; label: string }[] = [
  { value: "gold", label: "طلای ۱۸ عیار" },
  { value: "silver", label: "نقره" },
];

const CARD_CLASS =
  "bg-[rgba(245,248,250,0.9)] dark:bg-[rgba(18,25,45,0.7)] backdrop-blur rounded-[1.5rem] p-5 border border-black/[0.08] dark:border-white/[0.08]";

function SkeletonChart() {
  return (
    <div className={`${CARD_CLASS} animate-pulse`}>
      <div className="flex justify-between items-center mb-4">
        <div className="h-5 w-36 rounded-full bg-gray-300 dark:bg-white/10" />
        <div className="h-8 w-28 rounded-full bg-gray-300 dark:bg-white/10" />
      </div>
      <div className="h-[240px] rounded-xl bg-gray-300 dark:bg-white/10" />
    </div>
  );
}

interface TrendChartProps {
  history: HistoryData | null;
  loading: boolean;
}

export default function TrendChart({ history, loading }: TrendChartProps) {
  const [selectedAsset, setSelectedAsset] = useState<ChartAssetKey>("gold");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  // Stable handler — avoids creating a new function on every render
  const handleAssetChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedAsset(e.target.value as ChartAssetKey);
    },
    [],
  );

  // Recomputed only when the selected asset or its data changes
  const chartData = useMemo(
    () => ({
      labels: history?.[selectedAsset]?.labels ?? FALLBACK_LABELS,
      datasets: [
        {
          label: ASSET_LABELS[selectedAsset],
          data: history?.[selectedAsset]?.prices ?? [],
          borderColor: "#F5B041",
          backgroundColor: "rgba(245, 176, 65, 0.05)",
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.2,
          fill: true,
        },
      ],
    }),
    [selectedAsset, history],
  );

  // Recomputed only when the theme changes — avoids full chart redraws on parent re-renders
  const chartOptions = useMemo(() => {
    const isDark = resolvedTheme !== "light";
    const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)";
    const tickColor = isDark ? "#b9c7e9" : "#2c3e66";

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx: { raw: unknown }) =>
              `${(ctx.raw as number).toLocaleString("fa-IR")} تومان`,
          },
        },
        legend: { labels: { color: tickColor } },
      },
      scales: {
        y: {
          ticks: {
            color: tickColor,
            callback: (val: unknown) => (val as number).toLocaleString("fa-IR"),
          },
          grid: { color: gridColor },
        },
        x: {
          ticks: { color: tickColor },
          grid: { color: gridColor },
        },
      },
    };
  }, [resolvedTheme]);

  if (loading || !history || !mounted) {
    return <SkeletonChart />;
  }

  return (
    <div className={CARD_CLASS}>
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-[#F5B041]">
          <i className="fas fa-chart-bar"></i> روند ۷ روز اخیر
        </span>
        <select
          value={selectedAsset}
          onChange={handleAssetChange}
          className="bg-white dark:bg-[#0f1422] border border-[#ccd6f0] dark:border-[#2a3455] text-[#1e2a3e] dark:text-[#eef2ff] rounded-full px-3 py-1 text-sm outline-none cursor-pointer"
        >
          {ASSET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div style={{ height: "260px" }}>
        <Line
          data={chartData}
          options={chartOptions as Parameters<typeof Line>[0]["options"]}
        />
      </div>
    </div>
  );
}
