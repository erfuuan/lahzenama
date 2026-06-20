import { memo } from 'react';

// const adSlotClass =
//   'bg-black/5 dark:bg-black/30 rounded-2xl px-3 py-2.5 text-center mb-3 border border-dashed border-[rgba(245,176,65,0.3)]';

export default memo(function AdBox() {
  return (
    <div className="bg-[rgba(245,248,250,0.9)] dark:bg-[rgba(18,25,45,0.7)] backdrop-blur rounded-[1.5rem] p-4 border border-black/[0.08] dark:border-white/[0.08]">
      <h3 className="text-[1rem] mb-3 text-[#F5B041] flex items-center gap-2">
        <i className="fas fa-ad"></i> تبلیغات
      </h3>

      {/* <a
        href="https://talasea.ir/onboarding?r=UEYTxQMy"
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-3 rounded-2xl overflow-hidden border border-[rgba(245,176,65,0.4)] hover:border-[#F5B041] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_16px_rgba(245,176,65,0.2)]"
      >
        <div className="bg-gradient-to-br from-[#1a1200] to-[#2d1f00] px-4 py-3 text-center">
          <div className="text-[#F5B041] text-[0.95rem] font-bold mb-2 leading-snug">
            🎁 با ثبت‌نام رایگان<br />
            <span className="text-[#FFD966]">۳ سوت</span> طلا رایگان<br />
            جایزه بگیرین!
          </div>
          <div className="text-[#ffd966]/70 text-[0.6rem] mb-2 tracking-wide">
            🪙 طلاسی · خرید و فروش آنلاین طلا
          </div>
          <div className="bg-[#F5B041] text-black text-[0.75rem] font-bold px-4 py-1 rounded-full inline-block">
            ثبت‌نام رایگان ←
          </div>
        </div>
      </a>

      <div className={adSlotClass}>
        <div className="text-[#ffd966] text-[0.75rem]">✨ طلای آب شده | بهترین قیمت</div>
        <div className="text-[0.65rem]">برای مشاهده کلیک کنید</div>
      </div>

      <div className="bg-black/5 dark:bg-black/30 rounded-2xl px-3 py-2.5 text-center border border-dashed border-[rgba(245,176,65,0.3)] text-[0.8rem]">
        <i className="fas fa-gem"></i> خرید و فروش سکه و طلا با کمترین کارمزد
      </div> */}
    </div>
  );
});
