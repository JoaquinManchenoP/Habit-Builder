"use client";

import CircularProgress from "../../../components/HabitCard/components/CircularProgress/CircularProgress";

export default function WeekleyHabitCard({
  habit,
  currentCount,
  progressPercent,
  progressShade,
  isAtTarget,
  isCompleteWeek,
  onIncrement,
}) {
  return (
    <div
      onClick={() => onIncrement(habit)}
      className="relative flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
    >
      {isCompleteWeek ? (
        <div className="pointer-events-none absolute inset-0 z-20 rounded-xl bg-slate-900/30" />
      ) : null}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm">
          🥗
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="min-w-0 break-words text-sm font-semibold text-slate-900">
              {habit.name}
            </p>
            <span className="rounded-full bg-[color:var(--app-accent)]/30 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-700">
              Weekly
            </span>
          </div>
          <p className="text-xs text-slate-500">Weekly goal</p>
        </div>
      </div>
      <div className="shrink-0 scale-[0.9]">
        <CircularProgress
          percent={progressPercent}
          value={currentCount}
          color={progressShade}
          showCheckmark={isAtTarget}
          useCompletionColor={false}
        />
      </div>
    </div>
  );
}
