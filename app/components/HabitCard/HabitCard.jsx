"use client";

import { useRef } from "react";
import CardHeader from "./components/CardHeader";
import HabitCardMenuLayer from "./components/HabitCardMenuLayer";
import Heatmap from "./components/Heatmap";
import MetricsGrid from "./components/MetricsGrid";
import { useHabitMetrics } from "./hooks/useHabitMetrics";
import { countCheckInsLast7Days } from "../../lib/habitScheduleUtils";
import { getWeeklyProgressShade } from "../../lib/habitTheme";

export default function HabitCard({
  habit,
  onDelete,
  onComplete,
  onWeeklyCheckIn,
  isCompletedToday = false,
  isFading = false,
  cardRef = null,
}) {
  const internalRef = useRef(null);

  const { days, metrics, consistencyPercent } = useHabitMetrics(habit);
  const isWeekly = habit.goalType === "weekly";
  const weeklyTargetCount = Math.max(1, habit.timesPerWeek || 1);
  const weeklyCurrentCount = isWeekly
    ? countCheckInsLast7Days(habit.checkIns)
    : 0;
  const weeklyClampedPercent = isWeekly
    ? Math.min((weeklyCurrentCount / weeklyTargetCount) * 100, 100)
    : 0;
  const weeklyProgressShade = isWeekly
    ? getWeeklyProgressShade(weeklyClampedPercent)
    : habit.themeColor;
  const weeklyIsAtTarget = isWeekly && weeklyCurrentCount === weeklyTargetCount;
  const weeklyIsComplete = isWeekly && weeklyCurrentCount >= weeklyTargetCount;

  return (
    <HabitCardMenuLayer
      habit={habit}
      onDelete={onDelete}
      onComplete={onComplete}
      isCompletedToday={isCompletedToday}
      goalType={habit.goalType}
      cardRef={internalRef}
    >
      {({ handleCardClick, handleToggleComplete, menuContent }) => (
        <div
          ref={(node) => {
            internalRef.current = node;
            if (typeof cardRef === "function") {
              cardRef(node);
            } else if (cardRef && "current" in cardRef) {
              cardRef.current = node;
            }
          }}
          onClick={handleCardClick}
          className={`group relative grid h-[370px] grid-rows-[2fr_4fr_4fr] rounded-2xl border border-slate-200 bg-white p-5 pt-3 shadow-md transform origin-center transition
            max-[360px]:h-auto max-[360px]:min-h-[320px] max-[360px]:w-full max-[360px]:p-4 max-[360px]:pt-1 max-[280px]:h-[370px] max-[280px]:min-h-0 max-[280px]:w-auto max-[280px]:p-5 ${
              isFading
                ? "pointer-events-none opacity-0 scale-95 transition-all duration-[400ms] ease-out"
                : "opacity-100 transform hover:scale-[1.01] active:scale-[0.99]"
            }`}
        >
          <div
            className={` pt-0 relative flex h-full w-full flex-col origin-center transition-transform ${
              isCompletedToday
                ? "scale-[0.97] group-hover:scale-100"
                : "scale-100"
            }`}
          >
            <CardHeader
              name={habit.name}
              isCompletedToday={isCompletedToday}
              onToggleComplete={isWeekly ? null : handleToggleComplete}
              goalType={habit.goalType}
              onOpenMenu={handleCardClick}
              weeklyProgress={
                isWeekly
                  ? {
                      percent: weeklyClampedPercent,
                      count: weeklyCurrentCount,
                      shade: weeklyProgressShade,
                      isAtTarget: weeklyIsAtTarget,
                      onIncrement: () => onWeeklyCheckIn?.(habit),
                    }
                  : null
              }
            />
            <div className="mt-0">
              <MetricsGrid
                metrics={metrics}
                consistencyPercent={consistencyPercent}
                color={weeklyProgressShade}
              />
            </div>
            <div className="mt-0">
              <Heatmap
                days={days}
                color={weeklyProgressShade}
                activeDays={habit.activeDays}
                createdAt={habit.createdAt}
                goalType={habit.goalType}
              />
            </div>
          </div>
          {weeklyIsComplete ? (
            <div className="pointer-events-none absolute inset-0 z-30 rounded-2xl bg-slate-900/30" />
          ) : null}
          {menuContent}
        </div>
      )}
    </HabitCardMenuLayer>
  );
}
