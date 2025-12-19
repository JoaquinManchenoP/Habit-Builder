import { parseISODate, toISODate } from "../../../lib/analytics";
import { isActiveDay, normalizeActiveDays } from "../../../lib/habitSchedule";

export const calculateAvailableConsistency = (habit) => {
  if (!habit) return 0;
  const today = new Date();
  const normalizedToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const createdAtDate = habit.createdAt
    ? parseISODate(habit.createdAt)
    : normalizedToday;
  const earliestCompletion = (habit.completions || []).reduce(
    (earliest, iso) => {
      const date = parseISODate(iso);
      if (!earliest || date < earliest) return date;
      return earliest;
    },
    null
  );
  const effectiveStart =
    earliestCompletion && earliestCompletion < createdAtDate
      ? earliestCompletion
      : createdAtDate;
  if (normalizedToday < effectiveStart) return 0;
  const normalizedActiveDays = normalizeActiveDays(habit.activeDays);
  const completionSet = new Set((habit.completions || []).map((iso) => iso));
  let totalActiveDays = 0;
  let completedActiveDays = 0;
  let pointer = new Date(effectiveStart);
  while (pointer <= normalizedToday) {
    const iso = toISODate(pointer);
    const completed = completionSet.has(iso);
    if (isActiveDay(pointer, normalizedActiveDays) || completed) {
      totalActiveDays += 1;
      if (completed) {
        completedActiveDays += 1;
      }
    }
    pointer = new Date(pointer.setUTCDate(pointer.getUTCDate() + 1));
  }
  if (totalActiveDays <= 0) return 0;
  return Math.round((completedActiveDays / totalActiveDays) * 100);
};

export const calculateLongestStreak = (habit) => {
  const completions = habit?.completions || [];
  if (!completions.length) return 0;
  const sorted = [...completions].sort();
  const normalizedActiveDays = normalizeActiveDays(habit.activeDays);
  const completionSet = new Set(sorted);
  const firstCompletion = parseISODate(sorted[0]);
  const today = new Date();
  const normalizedToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  let pointer = new Date(firstCompletion);
  let current = 0;
  let longest = 0;
  while (pointer <= normalizedToday) {
    const iso = toISODate(pointer);
    const completed = completionSet.has(iso);
    const active = isActiveDay(pointer, normalizedActiveDays);
    if (active || completed) {
      if (completed) {
        current += 1;
        if (current > longest) {
          longest = current;
        }
      } else {
        current = 0;
      }
    }
    pointer = new Date(pointer.setUTCDate(pointer.getUTCDate() + 1));
  }
  return longest;
};

export const calculateStartedDaysAgo = (habit) => {
  if (!habit) return 0;
  const today = new Date();
  const normalizedToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const createdAtDate = habit.createdAt
    ? parseISODate(habit.createdAt)
    : normalizedToday;
  const earliestCompletion = (habit.completions || []).reduce(
    (earliest, iso) => {
      const date = parseISODate(iso);
      if (!earliest || date < earliest) return date;
      return earliest;
    },
    null
  );
  const effectiveStart =
    earliestCompletion && earliestCompletion < createdAtDate
      ? earliestCompletion
      : createdAtDate;
  const diff = normalizedToday.getTime() - effectiveStart.getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
};

export const buildMetrics = (
  habit,
  consistencyPercent,
  longestStreak,
  startedDaysAgo
) => {
  const totalCheckIns = habit.completions?.length || 0;
  return [
    {
      title: "Consistency",
      value: `${consistencyPercent}%`,
      subtitle: "of days",
    },
    {
      title: "Streak",
      value: `${longestStreak}`,
      subtitle: `${longestStreak === 1 ? "day" : "days"}`,
    },
    { title: "Started", value: `${startedDaysAgo}`, subtitle: "days ago" },
    {
      title: "Check-ins",
      value: `${totalCheckIns}`,
      subtitle: "all time",
    },
  ];
};
