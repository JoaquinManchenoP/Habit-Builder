"use client";

export default function HomeCalendar({ weekDays }) {
  return (
    <div className="flex items-center justify-between">
      {weekDays.map((day, index) => (
        <div
          key={`${day}-${index}`}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${
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
