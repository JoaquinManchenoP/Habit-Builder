"use client";

import { useEffect, useMemo, useState } from "react";
import CircularProgress from "../../components/HabitCard/components/CircularProgress/CircularProgress";
import { countCheckInsOnLocalDate } from "../../lib/habitScheduleUtils";
import { getProgressColor } from "../../lib/progressColor";

export default function MainCircularProgress({ todayList }) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const progressPercent = useMemo(() => {
    const today = new Date();
    const totals = (todayList || []).reduce(
      (acc, habit) => {
        if (habit.goalType !== "daily") return acc;
        const target = Math.max(0, habit.timesPerDay || 0);
        if (!target) return acc;
        const completedToday = countCheckInsOnLocalDate(
          habit.checkIns || [],
          today
        );
        acc.required += target;
        acc.completed += Math.min(completedToday, target);
        return acc;
      },
      { required: 0, completed: 0 }
    );
    if (totals.required === 0) return 0;
    return (totals.completed / totals.required) * 100;
  }, [todayList]);
  const progressColor = getProgressColor(progressPercent);

  useEffect(() => {
    setShouldAnimate(true);
  }, [progressPercent]);

  return (
    <>
      <h1 className="text-lg font-semibold text-slate-900">Today</h1>
      <div className="flex items-center justify-center">
        <div className="mt-6 scale-[1.4] lg:scale-[1.6] md:scale-[1.6] sm:scale-[1.5] min-[1100px]:scale-170">
          <CircularProgress
            percent={progressPercent}
            value={progressPercent}
            showPercent
            color={progressColor}
            useCompletionColor={false}
            animate={shouldAnimate}
          />
        </div>
      </div>
    </>
  );
}
