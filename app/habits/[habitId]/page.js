"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import PageContainer from "../../components/PageContainer";
import { loadHabitsWithMock } from "../../lib/habitData";
import { parseISODate } from "../../lib/analytics";

const DAYS_TO_CONSIDER = 90;
const calculateConsistencyScore = (completions = []) => {
  const today = new Date();
  let weightedCompleted = 0;
  let weightedTotal = 0;

  for (let index = 0; index < DAYS_TO_CONSIDER; index += 1) {
    const date = new Date();
    date.setDate(today.getDate() - index);
    const iso = date.toISOString().slice(0, 10);
    const weight = DAYS_TO_CONSIDER - index; // recent days count more

    weightedTotal += weight;
    if (completions.includes(iso)) {
      weightedCompleted += weight;
    }
  }

  if (!weightedTotal) return 0;
  return Math.round((weightedCompleted / weightedTotal) * 100);
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

const calculateAvailableConsistency = (habit) => {
  if (!habit) return { percent: 0 };
  const today = new Date();
  const normalizedToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  const createdAtDate = habit.createdAt ? parseISODate(habit.createdAt) : normalizedToday;

  if (normalizedToday < createdAtDate) {
    return { percent: 0 };
  }

  const totalAvailableDays =
    Math.floor((normalizedToday.getTime() - createdAtDate.getTime()) / 86_400_000) + 1;

  const completedDays = (habit.completions || []).filter((iso) => {
    const date = parseISODate(iso);
    return date >= createdAtDate && date <= normalizedToday;
  }).length;

  const percent =
    totalAvailableDays > 0
      ? Math.round((completedDays / totalAvailableDays) * 100)
      : 0;

  return { percent };
};

export default function HabitDetailsPage() {
  const { habitId } = useParams();
  const [habit, setHabit] = useState(null);

  useEffect(() => {
    const hydrate = () => {
      const { habits } = loadHabitsWithMock();
      const currentHabit = habits.find((item) => item.id === habitId) || null;
      setHabit(currentHabit);
    };

    hydrate();
    window.addEventListener("storage", hydrate);
    return () => window.removeEventListener("storage", hydrate);
  }, [habitId]);

  const consistencyScore = calculateConsistencyScore(habit?.completions || []);
  const availableConsistency = calculateAvailableConsistency(habit);
  const longestStreak = calculateLongestStreak(habit?.completions || []);
  const startedDaysAgo = (() => {
    if (!habit) return 0;
    const today = new Date();
    const normalizedToday = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    const createdAtDate = habit.createdAt ? parseISODate(habit.createdAt) : normalizedToday;
    const diff = normalizedToday.getTime() - createdAtDate.getTime();
    return Math.max(0, Math.floor(diff / 86_400_000));
  })();

  return (
    <main className="min-h-screen bg-slate-50">
      <PageContainer>
        <Header />
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">{habit?.name || "Habit"}</h1>
          <p className="text-base font-medium text-slate-800">
            Consistency: {consistencyScore}/100
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex h-36 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Consistency</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {availableConsistency.percent}%
              </p>
              <p className="text-xs text-slate-600">of available days completed</p>
            </div>
            <div className="flex h-36 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Longest streak</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {longestStreak} {longestStreak === 1 ? "day" : "days"}
              </p>
              <p className="text-xs text-slate-600">consecutive completions</p>
            </div>
            <div className="flex h-36 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Started</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {startedDaysAgo}
              </p>
              <p className="text-xs text-slate-600">days ago</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
