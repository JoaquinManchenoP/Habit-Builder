"use client";

import { useEffect, useState } from "react";
import HabitCard from "../components/HabitCard";
import Header from "../components/Header";
import Button from "../components/Button";
import { getHabits } from "../lib/habits";
import Link from "next/link";

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    // Hydrate from localStorage once the client environment is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHabits(getHabits());
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <Header />
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">Habits</h1>
              <p className="text-sm text-slate-600">
                Browse the habits stored on this device.
              </p>
            </div>
            <Link href="/habits/new">
              <Button type="button">Add Habit</Button>
            </Link>
          </div>
          {habits.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
              Start by creating a new habit.
            </p>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
