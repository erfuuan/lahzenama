import { memo } from "react";
import type { PriceCardProps } from "@/website/types";

function formatNumber(num: number): string {
  return num.toLocaleString("fa-IR");
}

export default memo(function PriceCard({
  icon,
  iconColor,
  title,
  price,
  changePercent,
  detail,
}: PriceCardProps) {
  const isPositive = changePercent >= 0;

  return (
    <div
      className="
      bg-[rgba(245,248,250,0.9)] dark:bg-[rgba(18,25,45,0.7)]
      backdrop-blur-md
      rounded-2xl
      border border-black/[0.08] dark:border-white/[0.08]
      p-3
      transition-all duration-250
      hover:-translate-y-[4px]
      hover:border-[rgba(245,176,65,0.5)] dark:hover:border-[rgba(245,176,65,0.3)]
    "
    >
      <div className="text-[1.1rem] mb-1">
        <i className={icon} style={{ color: iconColor }}></i>
      </div>
      <div className="text-[0.85rem] font-medium text-[#2c3e66] dark:text-[#8b9bcf] leading-tight">
        {title}
      </div>
      <div className="mt-1 flex items-baseline flex-wrap gap-x-1">
        <span className="text-[1.45rem] font-bold [direction:ltr] inline-block leading-tight">
          {formatNumber(price)}
        </span>
        <span className="text-[0.75rem] font-normal text-[#5a6e8a] dark:text-[#7c8bb0]">
          تومان
        </span>
        <span
          className={`text-[0.75rem] px-[0.45rem] py-[0.1rem] rounded-full bg-black/10 dark:bg-black/20 ${
            isPositive ? "text-[#2ecc71]" : "text-[#e74c3c]"
          }`}
        >
          {isPositive ? "+" : ""}
          {changePercent}%
        </span>
      </div>
      <div className="text-[0.65rem] text-[#5a6e8a] dark:text-[#7c8bb0] mt-1.5 border-t border-black/5 dark:border-white/5 pt-1">
        {detail}
      </div>
    </div>
  );
});
