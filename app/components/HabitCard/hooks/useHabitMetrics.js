import { useMemo } from "react";
import { buildRecentDays } from "../helpers/heatmap";
import {
  buildMetrics,
  calculateAvailableConsistency,
  calculateLongestStreak,
  calculateStartedDaysAgo,
  getWeeklyStreaks,
} from "../helpers/metrics";

export const useHabitMetrics = (habit) => {
  const days = useMemo(
    () =>
      buildRecentDays(
        habit.completions || [],
        habit.activeDays,
        habit.createdAt,
        habit.goalType
      ),
    [habit.completions, habit.activeDays, habit.createdAt, habit.goalType]
  );
  const consistencyPercent = useMemo(() => calculateAvailableConsistency(habit), [habit]);
  const longestStreak = useMemo(
    () => calculateLongestStreak(habit),
    [habit]
  );
  const weeklyStreaks = useMemo(
    () => (habit.goalType === "weekly" ? getWeeklyStreaks(habit) : null),
    [habit]
  );
  const streakValue =
    habit.goalType === "weekly"
      ? weeklyStreaks?.currentStreak || 0
      : longestStreak;
  const startedDaysAgo = useMemo(() => calculateStartedDaysAgo(habit), [habit]);
  const metrics = useMemo(
    () => buildMetrics(habit, consistencyPercent, streakValue, startedDaysAgo),
    [habit, consistencyPercent, streakValue, startedDaysAgo]
  );

  return { days, metrics, consistencyPercent, longestStreak, startedDaysAgo };
};
