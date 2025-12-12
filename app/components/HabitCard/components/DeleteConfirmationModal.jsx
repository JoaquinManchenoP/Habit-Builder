export default function DeleteConfirmationModal({
  isActive,
  isVisible,
  habitName,
  onCancel,
  onConfirm,
}) {
  if (!isActive) return null;

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl transition duration-300 ease-out ${
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-1"
        }`}
      >
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Delete habit?</h2>
          <p className="text-sm text-slate-600">
            You are about to delete <b> {habitName || "this habit"}.</b> This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              onClick={onConfirm}
            >
              Yes, delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
