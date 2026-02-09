"use client";

import { useEffect, useRef, useState } from "react";
import CardHeader from "../../components/HabitCard/components/CardHeader";
import HabitCardMenuLayer from "../../components/HabitCard/components/HabitCardMenuLayer";
import Heatmap from "../../components/HabitCard/components/heatmap/Heatmap";
import MetricsGrid from "../../components/HabitCard/components/metricsGrid/MetricGrid";
import { useHabitMetrics } from "../../components/HabitCard/hooks/useHabitMetrics";
import {
  countCheckInsOnLocalDate,
  getLastActiveDailyDate,
  getStartOfWeekLocal,
  toLocalISODate,
} from "../../lib/habitScheduleUtils";
import { getProgressColor } from "../../lib/progressColor";

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

const getWeeklyTargetCount = (habit) => {
  if (!habit) return 0;
  if (habit.goalType === "weekly") {
    return Math.max(1, habit.timesPerWeek || 1);
  }
  const timesPerDay = Math.max(1, habit.timesPerDay || 1);
  const activeDaysCount = habit.activeDays
    ? Object.values(habit.activeDays).filter(Boolean).length
    : 7;
  return timesPerDay * Math.max(1, activeDaysCount);
};

const getWeeklyCheckInStreak = (habit) => {
  const checkIns = Array.isArray(habit?.checkIns) ? habit.checkIns : [];
  if (!checkIns.length) return 0;
  const weeklyTarget = getWeeklyTargetCount(habit);
  if (!weeklyTarget) return 0;
  const counts = new Map();
  checkIns.forEach((timestamp) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return;
    const weekStart = getStartOfWeekLocal(date);
    const key = toLocalISODate(weekStart);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const today = new Date();
  const createdAtDate = habit?.createdAt ? new Date(habit.createdAt) : null;
  const startWeek = createdAtDate ? getStartOfWeekLocal(createdAtDate) : null;
  const cursor = getStartOfWeekLocal(today);
  let streak = 0;
  while (!startWeek || cursor >= startWeek) {
    const key = toLocalISODate(cursor);
    const count = counts.get(key) || 0;
    if (count >= weeklyTarget) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 7);
    } else {
      break;
    }
  }
  return streak;
};

export default function DailyHabitCardHabitsPage({
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { days, metrics, consistencyPercent } = useHabitMetrics(habit);
  const weeklyStreakValue = getWeeklyCheckInStreak(habit);
  const weeklyStreakUnit = weeklyStreakValue === 1 ? "week" : "weeks";
  const adjustedMetrics = metrics.map((metric) =>
    metric.title === "Streak"
      ? {
          ...metric,
          value: `${weeklyStreakValue}`,
          subtitle: weeklyStreakUnit,
        }
      : metric
  );
  const dailyTargetCount = Math.max(1, habit.timesPerDay || 1);
  const createdAtLocalDate = toLocalDate(habit.createdAt);
  let dailyReferenceDate = getLastActiveDailyDate(habit);
  if (createdAtLocalDate && dailyReferenceDate < createdAtLocalDate) {
    dailyReferenceDate = createdAtLocalDate;
  }
  const dailyCurrentCount = countCheckInsOnLocalDate(
    habit.checkIns || [],
    dailyReferenceDate
  );
  const dailyEffectiveCount = Math.min(dailyCurrentCount, dailyTargetCount);
  const dailyClampedPercent = Math.min(
    (dailyEffectiveCount / dailyTargetCount) * 100,
    100
  );
  const dailyProgressShade = getProgressColor(dailyClampedPercent);
  const completionShade = getProgressColor(100);
  const dailyIsAtTarget = dailyCurrentCount >= dailyTargetCount;
  const isCompletedNow = dailyIsAtTarget;
  const todayIso = toLocalISODate(new Date());
  const adjustedDays = days.map((day) =>
    day.iso === todayIso ? { ...day, completed: dailyCurrentCount > 0 } : day
  );
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
      {({ handleCardClick, menuContent }) => {
        const handleCardToggle = (event) => {
          if (isCollapsed) {
            event.stopPropagation();
            setIsCollapsed(false);
            return;
          }
          handleCardClick(event);
        };
        return (
          <div
            ref={(node) => {
              internalRef.current = node;
              if (typeof cardRef === "function") {
                cardRef(node);
              } else if (cardRef && "current" in cardRef) {
                cardRef.current = node;
              }
            }}
            onClick={handleCardToggle}
            className={`group relative grid w-full min-w-0 rounded-xl border border-slate-200 bg-white p-5 pt-3 shadow-md transform origin-center transition-[height,transform] ease-in-out ${
            isCollapsed
              ? "h-[90px] grid-rows-[auto] items-center delay-120 duration-300"
                : "h-[380px] grid-rows-[2fr_4fr_4fr] delay-0 duration-500 max-[360px]:h-auto max-[360px]:min-h-[320px] max-[360px]:w-full max-[360px]:p-4 max-[360px]:pt-1 max-[280px]:h-[370px] max-[280px]:min-h-0 max-[280px]:w-auto max-[280px]:p-5"
            } ${
              isFading
                ? "pointer-events-none opacity-0 scale-95 transition-all duration-[400ms] ease-out"
                : "opacity-100 transform hover:scale-[1.01] active:scale-[0.99]"
            }`}
          >
            <div className="h-full w-full" style={scaleStyle}>
              <div
                className={`pt-0 relative flex h-full w-full flex-col origin-center transition-transform ${
                  isCompletedNow
                    ? "scale-[0.97] group-hover:scale-100"
                    : "scale-100"
                }`}
                ref={contentRef}
              >
                <CardHeader
                  name={habit.name}
                  isCompletedToday={isCompletedNow}
                  onToggleComplete={null}
                  goalType={habit.goalType}
                  onOpenMenu={handleCardToggle}
                  isCollapsed={isCollapsed}
                  onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
                  weeklyProgress={null}
                  dailyProgress={{
                    percent: dailyClampedPercent,
                    count: dailyCurrentCount,
                    shade: dailyProgressShade,
                    showCheckmark: false,
                    onIncrement: handleDailyCheckIn,
                    onDecrement: () => onComplete?.(habit.id, false),
                  }}
                />
                <div
                  className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out ${
                    isCollapsed
                      ? "max-h-0 opacity-0 pointer-events-none"
                      : "max-h-[1000px] opacity-100 delay-[250ms]"
                  }`}
                >
                  <div className="mt-0">
                    <MetricsGrid
                      metrics={adjustedMetrics}
                      consistencyPercent={consistencyPercent}
                      color={dailyProgressShade}
                      completionColor={completionShade}
                    />
                  </div>
                  <div className="mt-0">
                    <Heatmap
                      days={adjustedDays}
                      color={dailyProgressShade}
                      activeDays={habit.activeDays}
                      createdAt={habit.createdAt}
                      goalType={habit.goalType}
                    />
                  </div>
                </div>
              </div>
            </div>
            {!isCollapsed && dailyIsAtTarget ? (
              <div className="pointer-events-none absolute inset-0 z-30 rounded-xl bg-slate-900/30" />
            ) : null}
            {menuContent}
          </div>
        );
      }}
    </HabitCardMenuLayer>
  );
}
