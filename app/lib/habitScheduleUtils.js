import { WEEKDAY_ORDER } from "./habitSchedule";

const LOCAL_DAY_KEY_BY_INDEX = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const getLocalDayKey = (date = new Date()) =>
  LOCAL_DAY_KEY_BY_INDEX[date.getDay()];

export const toLocalISODate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const countCheckInsOnLocalDate = (checkIns = [], targetDate) => {
  if (!Array.isArray(checkIns) || checkIns.length === 0 || !targetDate) {
    return 0;
  }
  const targetIso = toLocalISODate(targetDate);
  return checkIns.reduce((count, isoTimestamp) => {
    const checkDate = new Date(isoTimestamp);
    if (Number.isNaN(checkDate.getTime())) return count;
    return toLocalISODate(checkDate) === targetIso ? count + 1 : count;
  }, 0);
};

export const getLastActiveDailyDate = (habit, date = new Date()) => {
  const base = new Date(date);
  base.setHours(0, 0, 0, 0);
  if (!habit?.activeDays) return base;
  for (let offset = 0; offset < 7; offset += 1) {
    const probe = new Date(base);
    probe.setDate(base.getDate() - offset);
    const key = getLocalDayKey(probe);
    if (habit.activeDays[key]) return probe;
  }
  return base;
};

export const isHabitActiveToday = (habit, date = new Date()) => {
  if (!habit?.activeDays) return false;
  if (habit.goalType === "weekly") return false;
  const key = getLocalDayKey(date);
  return Boolean(habit.activeDays[key]);
};

export const isHabitLaterThisWeek = (habit, date = new Date()) => {
  if (!habit?.activeDays) return false;
  if (habit.goalType === "weekly") return false;
  const todayKey = getLocalDayKey(date);
  const startIndex = WEEKDAY_ORDER.indexOf(todayKey);
  if (startIndex < 0) return false;
  const remainingKeys = WEEKDAY_ORDER.slice(startIndex + 1);
  return remainingKeys.some((key) => habit.activeDays[key]);
};

export const getStartOfWeekLocal = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const diffToMonday = (day + 6) % 7;
  start.setDate(start.getDate() - diffToMonday);
  return start;
};

export const countCheckInsThisWeek = (checkIns = [], date = new Date()) => {
  if (!Array.isArray(checkIns) || checkIns.length === 0) return 0;
  const start = getStartOfWeekLocal(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return checkIns.reduce((count, isoTimestamp) => {
    const checkDate = new Date(isoTimestamp);
    if (checkDate >= start && checkDate < end) {
      return count + 1;
    }
    return count;
  }, 0);
};

export const countCheckInsLast7Days = (checkIns = [], date = new Date()) => {
  if (!Array.isArray(checkIns) || checkIns.length === 0) return 0;
  const end = new Date(date);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  return checkIns.reduce((count, isoTimestamp) => {
    const checkDate = new Date(isoTimestamp);
    if (checkDate >= start && checkDate <= end) {
      return count + 1;
    }
    return count;
  }, 0);
};
