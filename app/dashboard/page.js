"use client";

import { useEffect, useState } from "react";
import HabitCard from "../components/HabitCard";
import Header from "../components/Header";
import { deleteHabit, getHabits } from "../lib/habits";

export default function DashboardPage() {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    // Reading from localStorage is only possible client-side, so hydrate after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHabits(getHabits());
  }, []);

  const handleDelete = (id) => {
    const updated = deleteHabit(id);
    setHabits(updated);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <Header />
        <section className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-600">
              Your overview of saved habits from local storage.
            </p>
          </div>
          {habits.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
              You have not added any habits yet.
            </p>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
