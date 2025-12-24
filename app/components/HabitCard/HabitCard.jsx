"use client";

import { useRef } from "react";
import CardHeader from "./components/CardHeader";
import HabitCardMenuLayer from "./components/HabitCardMenuLayer";
import Heatmap from "./components/Heatmap";
import MetricsGrid from "./components/MetricsGrid";
import { useHabitMetrics } from "./hooks/useHabitMetrics";

export default function HabitCard({
  habit,
  onDelete,
  onComplete,
  isCompletedToday = false,
  isFading = false,
  cardRef = null,
}) {
  const internalRef = useRef(null);

  const { days, metrics, consistencyPercent } = useHabitMetrics(habit);

  return (
    <HabitCardMenuLayer
      habit={habit}
      onDelete={onDelete}
      onComplete={onComplete}
      isCompletedToday={isCompletedToday}
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
          className={`group relative grid h-[370px] grid-rows-[2fr_4fr_4fr] rounded-2xl border border-slate-200 bg-white p-5 shadow-md transform origin-center transition
            max-[360px]:h-auto max-[360px]:min-h-[320px] max-[360px]:w-full max-[360px]:p-4 max-[280px]:h-[370px] max-[280px]:min-h-0 max-[280px]:w-auto max-[280px]:p-5 ${
              isFading
                ? "pointer-events-none opacity-0 scale-95 transition-all duration-[400ms] ease-out"
                : "opacity-100 transform hover:scale-[1.01] active:scale-[0.99]"
          }`}
        >
          <div
            className={` pt-2 relative flex h-full w-full flex-col origin-center transition-transform ${
              isCompletedToday
                ? "scale-[0.97] group-hover:scale-100"
                : "scale-100"
            }`}
          >
            <CardHeader
              name={habit.name}
              color={habit.color}
              isCompletedToday={isCompletedToday}
              onToggleComplete={handleToggleComplete}
            />
            <div className="mt-0">
              <MetricsGrid
                metrics={metrics}
                consistencyPercent={consistencyPercent}
                color={habit.color}
              />
            </div>
            <div className="mt-0">
              <Heatmap
                days={days}
                color={habit.color}
                activeDays={habit.activeDays}
                createdAt={habit.createdAt}
              />
            </div>
          </div>
          {menuContent}
        </div>
      )}
    </HabitCardMenuLayer>
  );
}
