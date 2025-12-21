"use client";

import { useEffect, useMemo, useState } from "react";
import CircularProgress from "../components/HabitCard/components/CircularProgress/CircularProgress";
import { loadHabitsWithMock } from "../lib/habitData";
import { isHabitActiveToday } from "../lib/habitScheduleUtils";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const TODAY_PROGRESS = {
  percent: 50,
  label: "Eat vegetables",
  subtitle: "Goal: 2 servings",
  color: "#ffcd1f",
  count: 1,
};

const WEEKLY_GOALS = [
  {
    title: "Reduce alcohol",
    subtitle: "Maximum 10 glasses",
    color: "#22c55e",
    count: 4,
    percent: 40,
  },
  {
    title: "Go to the gym",
    subtitle: "Goal: 7 min",
    color: "#60a5fa",
    count: 1,
    percent: 15,
  },
];

export default function HomePage() {
  const [todayHabits, setTodayHabits] = useState([]);
  const [weeklyHabits, setWeeklyHabits] = useState([]);

  useEffect(() => {
    const hydrate = () => {
      const { habits } = loadHabitsWithMock();
      const today = new Date();
      setTodayHabits(
        habits.filter(
          (habit) =>
            habit.goalType !== "weekly" && isHabitActiveToday(habit, today)
        )
      );
      setWeeklyHabits(habits.filter((habit) => habit.goalType === "weekly"));
    };

    hydrate();
    window.addEventListener("storage", hydrate);
    return () => window.removeEventListener("storage", hydrate);
  }, []);

  const todayList = useMemo(() => todayHabits, [todayHabits]);
  const weeklyList = useMemo(() => weeklyHabits, [weeklyHabits]);

  return (
    <div className="-mx-6 -mt-6 min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <div className="flex items-center justify-between">
          {WEEK_DAYS.map((day, index) => (
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

        <div className="space-y-4">
          <h1 className="text-lg font-semibold text-slate-900">Today</h1>
          <div className="flex items-center justify-center">
            <div className="scale-170 mt-6">
              <CircularProgress
                percent={TODAY_PROGRESS.percent}
                value={TODAY_PROGRESS.percent}
                showPercent
                color={TODAY_PROGRESS.color}
              />
            </div>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70 mt-20">
            {todayList.length ? (
              <div className="space-y-3">
                {todayList.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between rounded-xl bg-white px-1 py-1"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--app-accent)]/25 text-sm">
                        🥕
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {habit.name}
                        </p>
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
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No habits scheduled for today.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Weekly goals
          </h2>
          <div className="space-y-3">
            {weeklyList.length ? (
              weeklyList.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70"
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
                      percent={Math.min(100, habit.completions?.length || 0)}
                      value={habit.completions?.length || 0}
                      color={habit.color}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No weekly goals yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
