import MonthLabels from "./MonthLabels";

export default function Heatmap({ days, color }) {
  return (
    <div className="mt-2 flex flex-col justify-center space-y-2">
      <MonthLabels days={days} />
      <div className="grid grid-flow-col grid-rows-7 gap-y-[1.5px] gap-x-[7px] justify-center px-[2px] text-xs">
        {days.map((day) => (
          <div
            key={day.iso}
            className="h-[17px] w-[17px] rounded-sm border border-slate-200"
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
