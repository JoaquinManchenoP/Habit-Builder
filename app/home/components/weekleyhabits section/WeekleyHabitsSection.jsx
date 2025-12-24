"use client";

import { countCheckInsThisWeek } from "../../../lib/habitScheduleUtils";
import WeekleyHabitCard from "./WeekleyHabitCard";

export default function WeekleyHabitsSection({ weeklyList, onIncrement }) {
  return (
    <div className="space-y-4 ">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Weekly goals
      </h2>
      <div className="space-y-3">
        {weeklyList.length ? (
          weeklyList.map((habit) => {
            const currentCount = countCheckInsThisWeek(habit.checkIns);
            const targetCount = Math.max(1, habit.timesPerWeek || 1);
            const progressPercent = Math.min(
              (currentCount / targetCount) * 100,
              100
            );
            return (
              <WeekleyHabitCard
                key={habit.id}
                habit={habit}
                currentCount={currentCount}
                progressPercent={progressPercent}
                onIncrement={onIncrement}
              />
            );
          })
        ) : (
          <p className="text-sm text-slate-500">No weekly goals yet.</p>
        )}
      </div>
    </div>
  );
}
