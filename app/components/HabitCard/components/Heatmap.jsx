import { useEffect, useMemo, useRef, useState } from "react";
import MonthLabels from "./MonthLabels";

const CELL_SIZE = 17; // px
const GAP_SIZE = 7; // px between columns
const PADDING_BUFFER = 4; // px total horizontal padding in the container
const MAX_COLUMNS_CAP = 32; // safety guard to avoid runaway growth
const SINGLE_COLUMN_QUERY = "(max-width: 1024px)";

export default function Heatmap({ days, color }) {
  const containerRef = useRef(null);
  const [availableWidth, setAvailableWidth] = useState(null);
  const [isSingleColumn, setIsSingleColumn] = useState(false);

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

  const displayDays = useMemo(() => {
    if (!isSingleColumn || !availableWidth) return days;

    const defaultColumns = Math.ceil(days.length / 7);
    const maxColumnsByWidth = Math.max(
      1,
      Math.floor((availableWidth + GAP_SIZE - PADDING_BUFFER) / (CELL_SIZE + GAP_SIZE))
    );
    const targetColumns = Math.min(
      Math.max(defaultColumns, maxColumnsByWidth),
      MAX_COLUMNS_CAP
    );

    if (targetColumns <= defaultColumns) return days;

    const completionMap = new Set(days.filter((d) => d.completed).map((d) => d.iso));
    const latestIso = days[days.length - 1]?.iso;
    if (!latestIso) return days;
    const latestDate = new Date(latestIso);
    const totalDays = targetColumns * 7;

    const extended = Array.from({ length: totalDays }, (_, idxFromEnd) => {
      const date = new Date(latestDate);
      date.setDate(latestDate.getDate() - (totalDays - 1 - idxFromEnd));
      const iso = date.toISOString().slice(0, 10);
      const existing = days.find((d) => d.iso === iso);
      return (
        existing || {
          iso,
          label: date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          completed: completionMap.has(iso),
        }
      );
    });

    return extended;
  }, [availableWidth, days, isSingleColumn]);

  return (
    <div
      ref={containerRef}
      className="mt-2 flex flex-col justify-center space-y-2 max-[360px]:mt-1.5 max-[360px]:space-y-1.5"
    >
      <MonthLabels days={displayDays} />
      <div className="grid grid-flow-col grid-rows-7 gap-y-[1.5px] gap-x-[7px] justify-center px-[2px] text-xs max-[360px]:gap-y-[1px] max-[360px]:gap-x-[6px] max-[360px]:text-[11px]">
        {displayDays.map((day) => (
          <div
            key={day.iso}
            className="h-[17px] w-[17px] rounded-sm border border-slate-200 max-[360px]:h-[15px] max-[360px]:w-[15px]"
            style={{
              backgroundColor: day.completed
                ? color || "#10b981"
                : "rgba(148, 163, 184, 0.25)",
            }}
            title={`${day.label} - ${day.completed ? "Completed" : "Empty"}`}
          />
        ))}
      </div>
    </div>
  );
}
