import CompletionToggle from "./CompletionToggle";
import CircularProgress from "./CircularProgress/CircularProgress";

export default function CardHeader({
  name,
  isCompletedToday,
  onToggleComplete,
  onOpenMenu,
  goalType,
  weeklyProgress,
  dailyProgress,
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
          <p className=" text-lg font-semibold text-slate-900 max-[360px]:text-sm flex ">
            {name}
          </p>
          <span className="rounded-full bg-[color:var(--app-accent)]/30 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-700">
            {habitTypeLabel}
          </span>
        </div>
      </div>
      <div className="mr-6 flex gap-2 max-[360px]:mr-4 max-[360px]:gap-1.5">
        {progress ? (
          <div
            data-habit-progress="true"
            onClick={(event) => {
              event.stopPropagation();
              progress.onIncrement?.();
            }}
            className="scale-[0.85]"
          >
            <CircularProgress
              percent={progress.percent}
              value={progress.count}
              color={progress.shade}
              showCheckmark={progress.showCheckmark}
              useCompletionColor={false}
            />
          </div>
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
