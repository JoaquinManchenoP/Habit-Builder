export default function WeekdayLabels({ offsetPx = 8 }) {
  return (
    <div
      className="pointer-events-none absolute top-0 grid grid-rows-7 gap-y-[1.5px] text-[8px] font-semibold uppercase text-slate-400 max-[360px]:gap-y-[1px] max-[360px]:text-[7px]"
      style={{ left: 0, transform: `translateX(-${offsetPx}px)` }}
    >
      <div className="h-[15px] leading-[15px] max-[360px]:h-[13px] max-[360px]:leading-[13px]">
        Mon
      </div>
      <div className="h-[15px] leading-[15px] max-[360px]:h-[13px] max-[360px]:leading-[13px]" />
      <div className="h-[15px] leading-[15px] max-[360px]:h-[13px] max-[360px]:leading-[13px]" />
      <div className="h-[15px] leading-[15px] max-[360px]:h-[13px] max-[360px]:leading-[13px]">
        Thu
      </div>
      <div className="h-[15px] leading-[15px] max-[360px]:h-[13px] max-[360px]:leading-[13px]" />
      <div className="h-[15px] leading-[15px] max-[360px]:h-[13px] max-[360px]:leading-[13px]" />
      <div className="h-[15px] leading-[15px] max-[360px]:h-[13px] max-[360px]:leading-[13px]">
        Sun
      </div>
    </div>
  );
}
