"use client";

import ProgressControls from "../../../components/HabitCard/components/ProgressControls";
import {
  countCheckInsOnLocalDate,
  getLastActiveDailyDate,
} from "../../../lib/habitScheduleUtils";
import { getProgressColor } from "../../../lib/progressColor";

const toLocalDate = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [_, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export default function DailyHabitCard({
  habit,
  onIncrement,
  onDecrement,
  onMenuOpen,
}) {
  const targetPerDay = Math.max(1, habit.timesPerDay || 1);
  const createdAtLocalDate = toLocalDate(habit.createdAt);
  let referenceDate = getLastActiveDailyDate(habit);
  if (createdAtLocalDate && referenceDate < createdAtLocalDate) {
    referenceDate = createdAtLocalDate;
  }
  const todayCount = countCheckInsOnLocalDate(
    habit.checkIns || [],
    referenceDate
  );
  const progressPercent = Math.min((todayCount / targetPerDay) * 100, 100);
  const isAtTargetOrAbove = todayCount >= targetPerDay;
  const isCompletedForCurrentDailyWindow = isAtTargetOrAbove;
  const color = getProgressColor(progressPercent);

  return (
    <div
      onClick={() => onIncrement?.(habit)}
      className="group relative flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm">
          🥕
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="min-w-0 break-words text-sm font-semibold text-slate-900">
              {habit.name}
            </p>
            <span className="rounded-full bg-[color:var(--app-accent)]/30 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-700">
              Daily
            </span>
          </div>
          <p className="text-xs text-slate-500">Daily goal</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ProgressControls
          progress={{
            percent: progressPercent,
            count: todayCount,
            shade: color,
            showCheckmark: false,
            onIncrement: () => onIncrement?.(habit),
            onDecrement: () => onDecrement?.(habit),
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
      {isCompletedForCurrentDailyWindow ? (
        <div className="pointer-events-none absolute inset-0 z-30 rounded-xl bg-slate-900/30" />
      ) : null}
    </div>
  );
}
