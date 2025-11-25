"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { createHabit } from "../../lib/habits";

export default function NewHabitPage() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setStatus("Please provide a name for your habit.");
      return;
    }

    createHabit(name.trim());
    setStatus("Habit saved locally.");
    setName("");
    setTimeout(() => router.push("/dashboard"), 400);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <Header />
        <section className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Create a Habit</h1>
            <p className="text-sm text-slate-600">
              Add a new habit to track. Data is stored in this browser.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Habit name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. Morning run"
              />
            </label>
            <div className="flex items-center gap-3">
              <Button type="submit">Save habit</Button>
              {status ? <p className="text-sm text-slate-600">{status}</p> : null}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
