import CompletionToggle from "./CompletionToggle";
import ProgressControls from "./ProgressControls";

export default function CardHeader({
  name,
  isCompletedToday,
  onToggleComplete,
  onOpenMenu,
  goalType,
  weeklyProgress,
  dailyProgress,
  isCollapsed = false,
  onToggleCollapse,
}) {
  const habitTypeLabel = goalType === "weekly" ? "Weekly" : "Daily";
  const isWeekly = goalType === "weekly";
  const progress = isWeekly ? weeklyProgress : dailyProgress;
  return (
    <div
      className="flex items-center justify-between gap-4 max-[360px]:gap-3"
      onClick={onOpenMenu}
    >
      <div>
        <div className="flex items-center gap-2">
          {typeof onToggleCollapse === "function" ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleCollapse();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
              aria-label={
                isCollapsed ? "Expand habit card" : "Collapse habit card"
              }
            >
              <svg
                viewBox="0 0 20 20"
                className={`h-4 w-4 transition-transform ${
                  isCollapsed ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 8l5 5 5-5" />
              </svg>
            </button>
          ) : null}
          <p className=" text-lg font-semibold text-slate-900 max-[360px]:text-sm flex ">
            {name}
          </p>
          <span className="rounded-full bg-[color:var(--app-accent)]/30 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-700">
            {habitTypeLabel}
          </span>
        </div>
      </div>
      <div className="mr-2 flex gap-2 max-[360px]:mr-4 max-[360px]:gap-1.5">
        {progress ? (
          <ProgressControls progress={progress} />
        ) : onToggleComplete ? (
          <CompletionToggle
            checked={isCompletedToday}
            onChange={onToggleComplete}
          />
        ) : null}
      </div>
    </div>
  );
}
