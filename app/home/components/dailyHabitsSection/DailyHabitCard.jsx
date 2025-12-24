"use client";

import CircularProgress from "../../../components/HabitCard/components/CircularProgress/CircularProgress";

export default function DailyHabitCard({ habit }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm">
          🥕
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">{habit.name}</p>
          <p className="text-xs text-slate-500">Active today</p>
        </div>
      </div>
      <div className="scale-[0.65]">
        <CircularProgress
          percent={Math.min(100, habit.completions?.length || 0)}
          value={habit.completions?.length || 0}
          color={habit.color}
        />
      </div>
    </div>
  );
}
