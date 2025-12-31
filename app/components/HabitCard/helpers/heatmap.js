import { parseISODate } from "../../../lib/analytics";
import { isActiveDay, normalizeActiveDays } from "../../../lib/habitSchedule";

const DAYS_TO_SHOW = 120;

const toLocalDate = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [_, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const buildRecentDays = (
  completions = [],
  activeDays,
  createdAt,
  goalType
) => {
  const today = new Date();
  const normalizedActiveDays = normalizeActiveDays(activeDays);
  const isWeekly = goalType === "weekly";
  const createdAtDate = createdAt ? parseISODate(createdAt) : null;
  const createdAtLocalDate = isWeekly ? toLocalDate(createdAt) : null;
  const completionSet = new Set(completions);
  return Array.from({ length: DAYS_TO_SHOW }, (_, index) => {
    const date = new Date();
    date.setDate(today.getDate() - (DAYS_TO_SHOW - 1 - index));
    const iso = date.toISOString().slice(0, 10);
    const isBeforeStart = createdAtDate ? date < createdAtDate : false;
    const isBeforeWeeklyStart = createdAtLocalDate
      ? date < createdAtLocalDate
      : false;
    const completed = isWeekly
      ? !isBeforeWeeklyStart && completionSet.has(iso)
      : completionSet.has(iso);
    const isOffDay = isWeekly
      ? !isBeforeWeeklyStart && !completed
      : !isBeforeStart && !isActiveDay(date, normalizedActiveDays);

    return {
      iso,
      label: date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      completed,
      isOffDay,
    };
  });
};

export const buildMonthAnchors = (days) => {
  const columns = Math.ceil(days.length / 7);
  if (!columns) return [];

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

  const months = Array.from(monthMap.entries()).sort(([a], [b]) => {
    const [ay, am] = a.split("-").map(Number);
    const [by, bm] = b.split("-").map(Number);
    return ay === by ? am - bm : ay - by;
  });

  return months.map(([_, entries]) => {
    const inSecondWeek = entries.find(({ date }) => {
      const dayOfMonth = date.getUTCDate();
      return dayOfMonth >= 8 && dayOfMonth <= 14;
    });
    const anchor = inSecondWeek || entries[0];
    const column = Math.floor(anchor.index / 7);
    return {
      column,
      label: anchor.date.toLocaleDateString("en", { month: "short" }),
      isEdgeStart: column === 0,
      isEdgeEnd: column === columns - 1,
    };
  });
};
