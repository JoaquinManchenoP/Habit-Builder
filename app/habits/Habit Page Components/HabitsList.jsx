"use client";

import HabitCard from "../../components/HabitCard/HabitCard";

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

  return (
    <div className="grid grid-cols-1 gap-3 justify-items-center sm:gap-4 min-[1125px]:[grid-template-columns:repeat(auto-fit,minmax(460px,1fr))] min-[1125px]:justify-items-center min-[1125px]:gap-5">
      {[...habits]
        .sort((a, b) => {
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
        })
        .map((habit) => (
          <div key={habit.id} className="w-full">
            <HabitCard
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
        ))}
    </div>
  );
}
