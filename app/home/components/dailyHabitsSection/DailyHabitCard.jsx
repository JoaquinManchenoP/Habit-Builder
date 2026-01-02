"use client";

import CircularProgress from "../../../components/HabitCard/components/CircularProgress/CircularProgress";
import {
  countCheckInsOnLocalDate,
  getLastActiveDailyDate,
} from "../../../lib/habitScheduleUtils";

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

export default function DailyHabitCard({ habit, onIncrement }) {
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
  const showCheckmark = todayCount === targetPerDay;
  const color = habit.themeColor || habit.color;

  return (
    <div
      onClick={() => onIncrement?.(habit)}
      className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
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
      <div className="shrink-0 scale-[0.9]">
        <CircularProgress
          percent={progressPercent}
          value={todayCount}
          color={color}
          showCheckmark={showCheckmark}
          useCompletionColor={false}
        />
      </div>
    </div>
  );
}
