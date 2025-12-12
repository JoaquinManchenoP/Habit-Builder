import { useMemo } from "react";
import { buildRecentDays } from "../helpers/heatmap";
import {
  buildMetrics,
  calculateAvailableConsistency,
  calculateLongestStreak,
  calculateStartedDaysAgo,
} from "../helpers/metrics";

export const useHabitMetrics = (habit) => {
  const days = useMemo(() => buildRecentDays(habit.completions || []), [habit.completions]);
  const consistencyPercent = useMemo(() => calculateAvailableConsistency(habit), [habit]);
  const longestStreak = useMemo(
    () => calculateLongestStreak(habit.completions || []),
    [habit.completions]
  );
  const startedDaysAgo = useMemo(() => calculateStartedDaysAgo(habit), [habit]);
  const metrics = useMemo(
    () => buildMetrics(habit, consistencyPercent, longestStreak, startedDaysAgo),
    [habit, consistencyPercent, longestStreak, startedDaysAgo]
  );

  return { days, metrics, consistencyPercent, longestStreak, startedDaysAgo };
};
