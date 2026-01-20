"use client";

import { useEffect, useRef, useState } from "react";
import CardHeader from "../../components/HabitCard/components/CardHeader";
import HabitCardMenuLayer from "../../components/HabitCard/components/HabitCardMenuLayer";
import Heatmap from "../../components/HabitCard/components/heatmap/Heatmap";
import MetricsGrid from "../../components/HabitCard/components/metricsGrid/MetricGrid";
import { useHabitMetrics } from "../../components/HabitCard/hooks/useHabitMetrics";
import { countCheckInsThisWeek } from "../../lib/habitScheduleUtils";
import { getProgressColor } from "../../lib/progressColor";

export default function WeeklyHabitCardHabitsPage({
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
  const weeklyTargetCount = Math.max(1, habit.timesPerWeek || 1);
  const weeklyCurrentCount = countCheckInsThisWeek(habit.checkIns);
  const weeklyClampedPercent = Math.min(
    (weeklyCurrentCount / weeklyTargetCount) * 100,
    100
  );
  const weeklyProgressShade = getProgressColor(weeklyClampedPercent);
  const weeklyIsAtTarget = weeklyCurrentCount === weeklyTargetCount;
  const weeklyIsComplete = weeklyCurrentCount >= weeklyTargetCount;
  const isCompletedNow = isCompletedToday;

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
          className={`group relative grid w-full min-w-0 rounded-xl border border-slate-200 bg-white p-5 pt-3 shadow-md transform origin-center transition-[height,transform] duration-500 ease-in-out ${
            isCollapsed
              ? "h-[90px] grid-rows-[auto] items-center"
              : "h-[380px] grid-rows-[2fr_4fr_4fr] max-[360px]:h-auto max-[360px]:min-h-[320px] max-[360px]:w-full max-[360px]:p-4 max-[360px]:pt-1 max-[280px]:h-[370px] max-[280px]:min-h-0 max-[280px]:w-auto max-[280px]:p-5"
          } ${
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
                } ${isCollapsed ? "justify-center" : ""}`}
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
                  weeklyProgress={{
                    percent: weeklyClampedPercent,
                    count: weeklyCurrentCount,
                    shade: weeklyProgressShade,
                    showCheckmark: weeklyIsAtTarget,
                    onIncrement: () => onWeeklyCheckIn?.(habit),
                    onDecrement: () => onComplete?.(habit.id, false),
                  }}
                  dailyProgress={null}
                />
              <div
                className={`overflow-hidden transition-[max-height,opacity] duration-650 ease-in-out ${
                  isCollapsed
                    ? "max-h-0 opacity-0 pointer-events-none"
                    : "max-h-[1000px] opacity-100"
                }`}
              >
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
            </div>
            {!isCollapsed && weeklyIsComplete ? (
              <div className="pointer-events-none absolute inset-0 z-30 rounded-xl bg-slate-900/30" />
            ) : null}
            {menuContent}
          </div>
        );
      }}
    </HabitCardMenuLayer>
  );
}
