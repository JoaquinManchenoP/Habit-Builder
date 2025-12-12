import { buildMonthAnchors } from "../helpers/heatmap";

export default function MonthLabels({ days }) {
  if (!days.length) return null;
  const columns = Math.ceil(days.length / 7);
  const labels = buildMonthAnchors(days);

  return (
    <div
      className="grid items-center gap-x-[7px] px-[2px] text-[10px] font-semibold uppercase tracking-wide text-slate-400"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
    >
      {labels.map((item, idx) => {
        const edgePadding = item.isEdgeStart ? "pl-2" : item.isEdgeEnd ? "pr-2" : "";
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
