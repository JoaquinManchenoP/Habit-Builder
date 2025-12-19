import { useMemo } from "react";
import { buildRecentDays } from "../helpers/heatmap";
import {
  buildMetrics,
  calculateAvailableConsistency,
  calculateLongestStreak,
  calculateStartedDaysAgo,
} from "../helpers/metrics";

export const useHabitMetrics = (habit) => {
  const days = useMemo(
    () => buildRecentDays(habit.completions || [], habit.activeDays, habit.createdAt),
    [habit.completions, habit.activeDays, habit.createdAt]
  );
  const consistencyPercent = useMemo(() => calculateAvailableConsistency(habit), [habit]);
  const longestStreak = useMemo(
    () => calculateLongestStreak(habit),
    [habit]
  );
  const startedDaysAgo = useMemo(() => calculateStartedDaysAgo(habit), [habit]);
  const metrics = useMemo(
    () => buildMetrics(habit, consistencyPercent, longestStreak, startedDaysAgo),
    [habit, consistencyPercent, longestStreak, startedDaysAgo]
  );

  return { days, metrics, consistencyPercent, longestStreak, startedDaysAgo };
};
