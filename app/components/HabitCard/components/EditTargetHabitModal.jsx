export default function EditTargetHabitModal({
  open,
  visible,
  nameValue,
  targetValue,
  targetLabel,
  minTarget = 1,
  maxTarget = 20,
  onChangeName,
  onChangeTarget,
  onIncrementTarget,
  onDecrementTarget,
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
            <p className="text-sm text-slate-600">
              Update the name and target for this habit.
            </p>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Habit name
              <input
                type="text"
                value={nameValue}
                onChange={(event) => onChangeName(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </label>
            <div className="space-y-2">
              <span className="block text-sm font-medium text-slate-700">
                {targetLabel}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="h-9 w-9 rounded-md border border-slate-200 text-lg font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                  onClick={onDecrementTarget}
                  aria-label="Decrease target"
                >
                  -
                </button>
                <input
                  type="number"
                  min={minTarget}
                  max={maxTarget}
                  step={1}
                  value={targetValue}
                  onChange={(event) => onChangeTarget(event.target.value)}
                  className="w-16 rounded-md border border-slate-300 px-2 py-2 text-center text-sm text-slate-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className="h-9 w-9 rounded-md border border-slate-200 text-lg font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                  onClick={onIncrementTarget}
                  aria-label="Increase target"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Choose a value between {minTarget} and {maxTarget}.
              </p>
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
              onClick={() => onSave(nameValue, targetValue)}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
