import { useEffect, useMemo, useRef, useState } from "react";
import MonthLabels from "./MonthLabels";
import { normalizeActiveDays } from "../../../lib/habitSchedule";

const MEDIUM_DAYS_COUNT = 200;
const SMALLER_DAYS_COUNT = 120;
const SMALL_DAYS_COUNT = 250;
const LARGE_DAYS_COUNT = 120;
const MEDIUM_SCREEN_QUERY = "(max-width: 1135px)";
const SMALLER_SCREEN_QUERY = "(max-width: 750px)";
const SMALL_SCREEN_QUERY = "(max-width: 1247px)";
const OFF_DAY_COLOR = "rgba(51, 73, 78, 0.35)";
const MISSED_DAY_COLOR = "#ef4444";

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

const toLocalISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const LOCAL_DAY_KEY_BY_INDEX = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

const isActiveDayLocal = (date, activeDays) => {
  const key = LOCAL_DAY_KEY_BY_INDEX[date.getDay()];
  return Boolean(activeDays?.[key]);
};

export default function Heatmap({
  days,
  color,
  activeDays,
  createdAt,
  goalType,
}) {
  const containerRef = useRef(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [isSmallerScreen, setIsSmallerScreen] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const normalizedActiveDays = useMemo(
    () => normalizeActiveDays(activeDays),
    [activeDays]
  );
  const isWeekly = goalType === "weekly";
  const isDaily = goalType === "daily";
  const createdAtLocalDate = useMemo(() => toLocalDate(createdAt), [createdAt]);
  const todayLocal = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(SMALL_SCREEN_QUERY);
    const handleMedia = (event) => setIsSmallScreen(event.matches);
    handleMedia(mq);
    mq.addEventListener("change", handleMedia);
    return () => mq.removeEventListener("change", handleMedia);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(MEDIUM_SCREEN_QUERY);
    const handleMedia = (event) => setIsMediumScreen(event.matches);
    handleMedia(mq);
    mq.addEventListener("change", handleMedia);
    return () => mq.removeEventListener("change", handleMedia);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(SMALLER_SCREEN_QUERY);
    const handleMedia = (event) => setIsSmallerScreen(event.matches);
    handleMedia(mq);
    mq.addEventListener("change", handleMedia);
    return () => mq.removeEventListener("change", handleMedia);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const formatHoverDate = (iso) => {
    const parsed = isDaily ? toLocalDate(iso) || new Date(iso) : new Date(iso);
    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleEnter = (day) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredDay(day);
    }, 2500);
  };

  const handleLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredDay(null);
  };

  const displayDays = useMemo(() => {
    if (isSmallerScreen) return days.slice(-SMALLER_DAYS_COUNT);
    if (isMediumScreen) return days.slice(-MEDIUM_DAYS_COUNT);
    if (isSmallScreen) return days.slice(-SMALL_DAYS_COUNT);
    return days.slice(-LARGE_DAYS_COUNT);
  }, [days, isMediumScreen, isSmallScreen, isSmallerScreen]);

  return (
    <div
      ref={containerRef}
      data-habit-heatmap="true"
      className=" flex flex-col justify-center space-y-2 max-[360px]:mt-1.5 max-[360px]:space-y-1.5"
    >
      <MonthLabels days={displayDays} />
      <div className="grid grid-flow-col grid-rows-7 gap-y-[1.5px] gap-x-[7px] justify-center px-[2px] text-xs max-[360px]:gap-y-[1px] max-[360px]:gap-x-[6px] max-[360px]:text-[11px]">
        {displayDays.map((day) => (
          <div
            key={day.iso}
            className="relative"
            onMouseEnter={() => handleEnter(day)}
            onMouseLeave={handleLeave}
          >
            {(() => {
              const dayDate = toLocalDate(day.iso) || new Date(day.iso);
              const isBeforeStart = createdAtLocalDate
                ? dayDate < createdAtLocalDate
                : false;
              const isFuture = dayDate > todayLocal;
              const isMissed =
                isDaily &&
                !isBeforeStart &&
                !isFuture &&
                !day.completed &&
                !day.isOffDay &&
                isActiveDayLocal(dayDate, normalizedActiveDays);
              const backgroundColor =
                isBeforeStart || isFuture
                  ? "rgba(148, 163, 184, 0.25)"
                  : day.completed
                  ? color || "#10b981"
                  : day.isOffDay
                  ? OFF_DAY_COLOR
                  : isMissed
                  ? MISSED_DAY_COLOR
                  : "rgba(148, 163, 184, 0.25)";
              return (
                <div
                  className="h-[15px] w-[15px] rounded-sm border border-slate-200 max-[360px]:h-[13px] max-[360px]:w-[13px]"
                  style={{ backgroundColor }}
                  title={formatHoverDate(day.iso)}
                />
              );
            })()}
            {hoveredDay?.iso === day.iso ? (
              <div className="pointer-events-none absolute left-1/2 top-[-26px] z-10 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white shadow-md">
                {formatHoverDate(day.iso)}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
