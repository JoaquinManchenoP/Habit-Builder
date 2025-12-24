"use client";

import CircularProgress from "../../../components/HabitCard/components/CircularProgress/CircularProgress";

export default function WeekleyHabitCard({
  habit,
  currentCount,
  progressPercent,
  onIncrement,
}) {
  return (
    <div
      onClick={() => onIncrement(habit)}
      className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70 "
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm">
          🥗
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {habit.name}
            </p>
            <span className="rounded-full bg-[color:var(--app-accent)]/30 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-700">
              Weekly
            </span>
          </div>
          <p className="text-xs text-slate-500">Weekly goal</p>
        </div>
      </div>
      <div className="scale-[0.65]">
        <CircularProgress
          percent={progressPercent}
          value={currentCount}
          color={habit.color}
        />
      </div>
    </div>
  );
}
