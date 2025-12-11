"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseISODate } from "../lib/analytics";

const DAYS_TO_SHOW = 120;

const buildRecentDays = (completions = []) => {
  const today = new Date();
  return Array.from({ length: DAYS_TO_SHOW }, (_, index) => {
    const date = new Date();
    date.setDate(today.getDate() - (DAYS_TO_SHOW - 1 - index));
    const iso = date.toISOString().slice(0, 10);
    const isMonthStart = date.getDate() === 1;

    return {
      iso,
      label: date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      completed: completions.includes(iso),
      monthLabel: isMonthStart
        ? date
            .toLocaleDateString("en", {
              month: "short",
            })
            .toUpperCase()
        : null,
    };
  });
};

const calculateAvailableConsistency = (habit) => {
  if (!habit) return 0;
  const today = new Date();
  const normalizedToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const createdAtDate = habit.createdAt ? parseISODate(habit.createdAt) : normalizedToday;
  const earliestCompletion = (habit.completions || []).reduce((earliest, iso) => {
    const date = parseISODate(iso);
    if (!earliest || date < earliest) return date;
    return earliest;
  }, null);
  const effectiveStart =
    earliestCompletion && earliestCompletion < createdAtDate
      ? earliestCompletion
      : createdAtDate;
  if (normalizedToday < effectiveStart) return 0;
  const totalAvailableDays =
    Math.floor(
      (normalizedToday.getTime() - effectiveStart.getTime()) / 86_400_000
    ) + 1;
  const completedDays = (habit.completions || []).filter((iso) => {
    const date = parseISODate(iso);
    return date >= effectiveStart && date <= normalizedToday;
  }).length;
  if (totalAvailableDays <= 0) return 0;
  return Math.round((completedDays / totalAvailableDays) * 100);
};

const calculateLongestStreak = (completions = []) => {
  if (!completions.length) return 0;
  const sorted = [...completions].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prevDate = new Date(sorted[i - 1]);
    const currentDate = new Date(sorted[i]);
    const diff =
      (currentDate.setUTCHours(0, 0, 0, 0) - prevDate.setUTCHours(0, 0, 0, 0)) /
      86_400_000;
    if (diff === 1) {
      current += 1;
    } else if (diff > 1) {
      current = 1;
    }
    if (current > longest) {
      longest = current;
    }
  }
  return longest;
};

const calculateStartedDaysAgo = (habit) => {
  if (!habit) return 0;
  const today = new Date();
  const normalizedToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const createdAtDate = habit.createdAt ? parseISODate(habit.createdAt) : normalizedToday;
  const earliestCompletion = (habit.completions || []).reduce((earliest, iso) => {
    const date = parseISODate(iso);
    if (!earliest || date < earliest) return date;
    return earliest;
  }, null);
  const effectiveStart =
    earliestCompletion && earliestCompletion < createdAtDate
      ? earliestCompletion
      : createdAtDate;
  const diff = normalizedToday.getTime() - effectiveStart.getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
};

const MetricCard = ({ title, value, subtitle }) => (
  <div className="flex flex-col items-center justify-center rounded-md border border-slate-300 bg-slate-50/70 p-3 text-center shadow-sm">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {title}
    </p>
    <p className="mt-1 text-2xl font-bold leading-tight text-slate-900">
      {value}
    </p>
    <p className="text-[11px] text-slate-600">{subtitle}</p>
  </div>
);

const MetricsGrid = ({ metrics }) => (
  <div className="mt-4 flex items-center justify-center">
    <div className="grid w-full grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          subtitle={metric.subtitle}
        />
      ))}
    </div>
  </div>
);

