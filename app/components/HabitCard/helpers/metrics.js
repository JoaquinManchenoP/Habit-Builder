import { parseISODate } from "../../../lib/analytics";

export const calculateAvailableConsistency = (habit) => {
  if (!habit) return 0;
  const today = new Date();
  const normalizedToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const createdAtDate = habit.createdAt ? parseISODate(habit.createdAt) : normalizedToday;
  const earliestCompletion = (habit.completions || []).reduce((earliest, iso) => {
    const date = parseISODate(iso);
    if (!earliest || date < earliest) return date;
    return earliest;
  }, null);
  const effectiveStart =
    earliestCompletion && earliestCompletion < createdAtDate ? earliestCompletion : createdAtDate;
  if (normalizedToday < effectiveStart) return 0;
  const totalAvailableDays =
    Math.floor((normalizedToday.getTime() - effectiveStart.getTime()) / 86_400_000) + 1;
  const completedDays = (habit.completions || []).filter((iso) => {
    const date = parseISODate(iso);
    return date >= effectiveStart && date <= normalizedToday;
  }).length;
  if (totalAvailableDays <= 0) return 0;
  return Math.round((completedDays / totalAvailableDays) * 100);
};

export const calculateLongestStreak = (completions = []) => {
  if (!completions.length) return 0;
  const sorted = [...completions].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prevDate = new Date(sorted[i - 1]);
    const currentDate = new Date(sorted[i]);
    const diff =
      (currentDate.setUTCHours(0, 0, 0, 0) - prevDate.setUTCHours(0, 0, 0, 0)) /
      86_400_000;
    if (diff === 1) {
      current += 1;
    } else if (diff > 1) {
      current = 1;
    }
    if (current > longest) {
      longest = current;
    }
  }
  return longest;
};

export const calculateStartedDaysAgo = (habit) => {
  if (!habit) return 0;
  const today = new Date();
  const normalizedToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const createdAtDate = habit.createdAt ? parseISODate(habit.createdAt) : normalizedToday;
  const earliestCompletion = (habit.completions || []).reduce((earliest, iso) => {
    const date = parseISODate(iso);
    if (!earliest || date < earliest) return date;
    return earliest;
  }, null);
  const effectiveStart =
    earliestCompletion && earliestCompletion < createdAtDate ? earliestCompletion : createdAtDate;
  const diff = normalizedToday.getTime() - effectiveStart.getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
};

export const buildMetrics = (habit, consistencyPercent, longestStreak, startedDaysAgo) => {
  const totalCheckIns = habit.completions?.length || 0;
  return [
    {
      title: "Consistency",
      value: `${consistencyPercent}%`,
      subtitle: "of days",
    },
    {
      title: "Longest streak",
      value: `${longestStreak}`,
      subtitle: `${longestStreak === 1 ? "day" : "days"}`,
    },
    { title: "Started", value: `${startedDaysAgo}`, subtitle: "days ago" },
    {
      title: "Total check-ins",
      value: `${totalCheckIns}`,
      subtitle: "all time",
    },
  ];
};
