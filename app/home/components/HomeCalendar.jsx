"use client";

export default function HomeCalendar({ weekDays }) {
  const jsDayIndex = new Date().getDay();
  const todayIndex = [6, 0, 1, 2, 3, 4, 5][jsDayIndex];
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:gap-0">
      {weekDays.map((day, index) => (
        <div
          key={`${day}-${index}`}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold sm:h-9 sm:w-9 sm:text-[11px] ${
            index === todayIndex
              ? "h-12 w-12 border-5 border-[color:var(--app-accent)] text-slate-900 sm:h-12 sm:w-12"
              : "border border-slate-200 text-slate-500"
          }`}
        >
          {day}
        </div>
      ))}
    </div>
  );
}
