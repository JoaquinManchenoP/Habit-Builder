import CircularProgress from "./CircularProgress/CircularProgress";

export default function ProgressControls({ progress }) {
  const progressCount = Number.isFinite(progress?.count) ? progress.count : 0;
  const completionColor = progress?.completionColor;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (progressCount > 0) {
            progress.onDecrement?.();
          }
        }}
        className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 disabled:cursor-default disabled:opacity-40"
        disabled={progressCount <= 0}
        aria-label="Decrease count"
      >
        <svg
          viewBox="0 0 20 20"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M5 10h10" />
        </svg>
      </button>
      <div
        data-habit-progress="true"
        onClick={(event) => {
          event.stopPropagation();
          progress.onIncrement?.();
        }}
        className="scale-[0.85] -ml-1"
      >
        <CircularProgress
          percent={progress.percent}
          value={progress.count}
          color={progress.shade}
          showCheckmark={progress.showCheckmark}
          useCompletionColor={false}
          completionColor={completionColor}
        />
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          progress.onIncrement?.();
        }}
        className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
        aria-label="Increase count"
      >
        <svg
          viewBox="0 0 20 20"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M10 5v10M5 10h10" />
        </svg>
      </button>
    </div>
  );
}
