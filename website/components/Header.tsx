"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";

interface HeaderProps {
  lastUpdate: Date | null;
  onRefresh: () => void;
}

export default function Header({ lastUpdate, onRefresh }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const timeStr = useMemo(
    () => (lastUpdate ? lastUpdate.toLocaleTimeString("fa-IR") : "--:--:--"),
    [lastUpdate],
  );

  const btnClass =
    "bg-gray-500/20 border-none text-[#1e2a3e] dark:text-[#eef2ff] px-4 py-1.5 rounded-full cursor-pointer font-medium text-[0.8rem] transition-all duration-200 hover:bg-[#cbd5e6] dark:hover:bg-[#2c3e66] hover:scale-[0.97]";

  return (
    <div className="flex justify-between items-baseline flex-wrap mb-8 border-b border-black/5 dark:border-white/5 pb-4">
      <div>
        <h1 className="text-[1.8rem] font-semibold bg-gradient-to-r from-[#F5B041] to-[#F7DC6F] bg-clip-text text-transparent">
          <i className="fas fa-chart-line"></i> لحظه‌نما
        </h1>
        <p className="text-[0.85rem] text-[#2c3e66] dark:text-[#8b9bcf]">
          قیمت‌های لحظه‌ای دلار، طلا، نقره | همراه با طلافروشی‌های معتبر
        </p>
      </div>

      <div className="flex gap-4 items-center flex-wrap mt-3 min-[900px]:mt-0">
        <div className="text-[0.8rem] bg-gray-500/20 px-3 py-1 rounded-full backdrop-blur-sm">
          آخرین بروزرسانی: {timeStr}
        </div>
        <button onClick={onRefresh} className={btnClass}>
          <i className="fas fa-sync-alt"></i> بروزرسانی
        </button>
        {mounted && (
          <button onClick={toggleTheme} className={btnClass}>
            <i className="fas fa-moon"></i> شب / روز
          </button>
        )}
      </div>
    </div>
  );
}
