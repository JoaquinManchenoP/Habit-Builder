import CompletionToggle from "./CompletionToggle";

export default function CardHeader({
  name,
  color,
  isCompletedToday,
  onToggleComplete,
  onOpenMenu,
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 max-[360px]:gap-3"
      onClick={onOpenMenu}
    >
      <div>
        <div className="flex items-center gap-2">
          <span
            className="h-6 w-6 rounded-md max-[360px]:h-3.5 max-[360px]:w-5"
            style={{ backgroundColor: color || "#10b981" }}
          />
          <p className=" text-lg font-semibold text-slate-900 max-[360px]:text-sm">
            {name}
          </p>
        </div>
      </div>
      <div className="mr-6 flex gap-2 max-[360px]:mr-4 max-[360px]:gap-1.5">
        {onToggleComplete ? (
          <CompletionToggle
            checked={isCompletedToday}
            onChange={onToggleComplete}
          />
        ) : null}
      </div>
    </div>
  );
}
