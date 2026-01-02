import { useEffect, useState } from "react";

const EXTRA_SMALL_QUERY = "(max-width: 360px)";

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

export default function MonthLabels({ days }) {
  const [cellSize, setCellSize] = useState(15);

  useEffect(() => {
    const mq = window.matchMedia(EXTRA_SMALL_QUERY);
    const handle = (event) => setCellSize(event.matches ? 13 : 15);
    handle(mq);
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  if (!days.length) return null;
  const firstDate = toLocalDate(days[0]?.iso) || new Date(days[0]?.iso);
  const leadingOffset = firstDate ? (firstDate.getDay() + 6) % 7 : 0;
  const columns = Math.ceil((days.length + leadingOffset) / 7);
  const monthMap = new Map();

  days.forEach((day, index) => {
    if (!day) return;
    const date = toLocalDate(day.iso) || new Date(day.iso);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, []);
    }
    monthMap.get(monthKey).push({ index: index + leadingOffset, date });
  });

  const months = Array.from(monthMap.keys()).sort((a, b) => {
    const [ay, am] = a.split("-").map(Number);
    const [by, bm] = b.split("-").map(Number);
    return ay === by ? am - bm : ay - by;
  });

  const labels = months.map((monthKey) => {
    const entries = monthMap.get(monthKey) || [];
    const firstOfMonth =
      entries.find(({ date }) => date.getDate() === 1) ||
      entries.reduce((earliest, current) =>
        current.date < earliest.date ? current : earliest
      );
    const column = Math.floor(firstOfMonth.index / 7);
    return {
      column,
      label: firstOfMonth.date.toLocaleDateString("en", { month: "short" }),
      isEdgeStart: column === 0,
      isEdgeEnd: column === columns - 1,
    };
  });

  const MIN_COLUMN_GAP = 4;
  const filtered = [];
  let lastAcceptedColumn = null;

  for (let i = labels.length - 1; i >= 0; i -= 1) {
    const candidate = labels[i];
    if (
      lastAcceptedColumn === null ||
      lastAcceptedColumn - candidate.column >= MIN_COLUMN_GAP
    ) {
      filtered.push(candidate);
      lastAcceptedColumn = candidate.column;
    }
  }

  filtered.reverse();

  return (
    <div
      className="mx-auto inline-grid items-center gap-x-[5.8px] px-[2px] text-[8px] font-semibold uppercase tracking-wide text-slate-400 max-[360px]:gap-x-[6px] max-[360px]:text-[7px]"
      style={{ gridTemplateColumns: `repeat(${columns}, ${cellSize}px)` }}
    >
      {filtered.map((item, idx) => {
        const edgePadding = item.isEdgeStart
          ? "pl-2"
          : item.isEdgeEnd
          ? "pr-2"
          : "";
        return (
          <div
            key={`${item.label}-${item.column}-${idx}`}
            style={{ gridColumn: item.column + 1 }}
            className={edgePadding}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
}
