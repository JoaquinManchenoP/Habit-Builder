"use client";

import { useEffect, useState } from "react";
import HabitCard from "../components/HabitCard";
import Header from "../components/Header";
import Button from "../components/Button";
import PageContainer from "../components/PageContainer";
import { deleteHabit, markHabitCompleted } from "../lib/habits";
import Link from "next/link";
import { deleteMockHabit, loadHabitsWithMock, markMockHabitCompleted } from "../lib/habitData";

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const hydrate = () => {
      const { habits: loaded, usingMockData: usingMock } = loadHabitsWithMock();
      setHabits(loaded);
      setUsingMockData(usingMock);
    };

    hydrate();
    window.addEventListener("storage", hydrate);
    return () => window.removeEventListener("storage", hydrate);
  }, []);

  const handleComplete = (id) => {
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;

    if (habit.isMock) {
      markMockHabitCompleted(id);
    } else {
      markHabitCompleted(id);
    }

    const { habits: hydrated, usingMockData: usingMock } = loadHabitsWithMock();
    setHabits(hydrated);
    setUsingMockData(usingMock);
  };

  const handleDelete = (id) => {
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;

    if (habit.isMock) {
      deleteMockHabit(id);
    } else {
      deleteHabit(id);
    }

    const { habits: hydrated, usingMockData: usingMock } = loadHabitsWithMock();
    setHabits(hydrated);
    setUsingMockData(usingMock);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <PageContainer>
        <Header />
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">Habits</h1>
              <p className="text-sm text-slate-600">
                Browse the habits stored on this device.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {usingMockData ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  Using mock testing data
                </span>
              ) : null}
              <Link href="/habits/new">
                <Button type="button">Add Habit</Button>
              </Link>
            </div>
          </div>
          {habits.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
              Start by creating a new habit.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </PageContainer>
    </main>
  );
}
