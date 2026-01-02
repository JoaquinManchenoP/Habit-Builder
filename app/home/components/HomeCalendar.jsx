"use client";

export default function HomeCalendar({ weekDays }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:gap-0">
      {weekDays.map((day, index) => (
        <div
          key={`${day}-${index}`}
          className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold sm:h-8 sm:w-8 sm:text-[11px] ${
            index === 5
              ? "border border-[color:var(--app-accent)] text-slate-900"
              : index === 6
              ? "border border-[color:var(--app-accent)] text-slate-900"
              : "border border-slate-200 text-slate-500"
          }`}
        >
          {day}
        </div>
      ))}
    </div>
  );
}