const Heatmap = ({ days, color }) => (
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

const MonthLabels = ({ days }) => {
  if (!days.length) return null;
  const columns = Math.ceil(days.length / 7);

  // Build month -> list of indices
  const monthMap = new Map();
  days.forEach((day, index) => {
    if (!day) return;
    const date = new Date(day.iso);
    const monthKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, []);
    }
    monthMap.get(monthKey).push({ index, date });
  });

  // Sort distinct months chronologically
  const months = Array.from(monthMap.entries()).sort(([a], [b]) => {
    const [ay, am] = a.split("-").map(Number);
    const [by, bm] = b.split("-").map(Number);
    return ay === by ? am - bm : ay - by;
  });

  const labels = months.map(([_, entries]) => {
    const inSecondWeek = entries.find(({ date }) => {
      const dayOfMonth = date.getUTCDate();
      return dayOfMonth >= 8 && dayOfMonth <= 14;
    });
    const anchor = inSecondWeek || entries[0];
    const column = Math.floor(anchor.index / 7);
    return {
      column,
      label: anchor.date.toLocaleDateString("en", { month: "short" }),
    };
  });

  return (
    <div
      className="grid items-center gap-x-[7px] px-[2px] text-[10px] font-semibold uppercase tracking-wide text-slate-400"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
    >
      {labels.map((item, idx) => {
        const isFirst = item.column === 0;
        const isLast = item.column === columns - 1;
        const edgePadding = isFirst ? "pl-2" : isLast ? "pr-2" : "";
        return (
          <div
            key={`${item.label}-${item.column}-${idx}`}
            style={{ gridColumn: item.column + 1 }}
            className={edgePadding}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
};

const buildCalendarWeeks = (monthDate) => {
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells = [];
  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(Date.UTC(year, month, day));
    cells.push({ iso: date.toISOString().slice(0, 10), day });
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  // Always render 6 weeks to keep the calendar height consistent month-to-month
  while (weeks.length < 6) {
    weeks.push(new Array(7).fill(null));
  }
  return weeks;
};

const Calendar = ({
  monthDate,
  selectedDate,
  onSelectDate,
  onMonthChange,
}) => {
  const weeks = useMemo(() => buildCalendarWeeks(monthDate), [monthDate]);
  const monthLabel = monthDate.toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });
  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

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

const PreviousCheckInModal = ({
  open,
  visible,
  monthDate,
  selectedDate,
  onClose,
  onConfirm,
  onSelectDate,
  onMonthChange,
}) => {
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
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-1"
        }`}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Add previous check in
            </h2>
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
};

const CompletionToggle = ({ checked, onChange }) => (
  <input
    type="checkbox"
    checked={checked}
    onClick={(event) => event.stopPropagation()}
    onChange={(event) => {
      event.stopPropagation();
      onChange(event.target.checked);
    }}
    className="grid h-9 w-9 place-items-center rounded-xl border border-slate-300 bg-white text-sm font-bold text-white transition
               appearance-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500
               checked:border-green-600 checked:bg-green-600 checked:before:content-['✓']"
    aria-label="Mark habit completed"
  />
);

const CardHeader = ({
  name,
  color,
  isCompletedToday,
  onToggleComplete,
  onOpenMenu,
}) => (
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

const CompletionOverlay = () => (
  <div className="pointer-events-none absolute inset-0 z-30 rounded-lg bg-slate-900/30 transition-opacity duration-200 group-hover:opacity-0" />
);

export default function HabitCard({
  habit,
  onDelete,
  onComplete,
  isCompletedToday = false,
  isFading = false,
  cardRef = null,
}) {
  const router = useRouter();
  const internalRef = useRef(null);
  const [menu, setMenu] = useState({ open: false, visible: false, x: 0, y: 0 });
  const menuRef = useRef(null);
  const [isBackfillOpen, setIsBackfillOpen] = useState(false);
  const [isBackfillVisible, setIsBackfillVisible] = useState(false);
  const [selectedBackfillDate, setSelectedBackfillDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  });
  const days = useMemo(
    () => buildRecentDays(habit.completions || []),
    [habit.completions]
  );
  const consistencyPercent = useMemo(
    () => calculateAvailableConsistency(habit),
    [habit]
  );
  const longestStreak = useMemo(
    () => calculateLongestStreak(habit.completions || []),
    [habit.completions]
  );
  const startedDaysAgo = useMemo(() => calculateStartedDaysAgo(habit), [habit]);
  const totalCheckIns = habit.completions?.length || 0;

  const metrics = [
    {
      title: "Consistency",
      value: `${consistencyPercent}%`,
      subtitle: "of days",
    },
    {
      title: "Longest streak",
      value: `${longestStreak}`,
      subtitle: `${longestStreak === 1 ? "day" : "days"}`,
    },
    { title: "Started", value: `${startedDaysAgo}`, subtitle: "days ago" },
    {
      title: "Total check-ins",
      value: `${totalCheckIns}`,
      subtitle: "all time",
    },
  ];

  const openMenu = (event) => {
    if (!internalRef.current) return;
    if (event.target.closest("input[type='checkbox']")) return;
    event.stopPropagation();
    const rect = internalRef.current.getBoundingClientRect();
    setMenu({
      open: true,
      visible: true,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const closeMenu = () => {
    setMenu((prev) => ({ ...prev, visible: false }));
    setTimeout(() => setMenu({ open: false, visible: false, x: 0, y: 0 }), 200);
  };

  const openBackfillModal = () => {
    const today = new Date();
    setSelectedBackfillDate(today.toISOString().slice(0, 10));
    setCalendarMonth(
      new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
    );
    setIsBackfillOpen(true);
    setIsBackfillVisible(false);
    requestAnimationFrame(() => setIsBackfillVisible(true));
  };

  const closeBackfillModal = () => {
    setIsBackfillVisible(false);
    setTimeout(() => {
      setIsBackfillOpen(false);
      setSelectedBackfillDate(null);
    }, 300);
  };

  useEffect(() => {
    if (!menu.open) return;
    const handleClickAway = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [menu.open]);

  const handleEdit = () => {
    router.push(`/habits/${habit.id}`);
    closeMenu();
  };

  const handleDelete = () => {
    onDelete?.(habit.id);
    closeMenu();
  };

  const handleAddPreviousCheckIn = (isoDate) => {
    if (!isoDate) return;
    onComplete?.(habit.id, true, isoDate);
    closeBackfillModal();
  };

  const handleOpenPreviousCheckIn = () => {
    closeMenu();
    openBackfillModal();
  };

  const handleMonthChange = (offset) => {
    setCalendarMonth((prev) => {
      const next = new Date(
        Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + offset, 1)
      );
      return next;
    });
  };

  return (
    <>
      <div
        ref={(node) => {
          internalRef.current = node;
          if (typeof cardRef === "function") {
            cardRef(node);
          } else if (cardRef && "current" in cardRef) {
            cardRef.current = node;
          }
        }}
        className={`group relative grid h-[370px] grid-rows-[2fr_4fr_4fr] rounded-2xl border border-slate-200 p-5 shadow-md transform origin-center transition ${
          isFading
            ? "pointer-events-none opacity-0 scale-95 transition-all duration-[400ms] ease-out"
            : "opacity-100 transform hover:scale-[1.02] active:scale-[0.99]"
        }`}
      >
        {/* Scale inner content instead of the outer card so layout stays stable when completed */}
        <div
          className={` pt-3 relative flex h-full w-full flex-col origin-center transition-transform ${
            isCompletedToday ? "scale-[0.97] group-hover:scale-100" : "scale-100"
          }`}
        >
          <CardHeader
            name={habit.name}
            color={habit.color}
            isCompletedToday={isCompletedToday}
            onToggleComplete={(next) => onComplete?.(habit.id, next)}
            onOpenMenu={(event) => {
              // Ignore clicks originating from the toggle
              if (event.target.closest("input[type='checkbox']")) return;
              openMenu(event);
            }}
          />
          <MetricsGrid metrics={metrics} />
          <Heatmap days={days} color={habit.color} />
        </div>
        {isCompletedToday ? <CompletionOverlay /> : null}
        {menu.open ? (
          <div
            ref={menuRef}
            style={{ top: menu.y, left: menu.x }}
          className={`absolute z-40 w-48 origin-top-left rounded-lg border border-slate-200 bg-white shadow-lg transition duration-300 ease-out ${
              menu.visible
                ? "opacity-100 scale-100 translate-y-1"
                : "opacity-0 scale-95 translate-y-2"
            }`}
          >
            <button
              type="button"
              className="block w-full px-4 py-2 text-left text-sm text-slate-800 transition hover:bg-slate-50"
              onClick={(event) => {
                event.stopPropagation();
                handleOpenPreviousCheckIn();
              }}
            >
              Add previous check in
            </button>
            <button
              type="button"
              className="block w-full px-4 py-2 text-left text-sm text-slate-800 transition hover:bg-slate-50"
              onClick={(event) => {
                event.stopPropagation();
                handleEdit();
              }}
            >
              Edit habit
            </button>
            <button
              type="button"
              className="block w-full px-4 py-2 text-left text-sm text-red-700 transition hover:bg-red-50"
              onClick={(event) => {
                event.stopPropagation();
                handleDelete();
              }}
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>
      <PreviousCheckInModal
        open={isBackfillOpen}
        visible={isBackfillVisible}
        monthDate={calendarMonth}
        selectedDate={selectedBackfillDate}
        onClose={closeBackfillModal}
        onConfirm={handleAddPreviousCheckIn}
        onSelectDate={setSelectedBackfillDate}
        onMonthChange={handleMonthChange}
      />
    </>
  );
}
