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
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

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

  const handleDeleteRequest = (id) => {
    setPendingDeleteId(id);
  };

  const handleCancelDelete = () => {
    setPendingDeleteId(null);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;
    handleDelete(pendingDeleteId);
    setPendingDeleteId(null);
  };

  const pendingHabit = habits.find((habit) => habit.id === pendingDeleteId);

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
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          )}
        </section>
        {pendingDeleteId ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Delete habit?</h2>
                <p className="text-sm text-slate-600">
                  You are about to delete {pendingHabit?.name || "this habit"}. This action
                  cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                    onClick={handleCancelDelete}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                    onClick={handleConfirmDelete}
                  >
                    Yes, delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </PageContainer>
    </main>
  );
}
