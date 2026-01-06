"use client";

import DailyHabitCard from "./DailyHabitCard";

export default function DailyHabitsSection({
  todayList,
  onIncrement,
  onMenuOpen,
}) {
  return todayList.length ? (
    <div className="flex flex-col gap-3 mt-13 lg:mt-15 md:mt-15 sm:mt-13">
      {todayList.map((habit) => (
        <DailyHabitCard
          key={habit.id}
          habit={habit}
          onIncrement={onIncrement}
          onMenuOpen={onMenuOpen}
        />
      ))}
    </div>
  ) : (
    <p className="text-sm text-slate-500 mt-15">
      No habits scheduled for today.
    </p>
  );
}
