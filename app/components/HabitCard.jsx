"use client";

import Button from "./Button";

export default function HabitCard({ habit, onDelete }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-base font-semibold text-slate-900">{habit.name}</p>
        <p className="text-sm text-slate-500">Track your progress here.</p>
      </div>
      {onDelete ? (
        <Button
          type="button"
          className="bg-red-500 hover:bg-red-400 focus-visible:outline-red-500"
          onClick={() => onDelete(habit.id)}
        >
          Delete
        </Button>
      ) : null}
    </div>
  );
}
