"use client";

import DailyHabitCard from "./DailyHabitCard";

export default function DailyHabitsSection({ todayList, onIncrement }) {
  return todayList.length ? (
    <div className="flex flex-col gap-3 mt-20">
      {todayList.map((habit) => (
        <DailyHabitCard
          key={habit.id}
          habit={habit}
          onIncrement={onIncrement}
        />
      ))}
    </div>
  ) : (
    <p className="text-sm text-slate-500 mt-20">
      No habits scheduled for today.
    </p>
  );
}
