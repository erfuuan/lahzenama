import { memo } from "react";

export default memo(function ShopsBox() {
  return (
    <div className="bg-[rgba(245,248,250,0.9)] dark:bg-[rgba(18,25,45,0.7)] backdrop-blur rounded-[1.5rem] p-5 border border-black/[0.08] dark:border-white/[0.08]">
      <h3 className="text-[1.1rem] mb-4 text-[#F5B041] flex items-center gap-2">
        <i className="fas fa-store"></i> سایت‌های طلا فروشی معتبر
      </h3>

      <ul className="list-none">
        <li>
          {/* <a
            href="https://talasea.ir/onboarding?r=UEYTxQMy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1e2a3e] dark:text-[#eef2ff] no-underline flex items-center gap-2 transition-all duration-200 hover:text-[#F5B041] hover:-translate-x-[5px]"
          >
            <i className="fas fa-link w-6 text-[#F5B041] shrink-0"></i>
            <span>طلاسی</span>
          </a> */}
        </li>
      </ul>
    </div>
  );
});
