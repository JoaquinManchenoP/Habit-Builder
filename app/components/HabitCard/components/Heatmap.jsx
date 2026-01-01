import { useEffect, useMemo, useRef, useState } from "react";
import MonthLabels from "./MonthLabels";
import { normalizeActiveDays } from "../../../lib/habitSchedule";

const CELL_SIZE = 10; // px
const GAP_SIZE = 7; // px between columns
const PADDING_BUFFER = 4; // px total horizontal padding in the container
const MAX_COLUMNS_CAP = 32; // safety guard to avoid runaway growth
const SINGLE_COLUMN_QUERY = "(max-width: 1024px)";
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

const LOCAL_DAY_KEY_BY_INDEX = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

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
  const [availableWidth, setAvailableWidth] = useState(null);
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const normalizedActiveDays = useMemo(
    () => normalizeActiveDays(activeDays),
    [activeDays]
  );
  const isWeekly = goalType === "weekly";
  const isDaily = goalType === "daily";
  const createdAtLocalDate = useMemo(
    () => toLocalDate(createdAt),
    [createdAt]
  );
  const todayLocal = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(SINGLE_COLUMN_QUERY);
    const handleMedia = (event) => setIsSingleColumn(event.matches);
    handleMedia(mq);
    mq.addEventListener("change", handleMedia);
    return () => mq.removeEventListener("change", handleMedia);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          const width = Array.isArray(entry.contentBoxSize)
            ? entry.contentBoxSize[0].inlineSize
            : entry.contentBoxSize.inlineSize;
          setAvailableWidth(width);
        } else {
          setAvailableWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
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
    if (!isSingleColumn || !availableWidth) return days;

    const defaultColumns = Math.ceil(days.length / 7);
    const maxColumnsByWidth = Math.max(
      1,
      Math.floor(
        (availableWidth + GAP_SIZE - PADDING_BUFFER) / (CELL_SIZE + GAP_SIZE)
      )
    );
    const targetColumns = Math.min(
      Math.max(1, maxColumnsByWidth),
      MAX_COLUMNS_CAP
    );

    if (targetColumns === defaultColumns) return days;
    if (targetColumns < defaultColumns) {
      const totalDays = targetColumns * 7;
      const startIndex = Math.max(0, days.length - totalDays);
      return days.slice(startIndex);
    }

    const completionMap = new Set(
      days.filter((d) => d.completed).map((d) => d.iso)
    );
    const latestIso = days[days.length - 1]?.iso;
    if (!latestIso) return days;
    const latestDate = toLocalDate(latestIso) || new Date(latestIso);
    const totalDays = targetColumns * 7;

    const extended = Array.from({ length: totalDays }, (_, idxFromEnd) => {
      const date = new Date(latestDate);
      date.setDate(latestDate.getDate() - (totalDays - 1 - idxFromEnd));
      const iso = isWeekly
        ? date.toISOString().slice(0, 10)
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(date.getDate()).padStart(2, "0")}`;
      const existing = days.find((d) => d.iso === iso);
      const isBeforeStart = createdAtLocalDate ? date < createdAtLocalDate : false;
      const isBeforeWeeklyStart = isWeekly && isBeforeStart;
      const completed = isWeekly
        ? !isBeforeWeeklyStart && completionMap.has(iso)
        : !isBeforeStart && completionMap.has(iso);
      return (
        existing || {
          iso,
          label: date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          completed,
          isOffDay:
            isWeekly
              ? !isBeforeWeeklyStart && !completed
              : !isBeforeStart &&
                !isActiveDayLocal(date, normalizedActiveDays),
        }
      );
    });

    return extended;
  }, [
    availableWidth,
    createdAtLocalDate,
    days,
    isSingleColumn,
    isDaily,
    isWeekly,
    normalizedActiveDays,
    todayLocal,
  ]);

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
              const backgroundColor = isBeforeStart || isFuture
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
