"use client";

import ProgressControls from "../../../components/HabitCard/components/ProgressControls";
import { getProgressColor } from "../../../lib/progressColor";

export default function WeekleyHabitCard({
  habit,
  currentCount,
  progressPercent,
  progressShade,
  isAtTarget,
  isCompleteWeek,
  onIncrement,
  onDecrement,
  onMenuOpen,
}) {
  const completionShade = getProgressColor(100);
  return (
    <div
      onClick={() => onIncrement(habit)}
      className="group relative flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
    >
      {isCompleteWeek ? (
        <div className="pointer-events-none absolute inset-0 z-30 rounded-xl bg-slate-900/30" />
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
      <div className="flex shrink-0 items-center gap-2">
        <ProgressControls
          progress={{
            percent: progressPercent,
            count: currentCount,
            shade: progressShade,
            showCheckmark: isAtTarget,
            onIncrement: () => onIncrement?.(habit),
            onDecrement: () => onDecrement?.(habit),
            completionColor: completionShade,
          }}
        />
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
          onClick={(event) => {
            event.stopPropagation();
            onMenuOpen?.(habit, event);
          }}
          aria-label="Open habit menu"
        >
          <svg
            viewBox="0 0 20 20"
            className="h-4 w-4"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="10" cy="4" r="1.6" />
            <circle cx="10" cy="10" r="1.6" />
            <circle cx="10" cy="16" r="1.6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
