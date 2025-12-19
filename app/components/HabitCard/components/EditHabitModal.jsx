import { WEEKDAY_LABELS, WEEKDAY_ORDER } from "../../../lib/habitSchedule";

export default function EditHabitModal({
  open,
  visible,
  nameValue,
  activeDaysValue,
  onChangeName,
  onChangeActiveDay,
  onSave,
  onClose,
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
            <h2 className="text-lg font-semibold text-slate-900">Edit habit</h2>
            <p className="text-sm text-slate-600">Update the name for this habit.</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Habit name
              <input
                type="text"
                value={nameValue}
                onChange={(event) => onChangeName(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </label>
            <div className="flex items-start justify-between gap-2">
              {WEEKDAY_ORDER.map((dayKey) => (
                <label
                  key={dayKey}
                  className="flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600"
                >
                  <input
                    type="checkbox"
                    checked={activeDaysValue?.[dayKey]}
                    onChange={(event) => onChangeActiveDay(dayKey, event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-300"
                  />
                  <span>{WEEKDAY_LABELS[dayKey]}</span>
                </label>
              ))}
            </div>
          </div>
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
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
              onClick={() => onSave(nameValue, activeDaysValue)}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
