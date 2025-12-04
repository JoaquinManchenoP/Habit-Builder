"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import PageContainer from "../../components/PageContainer";
import { loadHabitsWithMock } from "../../lib/habitData";

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

  return (
    <main className="min-h-screen bg-slate-50">
      <PageContainer>
        <Header />
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">{habit?.name || "Habit"}</h1>
          <p className="text-base font-medium text-slate-800">
            Consistency: {consistencyScore}/100
          </p>
        </div>
      </PageContainer>
    </main>
  );
}
