"use client";

import { useEffect, useRef, useState } from "react";
import CardHeader from "./components/CardHeader";
import HabitCardMenuLayer from "./components/HabitCardMenuLayer";
import Heatmap from "./components/Heatmap";
import MetricsGrid from "./components/metricsGrid/MetricGrid";
import { useHabitMetrics } from "./hooks/useHabitMetrics";
import {
  countCheckInsLast7Days,
  countCheckInsOnLocalDate,
  getLastActiveDailyDate,
} from "../../lib/habitScheduleUtils";
import { getWeeklyProgressShade } from "../../lib/habitTheme";

const toLocalDate = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [_, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

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
  const contentRef = useRef(null);
  const [contentScale, setContentScale] = useState(1);
  const [availableWidth, setAvailableWidth] = useState(null);
  const [contentWidth, setContentWidth] = useState(null);

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
  const dailyTargetCount = Math.max(1, habit.timesPerDay || 1);
  const createdAtLocalDate = toLocalDate(habit.createdAt);
  let dailyReferenceDate = getLastActiveDailyDate(habit);
  if (createdAtLocalDate && dailyReferenceDate < createdAtLocalDate) {
    dailyReferenceDate = createdAtLocalDate;
  }
  const dailyCurrentCount = !isWeekly
    ? countCheckInsOnLocalDate(habit.checkIns || [], dailyReferenceDate)
    : 0;
  const dailyClampedPercent = !isWeekly
    ? Math.min((dailyCurrentCount / dailyTargetCount) * 100, 100)
    : 0;
  const dailyIsAtTarget = !isWeekly && dailyCurrentCount === dailyTargetCount;
  const isCompletedNow = isWeekly ? isCompletedToday : dailyIsAtTarget;
  const handleDailyCheckIn = () => {
    onComplete?.(habit.id, true);
  };

  useEffect(() => {
    if (!internalRef.current || !contentRef.current) return;
    const cardObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width) setAvailableWidth(width);
      }
    });
    const contentObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width) setContentWidth(width);
      }
    });
    cardObserver.observe(internalRef.current);
    contentObserver.observe(contentRef.current);
    return () => {
      cardObserver.disconnect();
      contentObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!availableWidth || !contentWidth) return;
    const nextScale = Math.min(1, availableWidth / contentWidth);
    setContentScale(nextScale);
  }, [availableWidth, contentWidth]);

  const scaleStyle =
    contentScale < 1
      ? {
          transform: `scale(${contentScale})`,
          transformOrigin: "top left",
        }
      : undefined;

  return (
    <HabitCardMenuLayer
      habit={habit}
      onDelete={onDelete}
      onComplete={onComplete}
      isCompletedToday={isCompletedNow}
      goalType={habit.goalType}
      cardRef={internalRef}
    >
      {({ handleCardClick, menuContent }) => (
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
          className={`group relative grid h-[370px] w-full min-w-0 grid-rows-[2fr_4fr_4fr] rounded-2xl border border-slate-200 bg-white p-5 pt-3 shadow-md transform origin-center transition
            max-[360px]:h-auto max-[360px]:min-h-[320px] max-[360px]:w-full max-[360px]:p-4 max-[360px]:pt-1 max-[280px]:h-[370px] max-[280px]:min-h-0 max-[280px]:w-auto max-[280px]:p-5 ${
              isFading
                ? "pointer-events-none opacity-0 scale-95 transition-all duration-[400ms] ease-out"
                : "opacity-100 transform hover:scale-[1.01] active:scale-[0.99]"
            }`}
        >
          <div className="h-full w-full" style={scaleStyle}>
            <div
              className={` pt-0 relative flex h-full w-full flex-col origin-center transition-transform ${
                isCompletedNow
                  ? "scale-[0.97] group-hover:scale-100"
                  : "scale-100"
              }`}
              ref={contentRef}
            >
              <CardHeader
                name={habit.name}
                isCompletedToday={isCompletedNow}
                onToggleComplete={isWeekly ? null : null}
                goalType={habit.goalType}
                onOpenMenu={handleCardClick}
                weeklyProgress={
                  isWeekly
                    ? {
                        percent: weeklyClampedPercent,
                        count: weeklyCurrentCount,
                        shade: weeklyProgressShade,
                        showCheckmark: weeklyIsAtTarget,
                        onIncrement: () => onWeeklyCheckIn?.(habit),
                      }
                    : null
                }
                dailyProgress={
                  !isWeekly
                    ? {
                        percent: dailyClampedPercent,
                        count: dailyCurrentCount,
                        shade: habit.themeColor,
                        showCheckmark: dailyIsAtTarget,
                        onIncrement: handleDailyCheckIn,
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
