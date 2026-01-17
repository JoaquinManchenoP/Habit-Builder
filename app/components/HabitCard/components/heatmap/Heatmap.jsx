import { useEffect, useMemo, useRef, useState } from "react";
import MonthLabels from "./MonthLabels";
import WeekdayLabels from "./WeekdayLabels";
import { normalizeActiveDays } from "../../../../lib/habitSchedule";
import { getProgressColor } from "../../../../lib/progressColor";

const MEDIUM_DAYS_COUNT = 180;
const SMALLER_DAYS_COUNT = 100;
const LARGE_DAYS_COUNT = 120;
const MEDIUM_SCREEN_QUERY = "(max-width: 1263px)";
const SMALLER_SCREEN_QUERY = "(max-width: 750px)";
const OFF_DAY_COLOR = "rgba(51, 73, 78, 0.35)";
const MISSED_DAY_COLOR = "#fca5a5";

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
  const todayIso = useMemo(
    () =>
      isWeekly
        ? new Date().toISOString().slice(0, 10)
        : toLocalISODate(todayLocal),
    [isWeekly, todayLocal]
  );
  const lockedCompletionColor = useMemo(
    () => getProgressColor(100),
    []
  );

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
    const match = iso?.match?.(/^(\d{4})-(\d{2})-(\d{2})$/);
    const parsed = match
      ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
      : new Date(iso);
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
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

  const alignToMonday = (date) => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = (day + 6) % 7;
    result.setDate(result.getDate() - diff);
    return result;
  };

  const displayDays = useMemo(() => {
    if (isSmallerScreen) return days.slice(-SMALLER_DAYS_COUNT);
    if (isMediumScreen) return days.slice(-MEDIUM_DAYS_COUNT);
    return days.slice(-LARGE_DAYS_COUNT);
  }, [days, isMediumScreen, isSmallerScreen]);

  return (
    <div
      ref={containerRef}
      data-habit-heatmap="true"
      className=" flex flex-col justify-center space-y-2 max-[360px]:mt-1.5 max-[360px]:space-y-1.5"
    >
      <MonthLabels days={displayDays} />
      <div className="relative w-fit mx-auto">
        <WeekdayLabels offsetPx={25} />
        <div className="grid grid-flow-col grid-rows-7 gap-y-[1.5px] gap-x-[7px] px-[2px] text-xs max-[360px]:gap-y-[1px] max-[360px]:gap-x-[6px] max-[360px]:text-[11px]">
          {(() => {
            if (!displayDays.length) return null;
            const parsed = displayDays.map((day) => ({
              ...day,
              date: toLocalDate(day.iso) || new Date(day.iso),
            }));
            const startWeek = alignToMonday(parsed[0].date);
            const endWeek = alignToMonday(parsed[parsed.length - 1].date);
            const daySpan = Math.round((endWeek - startWeek) / 86400000);
            const columns = Math.max(1, Math.floor(daySpan / 7) + 1);
            const cells = Array.from({ length: columns * 7 }, () => null);

            parsed.forEach((day) => {
              const dayDate = day.date;
              const weekOffset = Math.floor(
                (dayDate - startWeek) / 86400000 / 7
              );
              const weekdayRow = (dayDate.getDay() + 6) % 7;
              const cellIndex = weekOffset * 7 + weekdayRow;
              if (cellIndex >= 0 && cellIndex < cells.length) {
                cells[cellIndex] = day;
              }
            });

            return cells.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-[15px] w-[15px] max-[360px]:h-[13px] max-[360px]:w-[13px]"
                  />
                );
              }
              return (
                <div
                  key={day.iso}
                  className="relative"
                  onMouseEnter={() => handleEnter(day)}
                  onMouseLeave={handleLeave}
                >
                  {(() => {
                    const dayDate = day.date;
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
                    const isToday = day.iso === todayIso;
                    const backgroundColor =
                      isBeforeStart || isFuture
                        ? "rgba(148, 163, 184, 0.25)"
                        : day.completed
                        ? isToday
                          ? color || lockedCompletionColor
                          : lockedCompletionColor
                        : day.isOffDay
                        ? OFF_DAY_COLOR
                        : isMissed
                        ? MISSED_DAY_COLOR
                        : "rgba(148, 163, 184, 0.25)";
                    return (
                      <div
                        className="h-[14px] w-[14px] rounded-sm border border-slate-200 max-[360px]:h-[8px] max-[360px]:w-[8px]"
                        style={{
                          backgroundColor,
                          transition: "background-color 250ms ease",
                        }}
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
              );
            });
          })()}
        </div>
      </div>
      <div className="flex w-full justify-end">
        <div className="flex items-center gap-3 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
          <span className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-sm border border-slate-200"
              style={{ backgroundColor: lockedCompletionColor }}
            />
            Done
          </span>
          <span className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-sm border border-slate-200"
              style={{ backgroundColor: MISSED_DAY_COLOR }}
            />
            Missed
          </span>
          <span className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-sm border border-slate-200"
              style={{ backgroundColor: OFF_DAY_COLOR }}
            />
            Off
          </span>
        </div>
      </div>
    </div>
  );
}
