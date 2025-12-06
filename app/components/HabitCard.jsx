"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { parseISODate } from "../lib/analytics";

const DAYS_TO_SHOW = 120;

const buildRecentDays = (completions = []) => {
  const today = new Date();
  return Array.from({ length: DAYS_TO_SHOW }, (_, index) => {
    const date = new Date();
    date.setDate(today.getDate() - (DAYS_TO_SHOW - 1 - index));
    const iso = date.toISOString().slice(0, 10);

    return {
      iso,
      label: date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      completed: completions.includes(iso),
    };
  });
};

const calculateAvailableConsistency = (habit) => {
  if (!habit) return 0;
  const today = new Date();
  const normalizedToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const createdAtDate = habit.createdAt
    ? parseISODate(habit.createdAt)
    : normalizedToday;
  if (normalizedToday < createdAtDate) return 0;
  const totalAvailableDays =
    Math.floor(
      (normalizedToday.getTime() - createdAtDate.getTime()) / 86_400_000
    ) + 1;
  const completedDays = (habit.completions || []).filter((iso) => {
    const date = parseISODate(iso);
    return date >= createdAtDate && date <= normalizedToday;
  }).length;
  if (totalAvailableDays <= 0) return 0;
  return Math.round((completedDays / totalAvailableDays) * 100);
};

const calculateLongestStreak = (completions = []) => {
  if (!completions.length) return 0;
  const sorted = [...completions].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prevDate = new Date(sorted[i - 1]);
    const currentDate = new Date(sorted[i]);
    const diff =
      (currentDate.setUTCHours(0, 0, 0, 0) - prevDate.setUTCHours(0, 0, 0, 0)) /
      86_400_000;
    if (diff === 1) {
      current += 1;
    } else if (diff > 1) {
      current = 1;
    }
    if (current > longest) {
      longest = current;
    }
  }
  return longest;
};

const calculateStartedDaysAgo = (habit) => {
  if (!habit) return 0;
  const today = new Date();
  const normalizedToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const createdAtDate = habit.createdAt
    ? parseISODate(habit.createdAt)
    : normalizedToday;
  const diff = normalizedToday.getTime() - createdAtDate.getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
};

export default function HabitCard({
  habit,
  onDelete,
  onComplete,
  isCompletedToday = false,
  isFading = false,
  cardRef = null,
}) {
  const router = useRouter();
  const days = useMemo(
    () => buildRecentDays(habit.completions || []),
    [habit.completions]
  );
  const consistencyPercent = useMemo(
    () => calculateAvailableConsistency(habit),
    [habit]
  );
  const longestStreak = useMemo(
    () => calculateLongestStreak(habit.completions || []),
    [habit.completions]
  );
  const startedDaysAgo = useMemo(() => calculateStartedDaysAgo(habit), [habit]);
  const totalCheckIns = habit.completions?.length || 0;

  const handleCardClick = () => {
    router.push(`/habits/${habit.id}`);
  };

  return (
    <div
      ref={cardRef}
      className={`group relative grid h-[370px] grid-rows-[2fr_4fr_4fr] rounded-lg border border-slate-200 bg-white p-5 shadow-sm transform space-y-6 transition ${
        isFading
          ? "pointer-events-none opacity-0 scale-95 transition-all duration-[400ms] ease-out"
          : "opacity-100 transform hover:scale-[1.02] active:scale-[0.99]"
      } ${isCompletedToday ? "scale-[0.97] group-hover:scale-100" : ""}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-4 ">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-4 w-6 rounded-full"
              style={{ backgroundColor: habit.color || "#10b981" }}
            />
            <p className="text-base font-semibold text-slate-900">
              {habit.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mr-6">
          {onComplete ? (
            <input
              type="checkbox"
              checked={isCompletedToday}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => {
                event.stopPropagation();
                onComplete(habit.id, event.target.checked);
              }}
              className="h-6 w-6 accent-green-600 rounded border border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
              aria-label="Mark habit completed"
            />
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="grid w-full grid-cols-4 gap-4">
          {[
            {
              title: "Consistency",
              value: `${consistencyPercent}%`,
              subtitle: "of days",
            },
            {
              title: "Longest streak",
              value: `${longestStreak}`,
              subtitle: `${longestStreak === 1 ? "day" : "days"}`,
            },
            {
              title: "Started",
              value: `${startedDaysAgo}`,
              subtitle: "days ago",
            },
            {
              title: "Total check-ins",
              value: `${totalCheckIns}`,
              subtitle: "all time",
            },
          ].map((metric) => (
            <div
              key={metric.title}
              className="flex flex-col items-center justify-center rounded-md border border-slate-200 bg-slate-50/70 p-3 text-center"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {metric.title}
              </p>
              <p className="mt-1 text-2xl font-bold leading-tight text-slate-900">
                {metric.value}
              </p>
              <p className="text-[11px] text-slate-600">{metric.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
      {onDelete ? (
        <button
          type="button"
          aria-label="Delete habit"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(habit.id);
          }}
          className="absolute -top-3 -right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >
          ×
        </button>
      ) : null}
      <div className="flex flex-col justify-center space-y-2">
        <div className="grid grid-flow-col grid-rows-7 gap-y-[1.5px] gap-x-[7px] justify-center px-[2px] text-xs">
          {days.map((day) => (
            <div
              key={day.iso}
              className="h-[18px] w-[18px] rounded-sm border border-slate-200"
              style={{
                backgroundColor: day.completed
                  ? habit.color || "#10b981"
                  : "rgba(148, 163, 184, 0.25)",
              }}
              title={`${day.label} - ${day.completed ? "Completed" : "Empty"}`}
            />
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Showing the last 120 days. Mark today as completed to keep your streak
          going.
        </p>
      </div>
      {isCompletedToday ? (
        <div className="pointer-events-none absolute inset-0 z-30 rounded-lg bg-slate-900/30 transition-opacity duration-200 group-hover:opacity-0" />
      ) : null}
    </div>
  );
}
