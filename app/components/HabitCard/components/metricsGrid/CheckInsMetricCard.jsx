const CheckInsMetricCard = ({ title, value, subtitle, showDivider }) => (
  <div
    className={`relative flex flex-col items-center justify-center py-3 px-4 text-center max-[360px]:py-2.5 max-[360px]:px-3 ${
      showDivider
        ? "before:absolute before:left-0 before:top-5 before:bottom-5 before:w-[1.5px] before:bg-slate-200"
        : ""
    }`}
  >
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 max-[360px]:text-[10px]">
      {title}
    </p>
    <div className="mt-2 flex h-[54px] items-center justify-center max-[360px]:h-[48px]">
      <p className="text-[18px] font-black leading-tight text-slate-900 max-[360px]:text-[16px]">
        {value}
      </p>
    </div>
    <p className="text-[11px] text-slate-600 max-[360px]:text-[10px]">
      {subtitle}
    </p>
  </div>
);

export default CheckInsMetricCard;
