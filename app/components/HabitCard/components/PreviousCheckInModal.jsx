import { useMemo } from "react";
import { buildCalendarWeeks } from "../helpers/calendar";

const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

const Calendar = ({ monthDate, selectedDate, onSelectDate, onMonthChange }) => {
  const weeks = useMemo(() => buildCalendarWeeks(monthDate), [monthDate]);
  const monthLabel = monthDate.toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50/70 p-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="rounded-md px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          onClick={() => onMonthChange(-1)}
        >
          ←
        </button>
        <p className="text-sm font-semibold text-slate-800">{monthLabel}</p>
        <button
          type="button"
          className="rounded-md px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          onClick={() => onMonthChange(1)}
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {weekdayLabels.map((label, idx) => (
          <div key={`${label}-${idx}`}>{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {weeks.flat().map((cell, idx) => {
          if (!cell) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-9 w-9 rounded-md border border-transparent"
              />
            );
          }
          const isSelected = selectedDate === cell.iso;
          return (
            <button
              key={cell.iso}
              type="button"
              className={`h-9 w-9 rounded-md border text-sm transition ${
                isSelected
                  ? "border-green-600 bg-green-50 font-semibold text-green-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-green-200 hover:bg-green-50"
              }`}
              onClick={() => onSelectDate(cell.iso)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function PreviousCheckInModal({
  open,
  visible,
  monthDate,
  selectedDate,
  onClose,
  onConfirm,
  onSelectDate,
  onMonthChange,
}) {
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl transition duration-300 ease-out ${
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-1"
        }`}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">Add previous check in</h2>
            <p className="text-sm text-slate-600">
              Pick a date to add a past check-in for this habit.
            </p>
          </div>
          <Calendar
            monthDate={monthDate}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onMonthChange={onMonthChange}
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedDate}
              className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 ${
                selectedDate
                  ? "bg-green-600 hover:bg-green-500"
                  : "cursor-not-allowed bg-slate-300"
              }`}
              onClick={() => {
                if (!selectedDate) return;
                onConfirm(selectedDate);
              }}
            >
              Add previous check in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
