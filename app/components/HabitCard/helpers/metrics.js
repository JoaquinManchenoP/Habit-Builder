import { parseISODate, toISODate } from "../../../lib/analytics";
import { getStartOfWeekLocal } from "../../../lib/habitScheduleUtils";
import { isActiveDay, normalizeActiveDays } from "../../../lib/habitSchedule";

const toLocalISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeeklyCounts = (habit) => {
  const checkIns = Array.isArray(habit?.checkIns) ? habit.checkIns : [];
  const counts = new Map();
  checkIns.forEach((timestamp) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return;
    const weekStart = getStartOfWeekLocal(date);
    const key = toLocalISODate(weekStart);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return counts;
};

const getWeeklyWindow = (habit) => {
  const today = new Date();
  const createdAtDate = habit.createdAt ? new Date(habit.createdAt) : today;
  const startWeek = getStartOfWeekLocal(createdAtDate);
  const currentWeek = getStartOfWeekLocal(today);
  return { startWeek, currentWeek };
};

export const getWeeklyStreaks = (habit) => {
  const target = Math.max(1, habit.timesPerWeek || 1);
  const { startWeek, currentWeek } = getWeeklyWindow(habit);
  const weekCounts = getWeeklyCounts(habit);
  let longest = 0;
  let current = 0;
  const pointer = new Date(startWeek);
  while (pointer <= currentWeek) {
    const key = toLocalISODate(pointer);
    const count = weekCounts.get(key) || 0;
    if (count >= target) {
      current += 1;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
    pointer.setDate(pointer.getDate() + 7);
  }

  let currentStreak = 0;
  const cursor = new Date(currentWeek);
  while (cursor >= startWeek) {
    const key = toLocalISODate(cursor);
    const count = weekCounts.get(key) || 0;
    if (count >= target) {
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 7);
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak: longest };
};

export const calculateAvailableConsistency = (habit) => {
  if (!habit) return 0;
  if (habit.goalType === "weekly") {
    const target = Math.max(1, habit.timesPerWeek || 1);
    const { startWeek, currentWeek } = getWeeklyWindow(habit);
    const weekCounts = getWeeklyCounts(habit);
    let totalWeeks = 0;
    let completedWeeks = 0;
    const pointer = new Date(startWeek);
    while (pointer <= currentWeek) {
      totalWeeks += 1;
      const key = toLocalISODate(pointer);
      const count = weekCounts.get(key) || 0;
      if (count >= target) completedWeeks += 1;
      pointer.setDate(pointer.getDate() + 7);
    }
    if (totalWeeks <= 0) return 0;
    return Math.round((completedWeeks / totalWeeks) * 100);
  }
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
  if (habit?.goalType === "weekly") {
    return getWeeklyStreaks(habit).longestStreak;
  }
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
  streakValue,
  startedDaysAgo
) => {
  const totalCheckIns =
    habit.goalType === "weekly"
      ? habit.checkIns?.length || 0
      : habit.completions?.length || 0;
  const consistencyLabel = habit.goalType === "weekly" ? "of weeks" : "of days";
  const streakUnit =
    habit.goalType === "weekly"
      ? streakValue === 1
        ? "week"
        : "weeks"
      : streakValue === 1
      ? "day"
      : "days";
  return [
    {
      title: "Consistency",
      value: `${consistencyPercent}%`,
      subtitle: consistencyLabel,
    },
    {
      title: "Streak",
      value: `${streakValue}`,
      subtitle: streakUnit,
    },
    { title: "Started", value: `${startedDaysAgo}`, subtitle: "days ago" },
    {
      title: "Check-ins",
      value: `${totalCheckIns}`,
      subtitle: "all time",
    },
  ];
};
