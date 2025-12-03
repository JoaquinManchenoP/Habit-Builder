"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import { loadHabitsWithMock } from "../../lib/habitData";

export default function HabitDetailsPage() {
  const { habitId } = useParams();
  const [habitName, setHabitName] = useState("");

  useEffect(() => {
    const hydrate = () => {
      const { habits } = loadHabitsWithMock();
      const habit = habits.find((item) => item.id === habitId);
      setHabitName(habit?.name || "");
    };

    hydrate();
    window.addEventListener("storage", hydrate);
    return () => window.removeEventListener("storage", hydrate);
  }, [habitId]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <Header />
        <h1 className="text-2xl font-bold text-slate-900">{habitName}</h1>
      </div>
    </main>
  );
}
