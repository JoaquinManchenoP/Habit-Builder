"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

const buildRecentDays = (completions = []) => {
  const today = new Date();
  return Array.from({ length: 90 }, (_, index) => {
    const date = new Date();
    date.setDate(today.getDate() - (89 - index));
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

export default function HabitCard({ habit, onDelete, onComplete }) {
  const router = useRouter();
  const days = useMemo(
    () => buildRecentDays(habit.completions || []),
    [habit.completions]
  );

  const handleCardClick = () => {
    router.push(`/habits/${habit.id}`);
  };

  return (
    <div
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition transform hover:scale-[1.02] active:scale-[0.99]"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-6 rounded-full"
              style={{ backgroundColor: habit.color || "#10b981" }}
            />
            <p className="text-base font-semibold text-slate-900">
              {habit.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {onComplete ? (
            <button
              type="button"
              aria-label="Mark habit completed"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600 transition hover:bg-green-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
              onClick={(event) => {
                event.stopPropagation();
                onComplete(habit.id);
              }}
            >
              ✓
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              aria-label="Delete habit"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(habit.id);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600 transition hover:bg-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
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
          Showing the last 90 days. Mark today as completed to keep your streak
          going.
        </p>
      </div>
    </div>
  );
}
