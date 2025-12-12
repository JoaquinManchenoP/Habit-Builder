import CompletionToggle from "./CompletionToggle";

export default function CardHeader({
  name,
  color,
  isCompletedToday,
  onToggleComplete,
  onOpenMenu,
}) {
  return (
    <div className="flex items-start justify-between gap-4" onClick={onOpenMenu}>
      <div>
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-6 rounded-full"
            style={{ backgroundColor: color || "#10b981" }}
          />
          <p className="text-base font-semibold text-slate-900">{name}</p>
        </div>
      </div>
      <div className="mr-6 flex gap-2">
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
