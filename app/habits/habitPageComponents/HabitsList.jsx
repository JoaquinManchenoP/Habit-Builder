"use client";

import DailyHabitCardHabitsPage from "./DailyHabitCardHabitsPage";
import WeeklyHabitCardHabitsPage from "./WeeklyHabitCardHabitsPage";
import {
  countCheckInsOnLocalDate,
  countCheckInsThisWeek,
} from "../../lib/habitScheduleUtils";

export default function HabitsList({
  habits,
  onComplete,
  onWeeklyCheckIn,
  onDeleteRequest,
  fadeTargetId,
  cardRefs,
}) {
  if (habits.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
        Start by creating a new habit.
      </p>
    );
  }

  const today = new Date();
  const compareByCreatedDesc = (a, b) => {
    const aStamp =
      typeof a.createdAtTimestamp === "number"
        ? a.createdAtTimestamp
        : Date.parse(a.createdAt || 0);
    const bStamp =
      typeof b.createdAtTimestamp === "number"
        ? b.createdAtTimestamp
        : Date.parse(b.createdAt || 0);
    if (aStamp !== bStamp) return bStamp - aStamp;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  };
  const isHabitCompleted = (habit) => {
    if (habit.goalType === "weekly") {
      const target = Math.max(1, habit.timesPerWeek || 1);
      const count = countCheckInsThisWeek(habit.checkIns || [], today);
      return count >= target;
    }
    const target = Math.max(1, habit.timesPerDay || 1);
    const count = countCheckInsOnLocalDate(habit.checkIns || [], today);
    return count >= target;
  };
  const { incompleteHabits, completedHabits } = (() => {
    const incomplete = [];
    const completed = [];
    habits.forEach((habit) => {
      if (isHabitCompleted(habit)) {
        completed.push(habit);
      } else {
        incomplete.push(habit);
      }
    });
    incomplete.sort(compareByCreatedDesc);
    completed.sort(compareByCreatedDesc);
    return { incompleteHabits: incomplete, completedHabits: completed };
  })();

  return (
    <div className="space-y-6">
      {incompleteHabits.length > 0 ? (
        <div className="columns-1 gap-x-3 sm:gap-x-4 min-[1125px]:columns-[460px] min-[1125px]:gap-x-5">
          {incompleteHabits.map((habit) => {
            const CardComponent =
              habit.goalType === "weekly"
                ? WeeklyHabitCardHabitsPage
                : DailyHabitCardHabitsPage;
            return (
              <div
                key={habit.id}
                className="mb-3 w-full break-inside-avoid sm:mb-4 min-[1125px]:mb-5"
              >
                <CardComponent
                  habit={habit}
                  onComplete={onComplete}
                  onWeeklyCheckIn={onWeeklyCheckIn}
                  onDelete={onDeleteRequest}
                  isCompletedToday={habit.completions?.includes(
                    new Date().toISOString().slice(0, 10)
                  )}
                  isFading={fadeTargetId === habit.id}
                  cardRef={(node) => {
                    if (node) {
                      cardRefs.current[habit.id] = node;
                    } else {
                      delete cardRefs.current[habit.id];
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      ) : null}
      {completedHabits.length > 0 ? (
        <div className="columns-1 gap-x-3 sm:gap-x-4 min-[1125px]:columns-[460px] min-[1125px]:gap-x-5">
          {completedHabits.map((habit) => {
            const CardComponent =
              habit.goalType === "weekly"
                ? WeeklyHabitCardHabitsPage
                : DailyHabitCardHabitsPage;
            return (
              <div
                key={habit.id}
                className="mb-3 w-full break-inside-avoid sm:mb-4 min-[1125px]:mb-5"
              >
                <CardComponent
                  habit={habit}
                  onComplete={onComplete}
                  onWeeklyCheckIn={onWeeklyCheckIn}
                  onDelete={onDeleteRequest}
                  isCompletedToday={habit.completions?.includes(
                    new Date().toISOString().slice(0, 10)
                  )}
                  isFading={fadeTargetId === habit.id}
                  cardRef={(node) => {
                    if (node) {
                      cardRefs.current[habit.id] = node;
                    } else {
                      delete cardRefs.current[habit.id];
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
